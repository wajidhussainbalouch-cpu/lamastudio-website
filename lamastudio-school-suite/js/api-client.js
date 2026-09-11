/**
 * Lamastudio Cloud API Client for School Suite
 * Connects frontend views to the Google Apps Script backend Web App.
 */

const ApiClient = (() => {
    // Replace this placeholder with your actual deployed Google Apps Script Web App URL
    const WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

    /**
     * Fetch a specific school or record by ID/Email
     * @param {string} id - The school code, ID, or admin email
     */
    async function getData(id) {
        try {
            if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
                console.warn("ApiClient: WEB_APP_URL is not configured. Falling back to local cache.");
                return null;
            }

            const response = await fetch(`${WEB_APP_URL}?action=get&id=${encodeURIComponent(id)}`, {
                method: "GET",
                mode: "cors"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("ApiClient getData error:", error);
            return null;
        }
    }

    /**
     * Fetch all school records from the Google Sheet database
     */
    async function getAll() {
        try {
            if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
                console.warn("ApiClient: WEB_APP_URL is not configured. Falling back to local cache.");
                return [];
            }

            const response = await fetch(`${WEB_APP_URL}?action=getAll`, {
                method: "GET",
                mode: "cors"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Handle if data is wrapped inside a data property or returned as a raw array
            return Array.isArray(result) ? result : (result.data || []);
        } catch (error) {
            console.error("ApiClient getAll error:", error);
            return [];
        }
    }

    /**
     * Save or update school/student data back to the Google Sheet
     * @param {Object} payload - The data object to save
     */
    async function saveData(payload) {
        try {
            if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
                console.warn("ApiClient: WEB_APP_URL is not configured.");
                return { status: "error", message: "API URL not configured" };
            }

            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8" // Avoids CORS preflight issues with Google Apps Script
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("ApiClient saveData error:", error);
            return { status: "error", message: error.message };
        }
    }

    // Public API Methods
    return {
        getData,
        getAll,
        saveData
    };
})();
