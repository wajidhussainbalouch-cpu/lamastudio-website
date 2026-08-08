<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ID Card Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        .cr80-card {
            width: 85.6mm;
            height: 53.98mm;
        }

        @media print {
            body {
                background: #fff !important;
                margin: 0;
            }

            .no-print {
                display: none !important;
            }

            .print-only-card {
                margin: 0;
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body class="min-h-screen bg-slate-100 p-6 text-slate-900 md:p-10">
    <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <div class="mx-auto max-w-7xl space-y-6 md:ml-80">
        <div class="flex flex-wrap items-center justify-between gap-3 no-print">
            <div>
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700"><?php echo e($schoolName); ?></p>
                <h1 class="mt-2 text-3xl font-bold">ID Card Generator with Live Preview</h1>
                <p class="mt-1 text-sm text-slate-500">Select a student and customize fields with instant preview updates for CR80 print cards.</p>
            </div>
            <a href="/dashboard" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to Dashboard</a>
        </div>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_1fr]" x-data="idCardPreview()">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 no-print">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Card Details</h2>

                <?php if($students->isEmpty()): ?>
                    <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        No students available yet. Add students from the Student Portal to generate ID cards.
                    </div>
                <?php endif; ?>

                <form class="space-y-4" @submit.prevent>
                    <div>
                        <label for="student_id" class="mb-1 block text-sm font-medium text-slate-700">Student</label>
                        <select id="student_id" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" @change="onStudentChange($event)">
                            <option value="">Select student</option>
                            <?php $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <option
                                    value="<?php echo e($student->id); ?>"
                                    data-name="<?php echo e($student->name); ?>"
                                    data-class="<?php echo e($student->class_room); ?>"
                                    data-roll="<?php echo e($student->roll_no); ?>"
                                    data-registration="<?php echo e($student->registration_no); ?>"
                                    data-phone="<?php echo e($student->guardian_phone); ?>"
                                >
                                    <?php echo e($student->name); ?> - <?php echo e($student->class_room ?? 'Class'); ?>

                                </option>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </select>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700">Name</label>
                            <input type="text" x-model="form.name" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" placeholder="Student Name">
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700">Class</label>
                            <input type="text" x-model="form.class_room" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" placeholder="10-A">
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700">Roll Number</label>
                            <input type="text" x-model="form.roll_no" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" placeholder="10A-01">
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-slate-700">Registration Number</label>
                            <input type="text" x-model="form.registration_no" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" placeholder="REG-2026-001">
                        </div>
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700">Guardian Phone</label>
                        <input type="text" x-model="form.guardian_phone" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5" placeholder="0300-1234567">
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700">Student Photo</label>
                        <input type="file" accept="image/*" @change="previewPhoto($event)" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm">
                        <p class="mt-1 text-xs text-slate-500">Image is used in the live preview only unless you print directly from this page.</p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button type="button" @click="window.print()" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" :disabled="!selectedStudentId" :class="!selectedStudentId ? 'opacity-50 cursor-not-allowed' : ''">Print Live Preview</button>
                        <a :href="printUrl" target="_blank" class="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600" :class="printUrl === '#' ? 'opacity-50 pointer-events-none' : ''">Open Print Route</a>
                    </div>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print-only-card">
                <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">CR80 Preview (85.6mm x 53.98mm)</p>

                <div class="cr80-card relative overflow-hidden rounded-xl border border-slate-300 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-3 text-white">
                    <div class="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-cyan-400/20"></div>
                    <div class="absolute -bottom-8 -left-10 h-28 w-28 rounded-full bg-cyan-300/20"></div>

                    <div class="relative z-10 flex h-full flex-col">
                        <div class="border-b border-white/30 pb-1">
                            <h3 class="truncate text-[11px] font-bold uppercase tracking-[0.12em]"><?php echo e($schoolName); ?></h3>
                            <p class="text-[8px] uppercase tracking-[0.18em] text-cyan-100">Official Student ID Card</p>
                        </div>

                        <div class="my-auto flex items-center gap-2.5">
                            <div class="h-[72px] w-[54px] overflow-hidden rounded-md border border-white/30 bg-slate-700/60">
                                <template x-if="photoPreview">
                                    <img :src="photoPreview" alt="Student photo" class="h-full w-full object-cover">
                                </template>
                                <template x-if="!photoPreview">
                                    <div class="flex h-full w-full items-center justify-center text-[9px] text-cyan-100">Photo</div>
                                </template>
                            </div>

                            <div class="min-w-0 space-y-0.5 text-[9px]">
                                <p class="truncate"><span class="text-cyan-100">Name:</span> <span class="font-semibold" x-text="form.name || 'Student Name'"></span></p>
                                <p class="truncate"><span class="text-cyan-100">Class:</span> <span class="font-semibold" x-text="form.class_room || 'Class'"></span></p>
                                <p class="truncate"><span class="text-cyan-100">Roll:</span> <span class="font-semibold" x-text="form.roll_no || '-'"></span></p>
                                <p class="truncate"><span class="text-cyan-100">Reg:</span> <span class="font-semibold" x-text="form.registration_no || '-'"></span></p>
                            </div>
                        </div>

                        <div class="border-t border-white/30 pt-1 text-[8px] text-cyan-100">
                            Guardian: <span class="font-semibold text-white" x-text="form.guardian_phone || '-'"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function idCardPreview() {
            return {
                selectedStudentId: '<?php echo e($selectedStudent?->id ?? ''); ?>',
                photoPreview: '',
                form: {
                    name: '<?php echo e($selectedStudent?->name ?? ''); ?>',
                    class_room: '<?php echo e($selectedStudent?->class_room ?? ''); ?>',
                    roll_no: '<?php echo e($selectedStudent?->roll_no ?? ''); ?>',
                    registration_no: '<?php echo e($selectedStudent?->registration_no ?? ''); ?>',
                    guardian_phone: '<?php echo e($selectedStudent?->guardian_phone ?? ''); ?>',
                },
                get printUrl() {
                    const studentId = this.selectedStudentId;
                    if (!studentId) {
                        return '#';
                    }

                    const query = new URLSearchParams({
                        name: this.form.name || '',
                        class_room: this.form.class_room || '',
                        roll_no: this.form.roll_no || '',
                        registration_no: this.form.registration_no || '',
                        guardian_phone: this.form.guardian_phone || '',
                    }).toString();

                    return `/id-cards/print/${studentId}?${query}`;
                },
                onStudentChange(event) {
                    const option = event.target.selectedOptions[0];
                    this.selectedStudentId = event.target.value;

                    this.form.name = option?.dataset?.name || '';
                    this.form.class_room = option?.dataset?.class || '';
                    this.form.roll_no = option?.dataset?.roll || '';
                    this.form.registration_no = option?.dataset?.registration || '';
                    this.form.guardian_phone = option?.dataset?.phone || '';
                },
                previewPhoto(event) {
                    const file = event.target.files?.[0];
                    if (!file) {
                        this.photoPreview = '';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.photoPreview = e.target?.result || '';
                    };
                    reader.readAsDataURL(file);
                },
            };
        }
    </script>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/id-cards/index.blade.php ENDPATH**/ ?>