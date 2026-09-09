const LAMASTUDIO_API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"; // Paste your deployment URL here

const ApiClient = {
    async register(schoolData) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "register", data: schoolData })
            });
            return await response.json();
        } catch (e) {
            console.error("Cloud registration failed, falling back to local storage", e);
            return { status: "error", message: e.toString() };
        }
    },

    async login(username, password) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "login", credentials: { username, password } })
            });
            return await response.json();
        } catch (e) {
            console.error("Cloud login failed", e);
            return { status: "error", message: e.toString() };
        }
    },

    async syncData(schoolId, data) {
        try {
            await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "saveData", schoolId, data })
            });
        } catch (e) {
            console.error("Background sync failed", e);
        }
    }
};
