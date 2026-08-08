<?php
    $userRole = auth()->user()->role ?? 'school_admin';
    $roleAlias = match ($userRole) {
        'teacher' => 'teacher',
        'accountant' => 'accountant',
        default => 'admin',
    };

    $departments = [
        [
            'key' => 'students',
            'icon' => '🎓',
            'label' => 'Students',
            'main_route' => 'students.index',
            'active_patterns' => ['students.*', 'idcards.*'],
            'roles' => ['admin', 'teacher', 'accountant'],
            'items' => [
                ['label' => 'Directory', 'route' => 'students.index', 'active' => ['students.index', 'students.show'], 'roles' => ['admin', 'teacher', 'accountant']],
                ['label' => 'Admissions', 'route' => 'students.admission-form', 'active' => ['students.admission-form'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Profiles', 'route' => 'students.index', 'active' => ['students.show', 'students.index'], 'roles' => ['admin', 'teacher', 'accountant']],
                ['label' => 'Classes', 'route' => 'students.classes', 'active' => ['students.classes'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Sections', 'route' => 'students.sections', 'active' => ['students.sections'], 'roles' => ['admin', 'teacher']],
            ],
        ],
        [
            'key' => 'finance',
            'icon' => '💰',
            'label' => 'Finance',
            'main_route' => 'fees.index',
            'active_patterns' => ['fees.*', 'finance.*'],
            'roles' => ['admin', 'accountant'],
            'items' => [
                ['label' => 'Fee Slabs', 'route' => 'finance.fee-slabs', 'active' => ['finance.fee-slabs'], 'roles' => ['admin', 'accountant']],
                ['label' => 'Fee Vouchers & Printing', 'route' => 'finance.vouchers', 'active' => ['finance.vouchers'], 'roles' => ['admin', 'accountant']],
                ['label' => 'Collection', 'route' => 'finance.collection', 'active' => ['finance.collection'], 'roles' => ['admin', 'accountant']],
                ['label' => 'Dues Ledger', 'route' => 'finance.dues-ledger', 'active' => ['finance.dues-ledger'], 'roles' => ['admin', 'accountant']],
            ],
        ],
        [
            'key' => 'hr',
            'icon' => '👥',
            'label' => 'HR',
            'main_route' => 'hr.index',
            'active_patterns' => ['hr.*'],
            'roles' => ['admin'],
            'items' => [
                ['label' => 'Staff Directory', 'route' => 'hr.staff-directory', 'active' => ['hr.staff-directory'], 'roles' => ['admin']],
                ['label' => 'Payroll', 'route' => 'hr.payroll', 'active' => ['hr.payroll'], 'roles' => ['admin']],
                ['label' => 'Attendance', 'route' => 'hr.attendance', 'active' => ['hr.attendance'], 'roles' => ['admin']],
                ['label' => 'Monthly Report', 'route' => 'hr.monthly-report', 'active' => ['hr.monthly-report'], 'roles' => ['admin']],
                ['label' => 'ID Card', 'route' => 'hr.id-cards', 'active' => ['hr.id-cards'], 'roles' => ['admin']],
            ],
        ],
        [
            'key' => 'assessment',
            'icon' => '📝',
            'label' => 'Assessment / Exam',
            'main_route' => 'exams.index',
            'active_patterns' => ['exams.*', 'assessment.*', 'datesheets.*'],
            'roles' => ['admin', 'teacher'],
            'items' => [
                ['label' => 'Marks Entry', 'route' => 'assessment.marks-entry', 'active' => ['assessment.marks-entry', 'exams.index'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Result Cards', 'route' => 'assessment.result-cards', 'active' => ['assessment.result-cards', 'exams.report-card'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Grading', 'route' => 'assessment.grading', 'active' => ['assessment.grading'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Date Sheet', 'route' => 'datesheets.index', 'active' => ['datesheets.*'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Annual / Term', 'route' => 'assessment.annual-term', 'active' => ['assessment.annual-term'], 'roles' => ['admin', 'teacher']],
            ],
        ],
        [
            'key' => 'academic',
            'icon' => '📚',
            'label' => 'Academic Department',
            'main_route' => 'students.classes',
            'active_patterns' => ['academic.*', 'students.classes', 'students.sections'],
            'roles' => ['admin', 'teacher'],
            'items' => [
                ['label' => 'Classes', 'route' => 'academic.classes', 'active' => ['academic.classes', 'students.classes'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Sections', 'route' => 'academic.sections', 'active' => ['academic.sections', 'students.sections'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Timetables', 'route' => 'academic.timetables', 'active' => ['academic.timetables'], 'roles' => ['admin', 'teacher']],
                ['label' => 'Subjects', 'route' => 'academic.subjects', 'active' => ['academic.subjects'], 'roles' => ['admin', 'teacher']],
            ],
        ],
    ];
?>

<button id="mobileSidebarOpen" type="button" class="md:hidden fixed left-4 top-4 z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-lg">
    Menu
</button>

<div id="mobileSidebarOverlay" class="hidden fixed inset-0 z-50 bg-slate-950/65 md:hidden"></div>

<aside id="mobileSidebar" class="hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] flex-col border-r border-slate-800 bg-slate-950 text-slate-100 md:hidden">
    <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
            <p class="text-sm font-bold tracking-wider">LAMA SCHOOL MANAGEMENT</p>
            <p class="text-xs text-slate-400">Department Navigation</p>
        </div>
        <button id="mobileSidebarClose" type="button" class="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">Close</button>
    </div>

    <nav class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <a href="<?php echo e(route('dashboard')); ?>" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold <?php echo e(request()->routeIs('dashboard') ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-400/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'); ?>">
            <span>◉</span> Dashboard
        </a>

        <?php $__currentLoopData = $departments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $department): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php if(! in_array($roleAlias, $department['roles'], true)) continue; ?>
            <?php
                $deptActive = collect($department['active_patterns'])->contains(fn ($pattern) => request()->routeIs($pattern));
            ?>
            <div class="dept-group rounded-2xl border border-slate-800/70 bg-slate-900/50" data-dept-key="<?php echo e($department['key']); ?>" data-active="<?php echo e($deptActive ? '1' : '0'); ?>" data-scope="mobile">
                <div class="flex items-center justify-between gap-2 px-3 py-2.5">
                    <a href="<?php echo e(route($department['main_route'])); ?>" class="flex min-w-0 items-center gap-2 text-sm font-semibold <?php echo e($deptActive ? 'text-white' : 'text-slate-300 hover:text-white'); ?>">
                        <span><?php echo e($department['icon']); ?></span>
                        <span class="truncate"><?php echo e($department['label']); ?></span>
                    </a>
                    <button type="button" class="dept-toggle rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800" aria-label="Toggle <?php echo e($department['label']); ?> submenu" aria-expanded="false">
                        <span class="dept-chevron inline-block transition-transform duration-300">▾</span>
                    </button>
                </div>

                <div class="dept-panel overflow-hidden transition-[max-height] duration-300 ease-out" style="max-height: 0;">
                    <div class="space-y-1 px-3 pb-3">
                        <?php $__currentLoopData = $department['items']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <?php if(! in_array($roleAlias, $item['roles'], true)) continue; ?>
                            <?php
                                $itemActive = collect($item['active'])->contains(fn ($pattern) => request()->routeIs($pattern));
                            ?>
                            <a href="<?php echo e(route($item['route'])); ?>" class="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs <?php echo e($itemActive ? 'bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'); ?>">
                                <span>•</span>
                                <span><?php echo e($item['label']); ?></span>
                            </a>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                </div>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </nav>
</aside>

<aside class="hidden md:flex fixed inset-y-0 left-0 z-40 w-80 flex-col border-r border-slate-800 bg-slate-950 text-slate-100">
    <div class="border-b border-slate-800 px-5 py-4">
        <p class="text-sm font-bold tracking-wider">LAMA SCHOOL MANAGEMENT</p>
        <p class="text-xs text-slate-400">Department Navigation</p>
        <p class="mt-2 inline-flex rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-slate-300">
            <?php echo e($roleAlias); ?> view
        </p>
    </div>

    <nav class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <a href="<?php echo e(route('dashboard')); ?>" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold <?php echo e(request()->routeIs('dashboard') ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-400/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'); ?>">
            <span>◉</span> Dashboard
        </a>

        <?php $__currentLoopData = $departments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $department): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php if(! in_array($roleAlias, $department['roles'], true)) continue; ?>
            <?php
                $deptActive = collect($department['active_patterns'])->contains(fn ($pattern) => request()->routeIs($pattern));
            ?>
            <div class="dept-group rounded-2xl border border-slate-800/70 bg-slate-900/50" data-dept-key="<?php echo e($department['key']); ?>" data-active="<?php echo e($deptActive ? '1' : '0'); ?>" data-scope="desktop">
                <div class="flex items-center justify-between gap-2 px-3 py-2.5">
                    <a href="<?php echo e(route($department['main_route'])); ?>" class="flex min-w-0 items-center gap-2 text-sm font-semibold <?php echo e($deptActive ? 'text-white' : 'text-slate-300 hover:text-white'); ?>">
                        <span><?php echo e($department['icon']); ?></span>
                        <span class="truncate"><?php echo e($department['label']); ?></span>
                    </a>
                    <button type="button" class="dept-toggle rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800" aria-label="Toggle <?php echo e($department['label']); ?> submenu" aria-expanded="false">
                        <span class="dept-chevron inline-block transition-transform duration-300">▾</span>
                    </button>
                </div>

                <div class="dept-panel overflow-hidden transition-[max-height] duration-300 ease-out" style="max-height: 0;">
                    <div class="space-y-1 px-3 pb-3">
                        <?php $__currentLoopData = $department['items']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <?php if(! in_array($roleAlias, $item['roles'], true)) continue; ?>
                            <?php
                                $itemActive = collect($item['active'])->contains(fn ($pattern) => request()->routeIs($pattern));
                            ?>
                            <a href="<?php echo e(route($item['route'])); ?>" class="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs <?php echo e($itemActive ? 'bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'); ?>">
                                <span>•</span>
                                <span><?php echo e($item['label']); ?></span>
                            </a>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                </div>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </nav>
</aside>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const mobileSidebar = document.getElementById('mobileSidebar');
        const mobileOverlay = document.getElementById('mobileSidebarOverlay');
        const openButton = document.getElementById('mobileSidebarOpen');
        const closeButton = document.getElementById('mobileSidebarClose');

        const openMobileSidebar = () => {
            mobileSidebar?.classList.remove('hidden');
            mobileSidebar?.classList.add('flex');
            mobileOverlay?.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };

        const closeMobileSidebar = () => {
            mobileSidebar?.classList.add('hidden');
            mobileSidebar?.classList.remove('flex');
            mobileOverlay?.classList.add('hidden');
            document.body.style.overflow = '';
        };

        openButton?.addEventListener('click', openMobileSidebar);
        closeButton?.addEventListener('click', closeMobileSidebar);
        mobileOverlay?.addEventListener('click', closeMobileSidebar);

        document.querySelectorAll('.dept-group').forEach((group) => {
            const key = group.dataset.deptKey;
            const scope = group.dataset.scope || 'shared';
            const isActive = group.dataset.active === '1';
            const panel = group.querySelector('.dept-panel');
            const toggle = group.querySelector('.dept-toggle');
            const chevron = group.querySelector('.dept-chevron');
            const storageKey = `lama-sidebar-${scope}-${key}`;

            const stored = localStorage.getItem(storageKey);
            const open = stored === null ? isActive : stored === 'open';

            const applyState = (isOpen) => {
                panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : '0px';
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                localStorage.setItem(storageKey, isOpen ? 'open' : 'closed');
            };

            applyState(open);

            toggle.addEventListener('click', () => {
                const currentlyOpen = toggle.getAttribute('aria-expanded') === 'true';
                applyState(!currentlyOpen);
            });

            window.addEventListener('resize', () => {
                const currentlyOpen = toggle.getAttribute('aria-expanded') === 'true';
                if (currentlyOpen) {
                    panel.style.maxHeight = `${panel.scrollHeight}px`;
                }
                if (window.innerWidth >= 768) {
                    closeMobileSidebar();
                }
            });
        });
    });
+</script>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/partials/main-sidebar.blade.php ENDPATH**/ ?>