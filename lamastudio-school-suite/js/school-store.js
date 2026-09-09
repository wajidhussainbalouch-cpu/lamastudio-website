/**
 * Lamastudio.pk - School Storage & Session Engine
 * Manages active tenant sessions and syncs with cloud backend
 */

const SchoolStore = {
    // Get the currently active logged-in school session
    getActive() {
        const stored = localStorage.getItem('active_school_session');
        return stored ? JSON.parse(stored) : null;
    },

    // Set the active school session locally
    setActive(schoolObj) {
        localStorage.setItem('active_school_session', JSON.stringify(schoolObj));
        localStorage.setItem('active_tenant_id', schoolObj.id);
    },

    // Clear active session on logout
    clearActive() {
        localStorage.removeItem('active_school_session');
        localStorage.removeItem('active_tenant_id');
    },

    // Register a new school via cloud API
    async upsert(schoolData) {
        const result = await ApiClient.register(schoolData);
        if (result.status === "success") {
            schoolData.id = result.schoolId;
            this.setActive(schoolData);
            return { success: true, school: schoolData };
        }
        return { success: false, message: result.message || "Registration failed." };
    },

    // Authenticate existing school via cloud API
    async authenticate(username, password) {
        const result = await ApiClient.login(username, password);
        if (result.status === "success") {
            this.setActive(result.school);
            return { success: true };
        }
        return { success: false, message: result.message || "Invalid credentials." };
    },

    // Automatically derive a 3-4 letter short code from school name
    deriveShortCode(name) {
        if (!name) return "SCH";
        return name
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .substring(0, 4);
    }
};
