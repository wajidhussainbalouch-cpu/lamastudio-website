<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen text-slate-900">
    <?php
        $schoolName = auth()->user()->school->name ?? 'Allama Iqbal Model School';
    ?>
    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <div class="max-w-6xl mx-auto p-6 md:p-10 md:ml-80">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600"><?php echo e($schoolName); ?></p>
                <h1 class="mt-2 text-3xl font-bold text-slate-900">Attendance Management</h1>
            </div>
            <a href="/dashboard" class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800">
                Back to Dashboard
            </a>
        </div>

        <form method="GET" action="<?php echo e(route('attendance.index')); ?>" class="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Class Filter</label>
                <select name="class_room" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <option value="">All Classes</option>
                    <?php $__currentLoopData = $classes; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $class): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($class); ?>" <?php if($selectedClass === $class): echo 'selected'; endif; ?>><?php echo e($class); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Date</label>
                <input type="date" name="date" value="<?php echo e($selectedDate); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
            </div>
            <div class="flex items-end">
                <button class="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600">Apply Filter</button>
            </div>
        </form>

        <?php if(session('success')): ?>
            <div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <?php echo e(session('success')); ?>

            </div>
        <?php endif; ?>

        <?php if($errors->any()): ?>
            <div class="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <ul class="list-disc pl-5">
                    <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <li><?php echo e($error); ?></li>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </ul>
            </div>
        <?php endif; ?>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_1.5fr]">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Bulk Attendance Sheet</h2>

                <form action="<?php echo e(route('attendance.store')); ?>" method="POST" class="space-y-5">
                    <?php echo csrf_field(); ?>

                    <div>
                        <label for="date" class="mb-1 block text-sm font-medium text-slate-700">Date</label>
                        <input id="date" type="date" name="date" value="<?php echo e(date('Y-m-d')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bulk Actions</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <button type="button" data-set-status="present" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">Set All Present</button>
                            <button type="button" data-set-status="absent" class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500">Set All Absent</button>
                            <button type="button" data-set-status="late" class="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400">Set All Late</button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <?php $__empty_1 = true; $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p class="font-medium text-slate-800"><?php echo e($student->name); ?></p>
                                        <p class="text-xs text-slate-500">Class: <?php echo e($student->class_room ?? 'Not assigned'); ?> | Roll: <?php echo e($student->roll_no ?? '-'); ?></p>
                                    </div>
                                    <div class="w-full md:w-48">
                                        <label class="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Status</label>
                                        <select name="attendance[<?php echo e($student->id); ?>]" class="attendance-status w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                            <option value="late">Late</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                No students are available to mark attendance yet.
                            </div>
                        <?php endif; ?>
                    </div>

                    <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500">
                        Save Attendance
                    </button>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Recent Attendance</h2>

                <div class="overflow-hidden rounded-xl border border-slate-200">
                    <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-3 font-semibold text-slate-700">Student</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Date</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 bg-white">
                            <?php $__empty_1 = true; $__currentLoopData = $attendanceRecords; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $record): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <tr>
                                    <td class="px-4 py-3 text-slate-800"><?php echo e($record->student->name ?? 'N/A'); ?></td>
                                    <td class="px-4 py-3 text-slate-600"><?php echo e($record->date); ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium
                                            <?php if($record->status_label === 'present'): ?> bg-emerald-100 text-emerald-700
                                            <?php elseif($record->status_label === 'absent'): ?> bg-rose-100 text-rose-700
                                            <?php else: ?> bg-amber-100 text-amber-700
                                            <?php endif; ?>">
                                            <?php echo e(ucfirst($record->status_label)); ?>

                                        </span>
                                    </td>
                                </tr>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <tr>
                                    <td colspan="3" class="px-4 py-10 text-center text-slate-500">No attendance marked yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.querySelectorAll('[data-set-status]').forEach((button) => {
            button.addEventListener('click', () => {
                const status = button.getAttribute('data-set-status');
                document.querySelectorAll('.attendance-status').forEach((select) => {
                    select.value = status;
                });
            });
        });
    </script>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/attendance/index.blade.php ENDPATH**/ ?>