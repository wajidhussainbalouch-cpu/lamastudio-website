<?php
    $studentNavItems = [
        ['label' => 'Student Directory', 'route' => 'students.index'],
        ['label' => 'Admission Form', 'route' => 'students.admission-form'],
        ['label' => 'Classes', 'route' => 'students.classes'],
        ['label' => 'Sections', 'route' => 'students.sections'],
        ['label' => 'ID Cards', 'route' => 'idcards.index'],
    ];
?>

<div class="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Student Management</p>
    <div class="mt-3 flex flex-wrap gap-2">
        <?php $__currentLoopData = $studentNavItems; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <a
                href="<?php echo e(route($item['route'])); ?>"
                class="rounded-xl px-4 py-2 text-sm font-medium transition <?php echo e(request()->routeIs($item['route']) ? 'bg-cyan-700 text-white shadow' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-cyan-50 hover:text-cyan-700'); ?>"
            >
                <?php echo e($item['label']); ?>

            </a>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </div>
</div><?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/students/partials/nav.blade.php ENDPATH**/ ?>