package pk.lamastudio.codingacademy.testing;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Local-first Android QA wrapper, NOT the production/release application.
 * Serves only packaged Coding Academy static assets on a secure virtual origin.
 * No API tokens, account passwords, Supabase keys or real student records are bundled.
 */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String PREFIX = "/assets/coding-academy/";
    private static final String START = "https://" + HOST + PREFIX + "index.html";
    private static final int OPEN_FILE = 1201;
    private static final int SAVE_FILE = 1202;
    // Must exceed the complete Academy backup's 1.1 MB JSON cap.
    private static final int MAX_DOWNLOAD_BYTES = 1200 * 1024;
    private WebView browser;
    private ProgressBar progress;
    private ValueCallback<Uri[]> chooseFile;
    private byte[] pendingFileBytes;
    private String pendingFilename;
    private String pendingNonce;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(11, 27, 42));
        getWindow().setNavigationBarColor(Color.rgb(11, 27, 42));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(11, 27, 42));

        TextView notice = new TextView(this);
        notice.setText("LAMA CODING ACADEMY · ANDROID TEST BUILD");
        notice.setTextColor(Color.rgb(13, 45, 36));
        notice.setBackgroundColor(Color.rgb(108, 230, 191));
        notice.setTextSize(11f);
        notice.setGravity(android.view.Gravity.CENTER);
        int padding = (int) (6f * getResources().getDisplayMetrics().density);
        notice.setPadding(padding, padding, padding, padding);
        root.addView(notice, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setVisibility(View.GONE);
        root.addView(progress, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, (int) (3f * getResources().getDisplayMetrics().density)));

        if (Build.VERSION.SDK_INT >= 24) {
            // A service worker must be able to request the same packaged assets
            // without falling through to a real network lookup for the virtual host.
            ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    return packagedAsset(request.getUrl());
                }
            });
        }

        browser = new WebView(this);
        browser.setBackgroundColor(Color.rgb(8, 14, 27));
        browser.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return packagedAsset(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri = request.getUrl();
                if (HOST.equals(uri.getHost()) && "https".equals(uri.getScheme()) &&
                        (uri.getPath() != null && uri.getPath().startsWith(PREFIX))) {
                    return false;
                }
                // Existing LAMA site link in the PWA points one directory higher.
                if (HOST.equals(uri.getHost()) && "/assets/index.html".equals(uri.getPath())) {
                    openExternal(Uri.parse("https://www.lamastudio.pk/"));
                    return true;
                }
                if ("https".equals(uri.getScheme()) || "mailto".equals(uri.getScheme()) ||
                        "tel".equals(uri.getScheme())) {
                    openExternal(uri);
                }
                return true;
            }
        });
        browser.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value);
                progress.setVisibility(value >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView web, ValueCallback<Uri[]> callback,
                                              FileChooserParams params) {
                if (chooseFile != null) chooseFile.onReceiveValue(null);
                chooseFile = callback;
                try {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivityForResult(intent, OPEN_FILE);
                    return true;
                } catch (Exception error) {
                    chooseFile = null;
                    message("No file picker is available on this device.");
                    return false;
                }
            }
        });

        WebSettings settings = browser.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        WebView.setWebContentsDebuggingEnabled(false);

        // Only receives a one-time random nonce generated after the user
        // explicitly presses a download link. No arbitrary file reading API.
        browser.addJavascriptInterface(new DownloadBridge(), "LamaTestSave");
        browser.setDownloadListener((url, userAgent, contentDisposition, mimeType, length) ->
                handleDownload(url, contentDisposition, mimeType));

        root.addView(browser, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        setContentView(root);
        browser.loadUrl(START);
    }

    private WebResourceResponse packagedAsset(Uri uri) {
        if (uri == null || !"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())) return null;
        String pathname = uri.getEncodedPath();
        if (pathname == null) return null;
        if (!(pathname.startsWith(PREFIX) || pathname.equals(PREFIX.substring(0, PREFIX.length() - 1))))
            return null;

        String filename = pathname.startsWith(PREFIX) ? pathname.substring(PREFIX.length()) : "";
        if (filename.isEmpty()) filename = "index.html";
        // All packaged assets are flat files; reject traversal, nested paths and encoding.
        if (!filename.matches("[A-Za-z0-9._-]+") || filename.contains("..") ||
                filename.startsWith(".")) return assetNotFound();
        try {
            InputStream input = getAssets().open("coding-academy/" + filename);
            Map<String, String> headers = new HashMap<>();
            headers.put("X-Content-Type-Options", "nosniff");
            headers.put("Cache-Control", uri.getEncodedQuery() == null
                    ? "public, max-age=3600" : "no-store");
            return new WebResourceResponse(mime(filename), "UTF-8", 200, "OK", headers, input);
        } catch (Exception exception) {
            return assetNotFound();
        }
    }

    private WebResourceResponse assetNotFound() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                new HashMap<>(), new ByteArrayInputStream("Not found".getBytes()));
    }

    private String mime(String filename) {
        if (filename.endsWith(".html")) return "text/html";
        if (filename.endsWith(".mjs") || filename.endsWith(".js")) return "text/javascript";
        if (filename.endsWith(".webmanifest") || filename.endsWith(".json"))
            return "application/json";
        if (filename.endsWith(".svg")) return "image/svg+xml";
        if (filename.endsWith(".css")) return "text/css";
        if (filename.endsWith(".py")) return "text/plain";
        return "application/octet-stream";
    }

    private void handleDownload(String url, String disposition, String mimeType) {
        if (url == null) return;
        if (!url.startsWith("blob:")) {
            if (url.startsWith("https://")) openExternal(Uri.parse(url));
            else message("Unsupported download URL in this test version.");
            return;
        }
        String filename = URLUtil.guessFileName(url, disposition, mimeType);
        if (filename == null || (!filename.endsWith(".json") && !filename.endsWith(".py") &&
                !filename.endsWith(".html") && !filename.endsWith(".txt"))) {
            filename = "lama-coding-academy-export.json";
        }
        final String safeName = cleanFilename(filename);
        final String nonce = UUID.randomUUID().toString();
        pendingNonce = nonce;
        // The browser owns this blob. Read it only in the top-level Academy
        // origin and pass it to the Android system document save picker.
        String js = "(async function(){try{"
                + "const r=await fetch(" + JSONObject.quote(url) + ");"
                + "const data=new Uint8Array(await r.arrayBuffer());"
                + "if(data.length>" + MAX_DOWNLOAD_BYTES + ")throw new Error('File exceeds test size limit');"
                + "let s='';for(let i=0;i<data.length;i+=8192){"
                + "s+=String.fromCharCode.apply(null,data.slice(i,i+8192));}"
                + "LamaTestSave.save(" + JSONObject.quote(nonce) + ","
                + JSONObject.quote(safeName) + ",btoa(s));"
                + "}catch(e){LamaTestSave.fail(" + JSONObject.quote(nonce)
                + ",String(e).slice(0,160));}})();";
        browser.evaluateJavascript(js, null);
    }

    private static String cleanFilename(String input) {
        String cleaned = input.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (cleaned.length() > 90) cleaned = cleaned.substring(cleaned.length() - 90);
        if (cleaned.isEmpty()) cleaned = "academy-export.json";
        return cleaned;
    }

    private final class DownloadBridge {
        @JavascriptInterface
        public void save(String nonce, String filename, String base64) {
            runOnUiThread(() -> {
                if (!nonce.equals(pendingNonce)) return;
                pendingNonce = null;
                if (base64 == null || base64.length() > 1700000) {
                    message("This file is too large to export from the test app.");
                    return;
                }
                try {
                    byte[] data = Base64.decode(base64, Base64.DEFAULT);
                    if (data.length > MAX_DOWNLOAD_BYTES) throw new IllegalArgumentException();
                    pendingFileBytes = data;
                    pendingFilename = cleanFilename(filename);
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType(pendingFilename.endsWith(".json") ? "application/json" :
                            pendingFilename.endsWith(".html") ? "text/html" : "text/plain");
                    intent.putExtra(Intent.EXTRA_TITLE, pendingFilename);
                    startActivityForResult(intent, SAVE_FILE);
                } catch (Exception exception) {
                    pendingFileBytes = null;
                    message("Cannot open Android's file-save picker.");
                }
            });
        }

        @JavascriptInterface
        public void fail(String nonce, String reason) {
            runOnUiThread(() -> {
                if (!nonce.equals(pendingNonce)) return;
                pendingNonce = null;
                message("Export failed: " + (reason == null ? "unknown reason" :
                        reason.substring(0, Math.min(reason.length(), 120))));
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == OPEN_FILE) {
            if (chooseFile != null) {
                Uri[] result = resultCode == RESULT_OK && data != null && data.getData() != null
                        ? new Uri[]{data.getData()} : null;
                chooseFile.onReceiveValue(result);
                chooseFile = null;
            }
        } else if (requestCode == SAVE_FILE) {
            try {
                if (resultCode == RESULT_OK && data != null && data.getData() != null
                        && pendingFileBytes != null) {
                    try (OutputStream stream = getContentResolver().openOutputStream(data.getData())) {
                        if (stream == null) throw new IllegalStateException("No output stream");
                        stream.write(pendingFileBytes);
                    }
                    message("Saved " + pendingFilename + " using Android Files.");
                }
            } catch (Exception exception) {
                message("File could not be saved. Please try again.");
            } finally {
                pendingFileBytes = null;
                pendingFilename = null;
            }
        }
    }

    private void openExternal(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException error) {
            message("No Android app is available to open this link.");
        }
    }

    private void message(String text) {
        Toast.makeText(this, text, Toast.LENGTH_LONG).show();
    }

    @Override
    public void onBackPressed() {
        if (browser != null && browser.canGoBack()) browser.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (chooseFile != null) {
            chooseFile.onReceiveValue(null);
            chooseFile = null;
        }
        if (browser != null) browser.destroy();
        super.onDestroy();
    }
}
