<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Admin Panel - Dashboard</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC] min-h-screen flex flex-col">
        
        <!-- Admin Navigation Bar -->
        <header class="w-full border-b border-black/10 dark:border-white/10 py-4 px-6 flex justify-between items-center bg-white dark:bg-[#161615]">
            <div class="flex items-center space-x-4">
                <h1 class="font-bold text-lg">Admin Panel</h1>
                <span class="text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded font-medium">Administrator</span>
            </div>
            
            <div class="flex items-center space-x-4">
                <a href="{{ route('dashboard') }}" class="text-sm text-[#706f6c] dark:text-[#A1A09A] hover:underline">User Dashboard</a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="text-sm text-red-600 dark:text-red-400 hover:underline">
                        Log out
                    </button>
                </form>
            </div>
        </header>

        <!-- Admin Content Area -->
        <main class="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 space-y-6">
            
            <!-- Welcome Card -->
            <div class="bg-white dark:bg-[#161615] border border-black/10 dark:border-white/10 rounded-lg p-6 shadow-sm">
                <h2 class="text-xl font-semibold mb-2">System Overview</h2>
                <p class="text-[#706f6c] dark:text-[#A1A09A]">Welcome back, Admin {{ auth()->user()->name }}. Manage your tenant schools, system logs, and trackers here.</p>
            </div>

            <!-- Quick Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Stat 1 -->
                <div class="bg-white dark:bg-[#161615] border border-black/10 dark:border-white/10 rounded-lg p-6 shadow-sm">
                    <h3 class="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Tenant Schools</h3>
                    <p class="text-3xl font-bold mt-2">0</p>
                </div>
                <!-- Stat 2 -->
                <div class="bg-white dark:bg-[#161615] border border-black/10 dark:border-white/10 rounded-lg p-6 shadow-sm">
                    <h3 class="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Active Trackers</h3>
                    <p class="text-3xl font-bold mt-2">0</p>
                </div>
                <!-- Stat 3 -->
                <div class="bg-white dark:bg-[#161615] border border-black/10 dark:border-white/10 rounded-lg p-6 shadow-sm">
                    <h3 class="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Error Logs</h3>
                    <p class="text-3xl font-bold mt-2 text-red-500">0</p>
                </div>
            </div>

        </main>

    </body>
</html>