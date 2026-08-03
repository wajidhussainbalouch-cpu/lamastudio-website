<div class="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-6">
    <h2 class="text-xl font-bold text-gray-800">LamaStudio School Portal</h2>
    <p class="text-sm text-gray-600">Subscription Plan: 
        <span class="font-semibold uppercase text-indigo-600">{{ $school->subscription_status }}</span>
    </p>

    <div class="mt-4 bg-gray-50 p-4 rounded border">
        @php
            $totalStudents = $school->students()->count();
            $limit = $school->student_limit;
            $percentage = ($totalStudents / $limit) * 100;
        @endphp

        <p class="text-sm font-medium text-gray-700">Free Tier Usage: {{ $totalStudents }} / {{ $limit }} Students</p>
        
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div class="bg-indigo-600 h-2.5 rounded-full" style="width: {{ min($percentage, 100) }}%"></div>
        </div>

        @if($school->subscription_status === 'free' && $totalStudents >= $limit)
            <div class="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded">
                <strong>Limit Reached:</strong> You cannot add more students. <a href="/upgrade" class="underline font-bold">Upgrade to Full Package</a>
            </div>
        @endif
    </div>
</div>