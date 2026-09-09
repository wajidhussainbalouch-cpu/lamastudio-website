/**
 * Lamastudio.pk - School Storage & Session Engine (v2.6)
 * Manages multi-tenant cloud storage, tenant isolation, and Master Super Admin telemetry.
 */

const SchoolStore = {
    STORAGE_KEY: 'lamastudio_registered_schools',
    SUPER_SESSION_KEY: 'lamastudio_super_logged_in',

    // Initialize default master credentials if they don't exist yet
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            // Seed a default demo tenant to prevent empty arrays on fresh install
            const defaultSchool = {
                id: 'SCH-DEMO-01',
                name: 'Aims National Model School',
                shortCode: 'AIMS',
                adminUsername: 'aims_admin',
                adminPassword: 'password123',
                email: 'admin@aims.edu.pk',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([defaultSchool]));
        }
    },

    // --- TENANT SESSION MANAGEMENT ---

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

    // --- SUPER ADMIN SESSION MANAGEMENT ---

    isSuperLoggedIn() {
        return localStorage.getItem(this.SUPER_SESSION_KEY) === 'true';
    },

    authenticateSuper(username, password) {
        // Master hardcoded fallback credentials for Super Admin Gateway
        if (username === 'admin' && password === 'password') {
            localStorage.setItem(this.SUPER_SESSION_KEY, 'true');
            return { success: true };
        }
        return { success: false, message: "Invalid Master Credentials." };
    },

    clearSuperSession() {
        localStorage.removeItem(this.SUPER_SESSION_KEY);
    },

    // --- MULTI-TENANT DATABASE ACTIONS ---

    // Get all registered schools safely
    getAll() {
        this.init();
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error reading SchoolStore data:", e);
            return [];
        }
    },

    // Register or update a school in the local multi-tenant store
    upsert(schoolData) {
        const schools = this.getAll();
        
        // Generate a unique ID if it doesn't exist
        if (!schoolData.id) {
            schoolData.id = 'SCH-' + Date.now();
        }

        if (!schoolData.createdAt) {
            schoolData.createdAt = new Date().toISOString();
        }

        // Check if school already exists by admin username or short code
        const existingIndex = schools.findIndex(s => s.adminUsername === schoolData.adminUsername);

        if (existingIndex > -1) {
            // Update existing record safely
            schools[existingIndex] = { ...schools[existingIndex], ...schoolData };
        } else {
            // Append new school to array
            schools.push(schoolData);
        }

        // Save back to LocalStorage array
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schools));
        
        // Set as active session automatically
        this.setActive(schoolData);
        
        return schoolData;
    },

    // Delete a school tenant (Super Admin feature)
    deleteTenant(tenantId) {
        let schools = this.getAll();
        schools = schools.filter(s => s.id !== tenantId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schools));
        
        // If the active session was this deleted tenant, clear session
        const active = this.getActive();
        if (active && active.id === tenantId) {
            this.clearActive();
        }
        return true;
    },

    // Authenticate existing school locally
    authenticate(username, password) {
        const schools = this.getAll();
        const school = schools.find(s => s.adminUsername === username && s.adminPassword === password);
        
        if (school) {
            this.setActive(school);
            return { success: true, school };
        }
        return { success: false, message: "Invalid username or password, or school not found." };
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

// Run auto-initialization on load
SchoolStore.init();
