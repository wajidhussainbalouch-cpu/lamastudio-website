/**
 * Lamastudio Cloud API Client for School Suite
 * Configured with live backend endpoint and safety fallbacks.
 */

const ApiClient = (() => {
    // Active deployed Google Apps Script Web App URL
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKX6oxKJH98jfdMOJt9597AKG4T6yBNttfTuO3eUtgLizdVmHKGZL6fEXyn3xYJ_ydBQ/exec";

    async function getData(id) {
        try {
            if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
                console.warn("ApiClient: URL not configured. Using local session data.");
                return null;
            }

            // Timeout controller to prevent hanging if the network is slow
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${WEB_APP_URL}?action=get&id=${encodeURIComponent(id)}`, {
                method: "GET",
                mode: "cors",
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.warn("ApiClient getData warning (falling back to local):", error.message);
            return null;
        }
    }

    async function getAll() {
        try {
            if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
                return [];
            }

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
        try {
            if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
                return { status: "error", message: "API URL not configured" };
            }

            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            console.error("ApiClient saveData error:", error);
            return { status: "error", message: error.message };
        }
    }

    return {
        getData,
        getAll,
        saveData
    };
})();
