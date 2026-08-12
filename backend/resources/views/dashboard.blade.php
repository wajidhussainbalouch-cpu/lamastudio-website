<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Dashboard</title>
        <!-- Include Tailwind / Vite setup -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC] min-h-screen flex flex-col">
        
        <!-- Simple Navigation Bar -->
        <header class="w-full border-b border-black/10 dark:border-white/10 py-4 px-6 flex justify-between items-center">
            <h1 class="font-bold text-lg">My App Dashboard</h1>
            
            <!-- Logout Form -->
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="text-sm text-red-600 dark:text-red-400 hover:underline">
                    Log out
                </button>
            </form>
        </header>

        <!-- Main Dashboard Content -->
        <main class="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
            <div class="bg-white dark:bg-[#161615] border border-black/10 dark:border-white/10 rounded-lg p-6 shadow-sm">
                <h2 class="text-xl font-semibold mb-2">Welcome back, {{ auth()->user()->name }}!</h2>
                <p class="text-[#706f6c] dark:text-[#A1A09A]">You are logged in successfully.</p>
            </div>
        </main>

    </body>
</html>