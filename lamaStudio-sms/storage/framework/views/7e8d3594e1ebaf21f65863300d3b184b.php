<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Sections</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 p-6 text-slate-900 md:p-10">
    <?php
        $schoolName = auth()->user()->school->name ?? 'Allama Iqbal Model School';
    ?>

    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <div class="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:ml-80">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700"><?php echo e($schoolName); ?></p>
                <h1 class="mt-2 text-3xl font-bold">Section Management Overview</h1>
                <p class="mt-1 text-sm text-slate-500">Track student sections from class naming and keep section-based groups easy to review.</p>
            </div>
            <a href="<?php echo e(route('dashboard')); ?>" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Dashboard
            </a>
        </div>

        <?php echo $__env->make('students.partials.nav', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

        <div class="mb-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p class="text-sm text-slate-500">Total Sections</p>
                <p class="mt-2 text-3xl font-bold text-slate-900"><?php echo e($totalSections); ?></p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p class="text-sm text-slate-500">Total Students</p>
                <p class="mt-2 text-3xl font-bold text-slate-900"><?php echo e($totalStudents); ?></p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p class="text-sm text-slate-500">Print & Cards</p>
                <a href="<?php echo e(route('idcards.index')); ?>" class="mt-3 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600">Open ID Cards</a>
            </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-2">
            <?php $__empty_1 = true; $__currentLoopData = $sectionSummaries; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $summary): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Section</p>
                            <h2 class="mt-2 text-2xl font-bold text-slate-900"><?php echo e($summary['name']); ?></h2>
                        </div>
                        <span class="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700"><?php echo e($summary['student_count']); ?> Students</span>
                    </div>

                    <div class="mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                        <p class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Classes Covered</p>
                        <p class="mt-2 text-sm text-slate-700"><?php echo e($summary['classes']->isNotEmpty() ? $summary['classes']->join(', ') : 'No class mapping yet'); ?></p>
                    </div>

                    <div class="mt-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Students</p>
                        <div class="mt-2 space-y-2">
                            <?php $__currentLoopData = $summary['students']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                                    <?php echo e($student->name); ?>

                                    <span class="text-slate-400">(<?php echo e($student->class_room ?: 'No class'); ?>)</span>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 lg:col-span-2">
                    No section data is available yet. Use class names like 10-A or 8-B to see section grouping here.
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html><?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/students/sections.blade.php ENDPATH**/ ?>