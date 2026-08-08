<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Payroll</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900">
    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="md:ml-80 p-6 md:p-10">
        <div class="mx-auto max-w-7xl space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">HR Department</p>
                    <h1 class="mt-2 text-3xl font-bold">Payroll Management</h1>
                    <p class="mt-1 text-sm text-slate-500">Create, update, and track monthly payroll entries for staff.</p>
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
                <h2 class="mb-4 text-xl font-semibold">Create Payroll Entry</h2>
                <form action="<?php echo e(route('hr.payroll.store')); ?>" method="POST" class="grid gap-4 md:grid-cols-3">
                    <?php echo csrf_field(); ?>
                    <input type="text" name="staff_name" placeholder="Staff name" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" required>
                    <input type="text" name="designation" placeholder="Designation" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="text" name="month" placeholder="August 2026" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" required>
                    <input type="number" step="0.01" min="0" name="basic_salary" placeholder="Basic salary" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" required>
                    <input type="number" step="0.01" min="0" name="allowances" placeholder="Allowances" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <input type="number" step="0.01" min="0" name="deductions" placeholder="Deductions" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                    <select name="payment_status" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="hold">Hold</option>
                    </select>
                    <input type="text" name="notes" placeholder="Notes" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 md:col-span-2">
                    <button class="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600">Save Payroll</button>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold">Payroll Table</h2>
                <div class="space-y-4">
                    <?php $__empty_1 = true; $__currentLoopData = $payrolls; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $payroll): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <form action="<?php echo e(route('hr.payroll.update', $payroll)); ?>" method="POST" class="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-8">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('PATCH'); ?>
                            <input type="text" name="staff_name" value="<?php echo e($payroll->staff_name); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm lg:col-span-2" required>
                            <input type="text" name="designation" value="<?php echo e($payroll->designation); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                            <input type="text" name="month" value="<?php echo e($payroll->month); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" required>
                            <input type="number" step="0.01" min="0" name="basic_salary" value="<?php echo e($payroll->basic_salary); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" required>
                            <input type="number" step="0.01" min="0" name="allowances" value="<?php echo e($payroll->allowances); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                            <input type="number" step="0.01" min="0" name="deductions" value="<?php echo e($payroll->deductions); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                            <select name="payment_status" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                                <option value="pending" <?php if($payroll->payment_status === 'pending'): echo 'selected'; endif; ?>>Pending</option>
                                <option value="paid" <?php if($payroll->payment_status === 'paid'): echo 'selected'; endif; ?>>Paid</option>
                                <option value="hold" <?php if($payroll->payment_status === 'hold'): echo 'selected'; endif; ?>>Hold</option>
                            </select>
                            <div class="lg:col-span-8 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                                <input type="text" name="notes" value="<?php echo e($payroll->notes); ?>" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Notes">
                                <span class="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Net: Rs. <?php echo e(number_format((float) $payroll->net_salary, 2)); ?></span>
                                <div class="flex gap-2">
                                    <button class="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-600">Update</button>
                                </div>
                            </div>
                        </form>
                        <form action="<?php echo e(route('hr.payroll.destroy', $payroll)); ?>" method="POST" class="-mt-2 flex justify-end">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('DELETE'); ?>
                            <button class="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                        </form>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                            No payroll entries yet.
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/hr/payroll.blade.php ENDPATH**/ ?>