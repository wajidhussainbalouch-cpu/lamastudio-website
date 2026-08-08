<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Allama Iqbal Model School</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    boxShadow: {
                        glow: '0 0 0 1px rgba(99,102,241,0.18), 0 20px 60px rgba(79,70,229,0.18)'
                    }
                }
            }
        }
    </script>
    <style>
        body.cyberpunk-mode {
            background:
                radial-gradient(circle at top left, rgba(45,212,191,0.18), transparent 24%),
                radial-gradient(circle at top right, rgba(168,85,247,0.2), transparent 30%),
                linear-gradient(135deg, #020817 0%, #0b1120 42%, #111827 100%);
            color: #e2e8f0;
        }

        body.cyberpunk-mode * {
            border-color: rgba(45, 212, 191, 0.22) !important;
        }

        body.cyberpunk-mode [class*="bg-white"],
        body.cyberpunk-mode [class*="bg-slate-50"],
        body.cyberpunk-mode [class*="bg-slate-800"],
        body.cyberpunk-mode [class*="bg-slate-900"],
        body.cyberpunk-mode [class*="bg-indigo-50"],
        body.cyberpunk-mode [class*="bg-slate-950"] {
            box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.18), 0 0 24px rgba(34, 211, 238, 0.08), 0 20px 45px rgba(168, 85, 247, 0.12);
        }

        body.cyberpunk-mode [class*="bg-white"] {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(17, 24, 39, 0.96)) !important;
            color: #e2e8f0 !important;
        }

        body.cyberpunk-mode [class*="bg-slate-50"],
        body.cyberpunk-mode [class*="bg-slate-800"],
        body.cyberpunk-mode [class*="bg-slate-900"],
        body.cyberpunk-mode [class*="bg-slate-950"] {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(17, 24, 39, 0.98)) !important;
        }

        body.cyberpunk-mode .text-slate-500,
        body.cyberpunk-mode .text-slate-600,
        body.cyberpunk-mode .text-slate-700,
        body.cyberpunk-mode .text-slate-800,
        body.cyberpunk-mode .text-slate-900,
        body.cyberpunk-mode .text-slate-300,
        body.cyberpunk-mode .text-slate-200,
        body.cyberpunk-mode .text-slate-100 {
            color: #cbd5e1 !important;
        }

        body.cyberpunk-mode .text-indigo-600,
        body.cyberpunk-mode .text-indigo-700 {
            color: #67e8f9 !important;
        }

        body.cyberpunk-mode .text-emerald-600,
        body.cyberpunk-mode .text-sky-600,
        body.cyberpunk-mode .text-amber-600 {
            color: #a7f3d0 !important;
        }

        body.cyberpunk-mode .rounded-2xl,
        body.cyberpunk-mode .rounded-3xl,
        body.cyberpunk-mode .rounded-xl,
        body.cyberpunk-mode .rounded-full {
            border-color: rgba(45, 212, 191, 0.26) !important;
        }

        body.cyberpunk-mode .bg-indigo-500\/10,
        body.cyberpunk-mode .bg-indigo-500\/15,
        body.cyberpunk-mode .bg-indigo-100,
        body.cyberpunk-mode .bg-emerald-500\/15,
        body.cyberpunk-mode .bg-sky-100,
        body.cyberpunk-mode .bg-amber-100 {
            filter: saturate(1.4);
        }

        body.cyberpunk-mode .chip {
            box-shadow: 0 0 18px rgba(34, 211, 238, 0.14);
        }

        body.cyberpunk-mode svg path {
            filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.5));
        }
    </style>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 cyberpunk-body">
    <?php
        $schoolName = auth()->user()->school->name ?? 'Allama Iqbal Model School';
        $studentCount = \App\Models\Student::count();
        $attendanceCount = \App\Models\Attendance::count();
        $feeTotal = \App\Models\Fee::sum('amount');
        $examCount = \App\Models\Exam::count();
        $presentCount = \App\Models\Attendance::where('status', 'present')->count();
        $absentCount = \App\Models\Attendance::where('status', 'absent')->count();
        $students = \App\Models\Student::latest()->take(5)->get();
    ?>

    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,#020817_0%,#0f172a_100%)]">
        <?php echo $__env->make('partials.main-sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

        <div class="md:ml-80">
            <header class="border-b border-slate-200/80 bg-white/75 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 md:px-8">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Overview</p>
                        <h1 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white"><?php echo e($schoolName); ?> Dashboard</h1>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 md:block">
                            Today: <?php echo e(now()->format('D, M d')); ?>

                        </div>

                        <button id="themeToggle" type="button" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                            ☀️ / 🌙
                        </button>

                        <button id="cyberpunkToggle" type="button" class="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
                            Cyberpunk
                        </button>

                        <a href="<?php echo e(route('students.admission-form')); ?>" class="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20">
                            Admission Form
                        </a>
                    </div>
                </div>
            </header>

            <main class="space-y-8 p-6 md:p-8">
                <section class="flex flex-wrap gap-2">
                    <button class="chip rounded-full border border-indigo-500 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-500/20 dark:border-indigo-400/50 dark:text-indigo-200" data-filter="all">All</button>
                    <button class="chip rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" data-filter="students">Students</button>
                    <button class="chip rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" data-filter="attendance">Attendance</button>
                    <button class="chip rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" data-filter="fees">Fees</button>
                    <button class="chip rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" data-filter="exams">Exams</button>
                </section>

                <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <a href="<?php echo e(route('students.index')); ?>" data-module="students" class="block rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-glow backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-500/50">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Students</p>
                                <h3 class="mt-3 text-3xl font-bold text-slate-900 dark:text-white"><?php echo e($studentCount); ?></h3>
                            </div>
                            <span class="rounded-xl bg-indigo-100 px-2.5 py-2 text-xl dark:bg-indigo-500/10">🎓</span>
                        </div>
                        <div class="mt-4 flex items-center justify-between">
                            <p class="text-xs text-emerald-600">+12% this month</p>
                            <svg viewBox="0 0 100 40" class="h-8 w-20 text-indigo-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 28C14 28 18 18 30 18C42 18 46 30 58 30C70 30 74 10 86 10C92 10 96 12 100 16V40H0V28Z" fill="currentColor" fill-opacity="0.12"/>
                                <path d="M0 28C14 28 18 18 30 18C42 18 46 30 58 30C70 30 74 10 86 10C92 10 96 12 100 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </a>

                    <a href="<?php echo e(route('attendance.index')); ?>" data-module="attendance" class="block rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-glow backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-500/50">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Attendance</p>
                                <h3 class="mt-3 text-3xl font-bold text-slate-900 dark:text-white"><?php echo e($attendanceCount); ?></h3>
                            </div>
                            <span class="rounded-xl bg-emerald-100 px-2.5 py-2 text-xl dark:bg-emerald-500/10">✅</span>
                        </div>
                        <div class="mt-4 flex items-center justify-between">
                            <p class="text-xs text-emerald-600"><?php echo e($presentCount); ?> present / <?php echo e($absentCount); ?> absent</p>
                            <svg viewBox="0 0 100 40" class="h-8 w-20 text-emerald-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 20C14 20 18 22 30 22C42 22 46 14 58 14C70 14 74 26 86 26C92 26 96 24 100 20V40H0V20Z" fill="currentColor" fill-opacity="0.12"/>
                                <path d="M0 20C14 20 18 22 30 22C42 22 46 14 58 14C70 14 74 26 86 26C92 26 96 24 100 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </a>

                    <a href="<?php echo e(route('fees.index')); ?>" data-module="fees" class="block rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-glow backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-amber-500/50">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Fees Collected</p>
                                <h3 class="mt-3 text-3xl font-bold text-slate-900 dark:text-white">$<?php echo e(number_format($feeTotal, 2)); ?></h3>
                            </div>
                            <span class="rounded-xl bg-amber-100 px-2.5 py-2 text-xl dark:bg-amber-500/10">💰</span>
                        </div>
                        <p class="mt-4 text-xs text-amber-600">Target on track</p>
                    </a>

                    <a href="<?php echo e(route('exams.index')); ?>" data-module="exams" class="block rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-glow backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-sky-500/50">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Exams</p>
                                <h3 class="mt-3 text-3xl font-bold text-slate-900 dark:text-white"><?php echo e($examCount); ?></h3>
                            </div>
                            <span class="rounded-xl bg-sky-100 px-2.5 py-2 text-xl dark:bg-sky-500/10">📝</span>
                        </div>
                        <p class="mt-4 text-xs text-sky-600"><?php echo e($examCount > 0 ? 'Scheduled' : 'No exams yet'); ?></p>
                    </a>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glow backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Admissions</p>
                            <h3 class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Jump straight into admission and student setup</h3>
                        </div>
                        <a href="<?php echo e(route('students.admission-form')); ?>" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Open admission form</a>
                    </div>
                    <div class="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60 md:grid-cols-3">
                        <a href="<?php echo e(route('students.admission-form')); ?>" class="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800">New admission</a>
                        <a href="<?php echo e(route('students.index')); ?>" class="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800">Student records</a>
                        <a href="<?php echo e(route('idcards.index')); ?>" class="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800">Generate ID cards</a>
                    </div>
                </section>

                <section class="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                    <div class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glow backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                        <div class="mb-5 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Performance overview</p>
                                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Operations snapshot</h2>
                            </div>
                            <span class="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">This month</span>
                        </div>

                        <div class="grid gap-4 md:grid-cols-3">
                            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                                <p class="text-sm text-slate-500 dark:text-slate-400">Student growth</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900 dark:text-white">+18%</p>
                                <p class="mt-2 text-xs text-emerald-600">Above target</p>
                            </div>
                            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                                <p class="text-sm text-slate-500 dark:text-slate-400">Attendance rate</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900 dark:text-white"><?php echo e($attendanceCount > 0 ? round(($presentCount / max($attendanceCount, 1)) * 100) : 0); ?>%</p>
                                <p class="mt-2 text-xs text-sky-600">Steady</p>
                            </div>
                            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                                <p class="text-sm text-slate-500 dark:text-slate-400">Fee compliance</p>
                                <p class="mt-3 text-2xl font-bold text-slate-900 dark:text-white">82%</p>
                                <p class="mt-2 text-xs text-amber-600">Needs follow-up</p>
                            </div>
                        </div>

                        <div class="mt-6 grid gap-4 md:grid-cols-2">
                            <div class="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-5 text-white">
                                <div class="flex items-center justify-between">
                                    <p class="text-sm text-indigo-100">Admissions</p>
                                    <span class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">+9%</span>
                                </div>
                                <h3 class="mt-3 text-3xl font-bold">24</h3>
                                <div class="mt-4 overflow-hidden rounded-full bg-white/10">
                                    <div class="h-2 w-[76%] rounded-full bg-white"></div>
                                </div>
                                <p class="mt-2 text-sm text-indigo-100">New students this term</p>
                            </div>
                            <div class="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 p-5 text-white">
                                <div class="flex items-center justify-between">
                                    <p class="text-sm text-emerald-100">Fee Status</p>
                                    <span class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">Stable</span>
                                </div>
                                <h3 class="mt-3 text-3xl font-bold">87%</h3>
                                <div class="mt-4 overflow-hidden rounded-full bg-white/10">
                                    <div class="h-2 w-[87%] rounded-full bg-white"></div>
                                </div>
                                <p class="mt-2 text-sm text-emerald-100">Paid on time</p>
                            </div>
                        </div>

                        <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <div class="mb-3 flex items-center justify-between">
                                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Performance trend</p>
                                <span class="text-xs text-emerald-600">+14.2%</span>
                            </div>
                            <svg viewBox="0 0 520 120" class="h-24 w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
                                        <stop offset="0%" stop-color="#818cf8" />
                                        <stop offset="100%" stop-color="#22c55e" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,90 C70,90 80,60 120,70 S210,20 260,42 S360,95 430,54 S490,30 520,28" fill="none" stroke="url(#lineGlow)" stroke-width="4" stroke-linecap="round" class="animate-pulse"/>
                                <path d="M0,90 C70,90 80,60 120,70 S210,20 260,42 S360,95 430,54 S490,30 520,28 L520,120 L0,120 Z" fill="rgba(99,102,241,0.08)"/>
                            </svg>
                        </div>
                    </div>

                    <div class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glow backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                        <div class="mb-5 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Quick actions</p>
                                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Modules</h2>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <a href="<?php echo e(route('students.index')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Student Records</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Manage roster</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('students.classes')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Classes</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Class-wise student overview</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('students.sections')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Sections</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Section-wise grouping</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('attendance.index')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Attendance</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Daily check-in</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('fees.index')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Fees</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Challans & payments</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('exams.index')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Exams</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Schedules & planning</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('datesheets.index')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">Date Sheets</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Schedules by class</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                            <a href="<?php echo e(route('idcards.index')); ?>" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/80">
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200">ID Cards</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Live preview and print</p>
                                </div>
                                <span class="text-xl">→</span>
                            </a>
                        </div>
                    </div>
                </section>

                <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glow backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                        <div class="mb-5 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Recent students</p>
                                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Newest enrollments</h2>
                            </div>
                            <a href="<?php echo e(route('students.index')); ?>" class="text-sm font-medium text-indigo-600 dark:text-indigo-400">View all</a>
                        </div>

                        <div class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                            <table class="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                                <thead class="bg-slate-50 dark:bg-slate-800/80">
                                    <tr>
                                        <th class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Student</th>
                                        <th class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Class</th>
                                        <th class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Email</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                                    <?php $__empty_1 = true; $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100"><?php echo e($student->name); ?></td>
                                            <td class="px-4 py-3 text-slate-600 dark:text-slate-300"><?php echo e($student->class_room ?? 'N/A'); ?></td>
                                            <td class="px-4 py-3 text-slate-600 dark:text-slate-300"><?php echo e($student->email); ?></td>
                                        </tr>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="3" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No students enrolled yet.</td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-glow dark:border-slate-700">
                        <div class="mb-5 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-300">Activity feed</p>
                                <h2 class="mt-1 text-xl font-bold">Recent activity</h2>
                            </div>
                            <span class="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-300">Live</span>
                        </div>

                        <div class="space-y-4">
                            <div class="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs uppercase tracking-[0.2em] text-slate-400">Student</span>
                                    <span class="text-[10px] text-slate-500">2 min ago</span>
                                </div>
                                <p class="mt-2 text-sm text-slate-200">Aisha Khan enrolled in Grade 8.</p>
                            </div>
                            <div class="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs uppercase tracking-[0.2em] text-slate-400">Fee</span>
                                    <span class="text-[10px] text-slate-500">18 min ago</span>
                                </div>
                                <p class="mt-2 text-sm text-slate-200">Fee challan paid for November batch.</p>
                            </div>
                            <div class="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs uppercase tracking-[0.2em] text-slate-400">Exam</span>
                                    <span class="text-[10px] text-slate-500">1 hr ago</span>
                                </div>
                                <p class="mt-2 text-sm text-slate-200">Mid-term schedule published for 4 classes.</p>
                            </div>
                        </div>

                        <div class="mt-6 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 p-4 ring-1 ring-indigo-400/30">
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-300">Account summary</p>
                            <h2 class="mt-2 text-2xl font-bold">Premium plan</h2>
                            <div class="mt-4 space-y-3">
                                <div>
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Subscription</p>
                                    <p class="mt-1 text-lg font-bold">School Pro</p>
                                </div>
                                <div>
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Next renewal</p>
                                    <p class="mt-1 text-lg font-bold">12 Aug 2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <script>
        const root = document.documentElement;
        const toggle = document.getElementById('themeToggle');
        const cyberToggle = document.getElementById('cyberpunkToggle');
        const savedTheme = localStorage.getItem('lama-dashboard-theme');
        const savedCyberMode = localStorage.getItem('lama-dashboard-cyberpunk');

        const applyTheme = (theme) => {
            const dark = theme === 'dark';
            root.classList.toggle('dark', dark);
            if (toggle) {
                toggle.textContent = dark ? '🌙' : '☀️';
            }
        };

        const applyCyberMode = (enabled) => {
            document.body.classList.toggle('cyberpunk-mode', enabled);
            if (cyberToggle) {
                cyberToggle.textContent = enabled ? 'Classic' : 'Cyberpunk';
                cyberToggle.classList.toggle('bg-cyan-500/20', enabled);
                cyberToggle.classList.toggle('text-cyan-200', enabled);
            }
        };

        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            applyTheme('light');
        }

        if (savedCyberMode === 'true') {
            applyCyberMode(true);
        }

        toggle?.addEventListener('click', () => {
            const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem('lama-dashboard-theme', nextTheme);
            applyTheme(nextTheme);
        });

        cyberToggle?.addEventListener('click', () => {
            const nextMode = !document.body.classList.contains('cyberpunk-mode');
            localStorage.setItem('lama-dashboard-cyberpunk', String(nextMode));
            applyCyberMode(nextMode);
        });

        document.querySelectorAll('.chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter;
                document.querySelectorAll('.chip').forEach((btn) => {
                    const isActive = btn === chip;
                    btn.classList.toggle('border-indigo-500', isActive);
                    btn.classList.toggle('bg-indigo-500/10', isActive);
                    btn.classList.toggle('text-indigo-700', isActive);
                    btn.classList.toggle('dark:border-indigo-400/50', isActive);
                    btn.classList.toggle('dark:text-indigo-200', isActive);
                    btn.classList.toggle('border-slate-200', !isActive);
                    btn.classList.toggle('bg-white', !isActive);
                    btn.classList.toggle('text-slate-600', !isActive);
                    btn.classList.toggle('dark:border-slate-700', !isActive);
                    btn.classList.toggle('dark:bg-slate-900', !isActive);
                    btn.classList.toggle('dark:text-slate-300', !isActive);
                });

                document.querySelectorAll('[data-module]').forEach((card) => {
                    const visible = filter === 'all' || card.dataset.module === filter;
                    card.style.display = visible ? '' : 'none';
                });
            });
        });
    </script>
</body>
</html>
<?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/dashboard.blade.php ENDPATH**/ ?>