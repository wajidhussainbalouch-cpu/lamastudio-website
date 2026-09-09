const SchoolStore = {
    getActive() {
        const stored = localStorage.getItem('active_school_session');
        return stored ? JSON.parse(stored) : null;
    },

    setActive(schoolObj) {
        localStorage.setItem('active_school_session', JSON.stringify(schoolObj));
        localStorage.setItem('active_tenant_id', schoolObj.id);
    },

    async upsert(schoolData) {
        // 1. Try cloud registration
        const result = await ApiClient.register(schoolData);
        if (result.status === "success") {
            schoolData.id = result.schoolId;
            this.setActive(schoolData);
            return { success: true, school: schoolData };
        } else {
            return { success: false, message: result.message };
        }
    },

    async authenticate(username, password) {
        const result = await ApiClient.login(username, password);
        if (result.status === "success") {
            this.setActive(result.school);
            return { success: true };
        }
        return { success: false, message: result.message };
    },

    deriveShortCode(name) {
        if (!name) return "SCH";
        return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4);
    }
};
