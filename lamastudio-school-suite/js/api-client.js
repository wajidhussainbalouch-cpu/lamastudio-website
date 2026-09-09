/**
 * Lamastudio.pk - Cloud API Client
 * Connects frontend storage engines to Google Apps Script Backend
 */

const LAMASTUDIO_API_URL = "https://script.google.com/macros/s/AKfycbwA2f1aw--ltFn-mQRCYrP2WGbQIGtsDYvW-ynEq--gFdP3oyKtzTsxXmdHrh0eXHas0g/exec";

const ApiClient = {
    // --- School Registration ---
    async register(schoolData) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "register", data: schoolData })
            });
            return await response.json();
        } catch (e) {
            console.error("Cloud registration failed:", e);
            return { status: "error", message: e.toString() };
        }
    },

    // --- School Login ---
    async login(username, password) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "login", credentials: { username, password } })
            });
            return await response.json();
        } catch (e) {
            console.error("Cloud login failed:", e);
            return { status: "error", message: e.toString() };
        }
    },

    // --- Save / Sync Live School Data ---
    async syncData(schoolId, data) {
        try {
            await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "saveData", schoolId, data })
            });
        } catch (e) {
            console.error("Background sync failed:", e);
        }
    },

    // --- Get School Live Data ---
    async getData(schoolId) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "getData", schoolId })
            });
            return await response.json();
        } catch (e) {
            console.error("Failed to fetch school data:", e);
            return { status: "error", data: {} };
        }
    },

    // --- Super Admin Authentication ---
    async superAdminLogin(username, password) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "superAdminLogin", credentials: { username, password } })
            });
            return await response.json();
        } catch (e) {
            console.error("Super Admin login failed:", e);
            return { status: "error", message: e.toString() };
        }
    },

    // --- Super Admin: Fetch All Registered Schools ---
    async getAllSchools() {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "getAllSchools" })
            });
            return await response.json();
        } catch (e) {
            console.error("Failed to fetch schools list:", e);
            return { status: "error", schools: [] };
        }
    },

    // --- Super Admin: Reset School Password ---
    async resetSchoolPassword(schoolId, newPassword) {
        try {
            const response = await fetch(LAMASTUDIO_API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "resetPassword", schoolId, newPassword })
            });
            return await response.json();
        } catch (e) {
            console.error("Password reset failed:", e);
            return { status: "error", message: e.toString() };
        }
    }
};
