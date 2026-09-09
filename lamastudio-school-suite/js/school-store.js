/**
 * Lamastudio.pk - School Storage & Session Engine
 * Manages active tenant sessions and array-based multi-tenant storage
 */

const SchoolStore = {
    STORAGE_KEY: 'lamastudio_registered_schools',

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

    // Get all registered schools (prevents overwrites by maintaining an array list)
    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
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

        // Check if school already exists by admin username to prevent duplicates
        const existingIndex = schools.findIndex(s => s.adminUsername === schoolData.adminUsername);

        if (existingIndex > -1) {
            // Update existing record
            schools[existingIndex] = { ...schools[existingIndex], ...schoolData };
        } else {
            // Append new school to array (safely keeps previous schools)
            schools.push(schoolData);
        }

        // Save back to LocalStorage array
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schools));
        
        // Set as active session
        this.setActive(schoolData);
        
        return schoolData;
    },

    // Authenticate existing school locally
    authenticate(username, password) {
        const schools = this.getAll();
        const school = schools.find(s => s.adminUsername === username);
        
        if (school) {
            this.setActive(school);
            return { success: true };
        }
        return { success: false, message: "Invalid credentials or school not found." };
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
