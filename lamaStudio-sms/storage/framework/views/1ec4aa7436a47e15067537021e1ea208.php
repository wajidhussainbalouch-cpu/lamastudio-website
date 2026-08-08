<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fee Management</title>
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
                <h1 class="mt-2 text-3xl font-bold text-slate-900">Fee Management</h1>
            </div>
            <a href="/dashboard" class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800">
                Back to Dashboard
            </a>
        </div>

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

        <div class="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Generate Fee Challan</h2>

                <form action="<?php echo e(route('fees.store')); ?>" method="POST" class="space-y-4">
                    <?php echo csrf_field(); ?>

                    <div>
                        <label for="student_id" class="mb-1 block text-sm font-medium text-slate-700">Student</label>
                        <select id="student_id" name="student_id" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                            <option value="">Select a student</option>
                            <?php $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <option value="<?php echo e($student->id); ?>"><?php echo e($student->name); ?> - <?php echo e($student->class_room ?? 'Class N/A'); ?></option>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </select>
                    </div>

                    <div>
                        <label for="amount" class="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                        <input id="amount" type="number" step="0.01" min="0" name="amount" value="<?php echo e(old('amount')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="2500">
                    </div>

                    <div>
                        <label for="month" class="mb-1 block text-sm font-medium text-slate-700">Month</label>
                        <input id="month" type="text" name="month" value="<?php echo e(old('month')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="August 2026">
                    </div>

                    <div>
                        <label for="due_date" class="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
                        <input id="due_date" type="date" name="due_date" value="<?php echo e(old('due_date')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    </div>

                    <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500">
                        Save Challan
                    </button>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Recent Fee Records</h2>

                <div class="overflow-hidden rounded-xl border border-slate-200">
                    <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-3 font-semibold text-slate-700">Student</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Amount</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Month</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Status</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 bg-white">
                            <?php $__empty_1 = true; $__currentLoopData = $fees; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $fee): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <tr>
                                    <td class="px-4 py-3 text-slate-800"><?php echo e($fee->student->name ?? 'N/A'); ?></td>
                                    <td class="px-4 py-3 text-slate-600">$<?php echo e(number_format($fee->amount, 2)); ?></td>
                                    <td class="px-4 py-3 text-slate-600"><?php echo e($fee->month); ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium <?php echo e($fee->status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'); ?>">
                                            <?php echo e(ucfirst($fee->status)); ?>

                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex gap-2">
                                            <a href="<?php echo e(route('fees.voucher.print', $fee)); ?>" target="_blank" class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">Print Voucher</a>
                                            <?php if($fee->status !== 'paid'): ?>
                                                <form method="POST" action="<?php echo e(route('fees.paid', $fee)); ?>">
                                                    <?php echo csrf_field(); ?>
                                                    <?php echo method_field('PATCH'); ?>
                                                    <button class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">Mark Paid</button>
                                                </form>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <tr>
                                    <td colspan="5" class="px-4 py-10 text-center text-slate-500">No fee records yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/fees/index.blade.php ENDPATH**/ ?>