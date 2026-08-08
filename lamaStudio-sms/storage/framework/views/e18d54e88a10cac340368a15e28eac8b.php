<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Search Portal</title>
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
                <h1 class="mt-2 text-3xl font-bold">Student and Parent Search Portal</h1>
                <p class="mt-1 text-sm text-slate-500">Search by name, registration number, or roll number and open full profile dashboards.</p>
            </div>
            <a href="/dashboard" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Dashboard
            </a>
        </div>

        <?php echo $__env->make('students.partials.nav', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

        <?php if(session('success')): ?>
            <div class="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <?php echo e(session('success')); ?>

            </div>
        <?php endif; ?>

        <?php if($errors->any()): ?>
            <div class="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <ul class="list-disc space-y-1 pl-5">
                    <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <li><?php echo e($error); ?></li>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </ul>
            </div>
        <?php endif; ?>

        <form method="GET" action="<?php echo e(route('students.index')); ?>" class="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label for="q" class="mb-2 block text-sm font-medium text-slate-700">Search Student</label>
            <div class="flex flex-col gap-3 md:flex-row">
                <input id="q" type="text" name="q" value="<?php echo e($query); ?>" placeholder="Name, registration no, or roll no" class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200">
                <button class="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600">Search</button>
            </div>
        </form>

        <form action="<?php echo e(route('students.store')); ?>" method="POST" class="mb-8 grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-3">
            <?php echo csrf_field(); ?>

            <div>
                <label for="name" class="mb-1 block text-sm font-medium text-slate-700">Student Name</label>
                <input id="name" type="text" name="name" value="<?php echo e(old('name')); ?>" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200" placeholder="Ali Khan">
            </div>

            <div>
                <label for="father_name" class="mb-1 block text-sm font-medium text-slate-700">Father Name</label>
                <input id="father_name" type="text" name="father_name" value="<?php echo e(old('father_name')); ?>" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200" placeholder="Ghulam Nabi">
            </div>

            <div>
                <label for="class_room" class="mb-1 block text-sm font-medium text-slate-700">Class</label>
                <input id="class_room" type="text" name="class_room" value="<?php echo e(old('class_room')); ?>" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200" placeholder="10-A">
            </div>

            <div>
                <label for="registration_no" class="mb-1 block text-sm font-medium text-slate-700">Registration No</label>
                <input id="registration_no" type="text" name="registration_no" value="<?php echo e(old('registration_no')); ?>" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200" placeholder="REG-2026-001">
            </div>

            <div>
                <label for="roll_no" class="mb-1 block text-sm font-medium text-slate-700">Roll No</label>
                <input id="roll_no" type="text" name="roll_no" value="<?php echo e(old('roll_no')); ?>" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200" placeholder="10A-01">
            </div>

            <div>
                <label for="guardian_phone" class="mb-1 block text-sm font-medium text-slate-700">Parent Phone</label>
                <input id="guardian_phone" type="text" name="guardian_phone" value="<?php echo e(old('guardian_phone')); ?>" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200" placeholder="0300-1234567">
            </div>

            <div class="md:col-span-3 flex justify-end">
                <button type="submit" class="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600">
                    Save Student
                </button>
            </div>
        </form>

        <div class="overflow-hidden rounded-lg border border-slate-200">
            <table class="min-w-full divide-y divide-gray-200 text-left">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-700">Registration No</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-700">Roll No</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-700">Class</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <?php $__empty_1 = true; $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <tr>
                            <td class="px-4 py-3 text-sm text-slate-900"><?php echo e($student->name); ?></td>
                            <td class="px-4 py-3 text-sm text-slate-700"><?php echo e($student->registration_no ?? '-'); ?></td>
                            <td class="px-4 py-3 text-sm text-slate-700"><?php echo e($student->roll_no ?? '-'); ?></td>
                            <td class="px-4 py-3 text-sm text-slate-700"><?php echo e($student->class_room); ?></td>
                            <td class="px-4 py-3 text-sm">
                                <a href="<?php echo e(route('students.show', $student)); ?>" class="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700">View Profile</a>
                            </td>
                        </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <tr>
                            <td colspan="5" class="px-4 py-6 text-center text-sm text-slate-500">No students found.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/students/index.blade.php ENDPATH**/ ?>