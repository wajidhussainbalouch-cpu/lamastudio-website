/**
 * lamastudio.pk - Cloud API Client for School Suite
 * Clean, production-ready bridge for Google Apps Script Web App.
 */

const ApiClient = (() => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKX6oxKJH98jfdMOJt9597AKG4T6yBNttfTuO3eUtgLizdVmHKGZL6fEXyn3xYJ_ydBQ/exec";

    const isConfigured = () => WEB_APP_URL && !WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT");

    async function getData(id) {
        if (!isConfigured()) return null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${WEB_APP_URL}?action=get&id=${encodeURIComponent(id)}`, {
                method: "GET",
                mode: "cors",
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            return await response.json();
        } catch (error) {
            console.warn("ApiClient getData warning:", error.message);
            return null;
        }
    }

    async function getAll() {
        if (!isConfigured()) return [];

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${WEB_APP_URL}?action=getAll`, {
                method: "GET",
                mode: "cors",
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            return Array.isArray(result) ? result : (result.data || []);
        } catch (error) {
            console.warn("ApiClient getAll warning:", error.message);
            return [];
        }
    }

    async function saveData(payload) {
        if (!isConfigured()) {
            return { status: "error", message: "API URL not configured" };
        }

        try {
            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            console.error("ApiClient saveData error:", error);
            return { status: "error", message: error.message };
        }
    }

    return { getData, getAll, saveData };
})();
