/**
 * LamaStudio School Suite — Shared Multi-School Storage Module
 * -------------------------------------------------------------
 * Single source of truth for reading/writing school data in LocalStorage.
 * Include this file BEFORE any page-specific <script> that needs school data:
 *
 *   <script src="school-store.js"></script>
 *
 * Storage shape:
 *   lamastudio_school_accounts  -> Array<School>   (master list, never overwritten wholesale)
 *   activeSchoolId              -> string           (id of the currently selected school)
 *   activeSchoolConfig          -> School            (denormalized copy of the active school,
 *                                                      kept in sync automatically — safe to read
 *                                                      directly for fast page loads)
 *
 * A School object can hold any fields you need (name, shortCode, address, phone,
 * logo, type, level, principal, enrollment, ...). Only `id` and `name` are required.
 */
const SchoolStore = (function () {
    const KEY_SCHOOLS = 'lamastudio_school_accounts';
    const KEY_ACTIVE_ID = 'activeSchoolId';
    const KEY_ACTIVE_CONFIG = 'activeSchoolConfig';

    // Legacy single-school keys this app used before the multi-school array existed.
    // Read once to migrate old data — never written to again.
    const LEGACY_KEYS = {
        name: 'lamastudio_registered_school',
        address: 'lamastudio_school_address',
        phone: 'lamastudio_school_phone',
        logo: 'lamastudio_school_logo',
        type: 'lamastudio_school_type',
        level: 'lamastudio_school_level',
        principal: 'lamastudio_principal',
        enrollment: 'lamastudio_enrollment'
    };

    function safeParse(raw, fallback) {
        if (!raw) return fallback;
        try {
            const parsed = JSON.parse(raw);
            return parsed === null || parsed === undefined ? fallback : parsed;
        } catch (e) {
            console.warn('SchoolStore: corrupt JSON in storage, resetting.', e);
            return fallback;
        }
    }

    function getAll() {
        const schools = safeParse(localStorage.getItem(KEY_SCHOOLS), []);
        return Array.isArray(schools) ? schools : [];
    }

    function saveAll(schools) {
        localStorage.setItem(KEY_SCHOOLS, JSON.stringify(schools));
    }

    function slugify(name) {
        return String(name || 'school')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'school';
    }

    function generateId(name) {
        return `sch_${slugify(name)}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
    }

    function deriveShortCode(name) {
        return String(name || 'SCH')
            .split(/\s+/)
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 3) || 'SCH';
    }

    /**
     * Add a new school OR update an existing one in place.
     * Matching priority: explicit `id` first, then case-insensitive `name`.
     * Never erases other entries in the array.
     */
    function upsert(schoolData) {
        if (!schoolData || !schoolData.name || !schoolData.name.trim()) {
            throw new Error('SchoolStore.upsert: a school "name" is required.');
        }
        const schools = getAll();
        let idx = -1;

        if (schoolData.id) {
            idx = schools.findIndex(s => s.id === schoolData.id);
        }
        if (idx === -1) {
            const nameLower = schoolData.name.trim().toLowerCase();
            idx = schools.findIndex(s => (s.name || '').trim().toLowerCase() === nameLower);
        }

        let school;
        if (idx > -1) {
            // Existing school -> merge/update in place, keep its original id.
            school = Object.assign({}, schools[idx], schoolData, { id: schools[idx].id });
            schools[idx] = school;
        } else {
            // New school -> append as a distinct entry.
            school = Object.assign(
                { id: generateId(schoolData.name), shortCode: deriveShortCode(schoolData.name) },
                schoolData
            );
            schools.push(school);
        }

        saveAll(schools);
        setActive(school.id);
        return school;
    }

    /** Switch the active school and refresh the denormalized activeSchoolConfig cache. */
    function setActive(id) {
        const school = getAll().find(s => s.id === id);
        if (!school) return null;
        localStorage.setItem(KEY_ACTIVE_ID, id);
        localStorage.setItem(KEY_ACTIVE_CONFIG, JSON.stringify(school));
        return school;
    }

    /** One-time import of pre-multi-school data, run automatically by getActive(). */
    function migrateLegacyIfNeeded() {
        if (getAll().length > 0) return null;
        const legacyName = localStorage.getItem(LEGACY_KEYS.name);
        if (!legacyName) return null;

        const legacy = { name: legacyName };
        Object.keys(LEGACY_KEYS).forEach(field => {
            if (field === 'name') return;
            const val = localStorage.getItem(LEGACY_KEYS[field]);
            if (val) legacy[field] = val;
        });
        return upsert(legacy);
    }

    /** Get the currently active school, migrating legacy data or falling back to the first school. */
    function getActive() {
        const activeId = localStorage.getItem(KEY_ACTIVE_ID);
        const schools = getAll();

        if (activeId) {
            const match = schools.find(s => s.id === activeId);
            if (match) return match;
        }

        if (schools.length > 0) {
            return setActive(schools[0].id);
        }

        return migrateLegacyIfNeeded();
    }

    function remove(id) {
        const remaining = getAll().filter(s => s.id !== id);
        saveAll(remaining);
        if (localStorage.getItem(KEY_ACTIVE_ID) === id) {
            if (remaining.length > 0) {
                setActive(remaining[0].id);
            } else {
                localStorage.removeItem(KEY_ACTIVE_ID);
                localStorage.removeItem(KEY_ACTIVE_CONFIG);
            }
        }
    }

    /**
     * Renders a compact dropdown switcher into the given container element.
     * Calling code should reload/re-render the page (or just relevant widgets)
     * inside onSwitch.
     */
    function renderSwitcher(containerEl, onSwitch) {
        if (!containerEl) return;
        const schools = getAll();
        const active = getActive();

        if (schools.length === 0) {
            containerEl.innerHTML = '';
            return;
        }

        const options = schools
            .map(s => `<option value="${s.id}" ${active && s.id === active.id ? 'selected' : ''}>${(s.shortCode || deriveShortCode(s.name))} — ${s.name}</option>`)
            .join('');

        containerEl.innerHTML = `
            <select id="schoolSwitcherSelect" aria-label="Switch active school"
                class="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer">
                ${options}
            </select>
        `;

        const select = containerEl.querySelector('#schoolSwitcherSelect');
        select.addEventListener('change', (e) => {
            const school = setActive(e.target.value);
            if (typeof onSwitch === 'function') onSwitch(school);
        });
    }

    return { getAll, upsert, setActive, getActive, remove, renderSwitcher, deriveShortCode };
})();
