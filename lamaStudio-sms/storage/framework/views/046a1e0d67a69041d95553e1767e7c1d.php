<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
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
                <h1 class="mt-2 text-3xl font-bold text-slate-900">Exam Management</h1>
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

        <div class="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Create Exam</h2>

                <form action="<?php echo e(route('exams.store')); ?>" method="POST" class="space-y-4">
                    <?php echo csrf_field(); ?>

                    <div>
                        <label for="exam_title" class="mb-1 block text-sm font-medium text-slate-700">Exam Title</label>
                        <input id="exam_title" type="text" name="exam_title" value="<?php echo e(old('exam_title')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Mid Term 2026">
                    </div>

                    <div>
                        <label for="term" class="mb-1 block text-sm font-medium text-slate-700">Term</label>
                        <input id="term" type="text" name="term" value="<?php echo e(old('term')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="First Term">
                    </div>

                    <div>
                        <label for="class" class="mb-1 block text-sm font-medium text-slate-700">Class</label>
                        <input id="class" type="text" name="class" value="<?php echo e(old('class')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="10-A">
                    </div>

                    <div>
                        <label for="start_date" class="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
                        <input id="start_date" type="date" name="start_date" value="<?php echo e(old('start_date')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    </div>

                    <div>
                        <label for="end_date" class="mb-1 block text-sm font-medium text-slate-700">End Date</label>
                        <input id="end_date" type="date" name="end_date" value="<?php echo e(old('end_date')); ?>" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    </div>

                    <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500">
                        Save Exam
                    </button>
                </form>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 class="mb-4 text-xl font-semibold text-slate-800">Exam Schedule</h2>

                <div class="overflow-hidden rounded-xl border border-slate-200">
                    <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-3 font-semibold text-slate-700">Exam</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Term</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Class</th>
                                <th class="px-4 py-3 font-semibold text-slate-700">Duration</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 bg-white">
                            <?php $__empty_1 = true; $__currentLoopData = $exams; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $exam): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <tr>
                                    <td class="px-4 py-3 text-slate-800"><?php echo e($exam->exam_title); ?></td>
                                    <td class="px-4 py-3 text-slate-600"><?php echo e($exam->term ?? 'Term'); ?></td>
                                    <td class="px-4 py-3 text-slate-600"><?php echo e($exam->class); ?></td>
                                    <td class="px-4 py-3 text-slate-600"><?php echo e($exam->start_date); ?><?php echo e($exam->end_date ? ' to '.$exam->end_date : ''); ?></td>
                                </tr>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <tr>
                                    <td colspan="4" class="px-4 py-10 text-center text-slate-500">No exams scheduled yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" x-data="{ rows: [{ student_id: '', subject: '', total_marks: 100, obtained_marks: '' }] }">
                <div class="mb-4 flex items-center justify-between gap-3">
                    <h2 class="text-xl font-semibold text-slate-800">Bulk Marks Entry</h2>
                    <button type="button" class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700" @click="rows.push({ student_id: '', subject: '', total_marks: 100, obtained_marks: '' })">Add Row</button>
                </div>

                <?php if($exams->isEmpty() || $students->isEmpty()): ?>
                    <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        Create at least one exam and add students before entering marks.
                    </div>
                <?php endif; ?>

                <form method="POST" action="<?php echo e(route('exams.marks.store')); ?>" class="space-y-4">
                    <?php echo csrf_field(); ?>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700">Exam</label>
                        <select name="exam_id" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                            <option value="">Select exam</option>
                            <?php $__currentLoopData = $exams; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $exam): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <option value="<?php echo e($exam->id); ?>"><?php echo e($exam->exam_title); ?> - <?php echo e($exam->term ?? 'Term'); ?> (<?php echo e($exam->class); ?>)</option>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </select>
                    </div>

                    <template x-for="(row, index) in rows" :key="index">
                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div class="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label class="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Student</label>
                                    <select :name="`entries[${index}][student_id]`" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" x-model="row.student_id">
                                        <option value="">Select student</option>
                                        <?php $__currentLoopData = $studentsByClass; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $class => $classStudents): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <optgroup label="<?php echo e($class); ?>">
                                                <?php $__currentLoopData = $classStudents; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                    <option value="<?php echo e($student->id); ?>"><?php echo e($student->name); ?> (<?php echo e($student->roll_no ?? 'No Roll'); ?>)</option>
                                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                            </optgroup>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </select>
                                </div>
                                <div>
                                    <label class="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Subject</label>
                                    <input type="text" :name="`entries[${index}][subject]`" x-model="row.subject" placeholder="Mathematics" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                                </div>
                                <div>
                                    <label class="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Total Marks</label>
                                    <input type="number" step="0.01" min="1" :name="`entries[${index}][total_marks]`" x-model="row.total_marks" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                                </div>
                                <div>
                                    <label class="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Obtained Marks</label>
                                    <input type="number" step="0.01" min="0" :max="row.total_marks" :name="`entries[${index}][obtained_marks]`" x-model="row.obtained_marks" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                                </div>
                            </div>

                            <div class="mt-2 flex items-center justify-between">
                                <p class="text-xs text-slate-500" x-text="`Percentage: ${row.total_marks > 0 && row.obtained_marks !== '' ? ((row.obtained_marks / row.total_marks) * 100).toFixed(2) : '0.00'}%`"></p>
                                <button type="button" class="text-xs font-semibold text-rose-600 hover:text-rose-500" @click="rows.length > 1 ? rows.splice(index, 1) : null">Remove</button>
                            </div>
                        </div>
                    </template>

                    <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500">Save Marks</button>
                </form>
            </div>

            <div class="space-y-6">
                <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 class="mb-4 text-xl font-semibold text-slate-800">Term-wise Report Card</h2>
                    <form id="reportCardForm" class="space-y-4">
                        <div>
                            <label for="report_exam" class="mb-1 block text-sm font-medium text-slate-700">Exam</label>
                            <select id="report_exam" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                                <option value="">Select exam</option>
                                <?php $__currentLoopData = $exams; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $exam): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($exam->id); ?>"><?php echo e($exam->exam_title); ?> - <?php echo e($exam->term ?? 'Term'); ?></option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </select>
                        </div>
                        <div>
                            <label for="report_student" class="mb-1 block text-sm font-medium text-slate-700">Student</label>
                            <select id="report_student" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
                                <option value="">Select student</option>
                                <?php $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($student->id); ?>"><?php echo e($student->name); ?> - <?php echo e($student->class_room ?? 'Class'); ?></option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </select>
                        </div>
                        <button type="button" id="openReportCard" class="inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-600">Open Report Card</button>
                    </form>
                </div>

                <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 class="mb-4 text-xl font-semibold text-slate-800">Recent Marks</h2>
                    <div class="space-y-2">
                        <?php $__empty_1 = true; $__currentLoopData = $recentResults; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $result): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <?php
                                $percentage = $result->total_marks > 0 ? ($result->obtained_marks / $result->total_marks) * 100 : 0;
                                $grade = $percentage >= 90 ? 'A+' : ($percentage >= 80 ? 'A' : ($percentage >= 70 ? 'B' : ($percentage >= 60 ? 'C' : ($percentage >= 50 ? 'D' : 'F'))));
                            ?>
                            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <p class="text-sm font-semibold text-slate-800"><?php echo e($result->student->name ?? 'Student'); ?> - <?php echo e($result->subject); ?></p>
                                <p class="text-xs text-slate-500"><?php echo e($result->exam->exam_title ?? 'Exam'); ?> | <?php echo e(number_format($result->obtained_marks, 2)); ?>/<?php echo e(number_format($result->total_marks, 2)); ?> | <?php echo e(number_format($percentage, 2)); ?>% | Grade <?php echo e($grade); ?></p>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <p class="text-sm text-slate-500">No marks have been entered yet.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('openReportCard')?.addEventListener('click', function () {
            const examId = document.getElementById('report_exam')?.value;
            const studentId = document.getElementById('report_student')?.value;

            if (!examId || !studentId) {
                alert('Please select both exam and student.');
                return;
            }

            window.open(`/exams/${examId}/report-card/${studentId}`, '_blank');
        });
    </script>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/exams/index.blade.php ENDPATH**/ ?>