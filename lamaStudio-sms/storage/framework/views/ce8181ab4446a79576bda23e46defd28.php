<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Academic Subjects</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900">
    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="md:ml-80 p-6 md:p-10">
        <div class="mx-auto max-w-7xl space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Academic Department</p>
                    <h1 class="mt-2 text-3xl font-bold">Subject Management</h1>
                    <p class="mt-1 text-sm text-slate-500">Create and maintain class/section-wise subject records with assigned teachers.</p>
                </div>
                <a href="<?php echo e(route('dashboard')); ?>" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Dashboard</a>
            </div>

            <?php if(session('success')): ?>
                <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><?php echo e(session('success')); ?></div>
            <?php endif; ?>

            <?php if($errors->any()): ?>
                <div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <ul class="list-disc pl-5">
                        <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <li><?php echo e($error); ?></li>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </ul>
                </div>
            <?php endif; ?>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold">Add Subject</h2>
                <form action="<?php echo e(route('academic.subjects.store')); ?>" method="POST" class="grid gap-4 md:grid-cols-4">
                    <?php echo csrf_field(); ?>
                    <input type="text" name="name" placeholder="Subject name" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" required>
                    <input type="text" name="code" placeholder="Code" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="text" name="class_room" placeholder="Class" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" required>
                    <input type="text" name="section" placeholder="Section" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="text" name="teacher_name" placeholder="Teacher" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="number" name="credit_hours" min="1" max="20" placeholder="Credit hours" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <select name="is_active" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <button class="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600">Save Subject</button>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold">Subjects Table</h2>
                <div class="space-y-4">
                    <?php $__empty_1 = true; $__currentLoopData = $subjects; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subject): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <form action="<?php echo e(route('academic.subjects.update', $subject)); ?>" method="POST" class="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-8">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('PATCH'); ?>
                            <input type="text" name="name" value="<?php echo e($subject->name); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm lg:col-span-2" required>
                            <input type="text" name="code" value="<?php echo e($subject->code); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Code">
                            <input type="text" name="class_room" value="<?php echo e($subject->class_room); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" required>
                            <input type="text" name="section" value="<?php echo e($subject->section); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Section">
                            <input type="text" name="teacher_name" value="<?php echo e($subject->teacher_name); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Teacher">
                            <input type="number" name="credit_hours" min="1" max="20" value="<?php echo e($subject->credit_hours); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Credit">
                            <select name="is_active" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                                <option value="1" <?php if($subject->is_active): echo 'selected'; endif; ?>>Active</option>
                                <option value="0" <?php if(! $subject->is_active): echo 'selected'; endif; ?>>Inactive</option>
                            </select>
                            <div class="lg:col-span-8 flex justify-end gap-2">
                                <button class="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-600">Update</button>
                            </div>
                        </form>
                        <form action="<?php echo e(route('academic.subjects.destroy', $subject)); ?>" method="POST" class="-mt-2 flex justify-end">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('DELETE'); ?>
                            <button class="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                        </form>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                            No subjects available yet.
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/academic/subjects.blade.php ENDPATH**/ ?>