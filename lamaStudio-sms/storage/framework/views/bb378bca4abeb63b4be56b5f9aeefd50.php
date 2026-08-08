<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Date Sheets</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 p-6 text-slate-900 md:p-10">
    <?php
        $schoolName = auth()->user()->school->name ?? 'Allama Iqbal Model School';
    ?>
    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <div class="mx-auto max-w-7xl md:ml-80">
        <div class="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700"><?php echo e($schoolName); ?></p>
                <h1 class="mt-2 text-3xl font-bold">Date Sheets and Timetables</h1>
            </div>
            <a href="/dashboard" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Dashboard</a>
        </div>

        <?php if(session('success')): ?>
            <div class="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><?php echo e(session('success')); ?></div>
        <?php endif; ?>

        <?php if($errors->any()): ?>
            <div class="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <ul class="list-disc space-y-1 pl-5">
                    <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <li><?php echo e($error); ?></li>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </ul>
            </div>
        <?php endif; ?>

        <form method="GET" action="<?php echo e(route('datesheets.index')); ?>" class="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5">
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Class</label>
                <select name="class_room" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <option value="">All Classes</option>
                    <?php $__currentLoopData = $classes; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $class): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($class); ?>" <?php if($selectedClass === $class): echo 'selected'; endif; ?>><?php echo e($class); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Type</label>
                <select name="type" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <option value="">All Types</option>
                    <option value="exam" <?php if($selectedType === 'exam'): echo 'selected'; endif; ?>>Exam</option>
                    <option value="class" <?php if($selectedType === 'class'): echo 'selected'; endif; ?>>Class</option>
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
                <input type="date" name="start_date" value="<?php echo e($startDate); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">End Date</label>
                <input type="date" name="end_date" value="<?php echo e($endDate); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
            </div>
            <div class="flex items-end">
                <button class="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600">Apply Filter</button>
            </div>
        </form>

        <div class="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold">Add Date Sheet Item</h2>
                <form method="POST" action="<?php echo e(route('datesheets.store')); ?>" class="space-y-4">
                    <?php echo csrf_field(); ?>
                    <input type="text" name="title" placeholder="Title (e.g., Mid Term Maths)" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <select name="type" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                        <option value="exam">Exam</option>
                        <option value="class">Class</option>
                    </select>
                    <input type="text" name="class_room" placeholder="Class" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="text" name="subject" placeholder="Subject" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="date" name="event_date" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <div class="grid gap-3 sm:grid-cols-2">
                        <input type="time" name="start_time" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                        <input type="time" name="end_time" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    </div>
                    <input type="text" name="room" placeholder="Room/Hall" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <textarea name="notes" rows="3" placeholder="Notes" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5"></textarea>
                    <button class="w-full rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600">Save</button>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold">Chronological Timetable</h2>
                <div class="overflow-hidden rounded-xl border border-slate-200">
                    <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-3 font-semibold text-slate-700">Date</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Type</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Title</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Class</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Subject / Room</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Time</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 bg-white">
                            <?php $__empty_1 = true; $__currentLoopData = $dateSheets; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <tr>
                                    <td class="px-4 py-3"><?php echo e($item->event_date); ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium <?php echo e($item->type === 'exam' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'); ?>">
                                            <?php echo e(ucfirst($item->type)); ?>

                                        </span>
                                    </td>
                                    <td class="px-4 py-3 font-medium text-slate-800"><?php echo e($item->title); ?></td>
                                    <td class="px-4 py-3"><?php echo e($item->class_room ?? '-'); ?></td>
                                    <td class="px-4 py-3"><?php echo e($item->subject ?? '-'); ?><?php echo e($item->room ? ' / '.$item->room : ''); ?></td>
                                    <td class="px-4 py-3"><?php echo e($item->start_time ?? '--:--'); ?> - <?php echo e($item->end_time ?? '--:--'); ?></td>
                                </tr>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <tr><td colspan="6" class="px-4 py-10 text-center text-slate-500">No date sheet entries yet.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/datesheets/index.blade.php ENDPATH**/ ?>