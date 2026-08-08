<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($title); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900">
    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="md:ml-80 p-6 md:p-10">
        <div class="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Department Module</p>
                    <h1 class="mt-2 text-3xl font-bold"><?php echo e($title); ?></h1>
                    <p class="mt-1 text-sm text-slate-500"><?php echo e($description); ?></p>
                </div>
                <a href="<?php echo e(route('dashboard')); ?>" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Dashboard</a>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <?php $__currentLoopData = ($highlights ?? []); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $highlight): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <?php echo e($highlight); ?>

                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </div>
        </div>
    </main>
</body>
</html><?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/departments/placeholder.blade.php ENDPATH**/ ?>