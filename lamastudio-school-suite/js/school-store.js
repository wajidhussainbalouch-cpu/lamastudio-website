/**
 * Lamastudio.pk - School Storage & Session Engine (v2.7 Cloud Edition)
 * Manages multi-tenant cloud synchronization, tenant isolation, and Master Super Admin telemetry via Google Sheets.
 */

const SchoolStore = {
    SUPER_SESSION_KEY: 'lamastudio_super_logged_in',

    // --- TENANT SESSION MANAGEMENT ---

    // Get the currently active logged-in school session
    getActive() {
        const stored = localStorage.getItem('active_school_session');
        return stored ? JSON.parse(stored) : null;
    },

    // Set the active school session locally
    setActive(schoolObj) {
        localStorage.setItem('active_school_session', JSON.stringify(schoolObj));
        localStorage.setItem('active_tenant_id', schoolObj.schoolCodeId || schoolObj["School Code / ID"] || '');
    },

    // Clear active session on logout
    clearActive() {
        localStorage.removeItem('active_school_session');
        localStorage.removeItem('active_tenant_id');
    },

    // --- SUPER ADMIN SESSION MANAGEMENT ---

    isSuperLoggedIn() {
        return localStorage.getItem('super_admin_session') === 'true' || localStorage.getItem(this.SUPER_SESSION_KEY) === 'true';
    },

    authenticateSuper(username, password) {
        if (username === 'admin@lamastudio.pk' && password === 'master123') {
            localStorage.setItem('super_admin_session', 'true');
            localStorage.setItem(this.SUPER_SESSION_KEY, 'true');
            return { success: true };
        }
        return { success: false, message: "Invalid Master Credentials." };
    },

    clearSuperSession() {
        localStorage.removeItem('super_admin_session');
        localStorage.removeItem(this.SUPER_SESSION_KEY);
    },

    // --- MULTI-TENANT CLOUD DATABASE ACTIONS ---

    // Get all registered schools from Google Sheets via ApiClient
    async getAll() {
        try {
            return await ApiClient.getAll();
        } catch (e) {
            console.error("Error fetching schools from cloud:", e);
            return [];
        }
    },

    // Register a new school directly to Google Sheets Cloud
    async upsert(schoolData) {
        try {
            // Generate ID/Code if missing
            if (!schoolData.schoolCodeId) {
                schoolData.schoolCodeId = 'SCH-' + Date.now();
            }

            const response = await ApiClient.saveData(schoolData);
            
            if (response && response.status === "success") {
                this.setActive(schoolData);
                return { success: true, school: schoolData };
            } else {
                return { success: false, message: response.message || "Cloud registration failed." };
            }
        } catch (e) {
            console.error("Upsert failed:", e);
            return { success: false, message: e.toString() };
        }
    },

    // Authenticate existing school against cloud records
    async authenticate(username, password) {
        try {
            const schools = await this.getAll();
            
            // Match against both camelCase keys and sheet headers for robust compatibility
            const school = schools.find(s => {
                const mail = s.adminEmail || s["Admin Email"] || "";
                const code = s.schoolCodeId || s["schoolCodeId"] || "";
                const pwd = s.adminPassword || s["Password"] || s["adminPassword"] || "";

                const matchesUser = (mail.toLowerCase() === username.toLowerCase() || code.toLowerCase() === username.toLowerCase());
                const matchesPass = (pwd === password);

                return matchesUser && matchesPass;
            });
            
            if (school) {
                if (school.status && school.status !== "Active") {
                    return { success: false, message: "Account is inactive or pending approval." };
                }
                this.setActive(school);
                return { success: true, school };
            }
            return { success: false, message: "Invalid email/school code or password." };
        } catch (e) {
            console.error("Authentication error:", e);
            return { success: false, message: e.toString() };
        }
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
