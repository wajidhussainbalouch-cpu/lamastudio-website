<div class="flex justify-center mt-10">
    <div class="w-80 h-48 bg-white border-2 border-indigo-900 rounded-xl shadow-lg p-4 flex flex-col justify-between relative overflow-hidden">
        <!-- Card Header -->
        <div class="text-center border-b pb-2">
            <h2 class="text-sm font-extrabold uppercase text-indigo-900 truncate">{{ $school->name }}</h2>
            <p class="text-[10px] text-gray-500 tracking-wider">OFFICIAL STUDENT ID CARD</p>
        </div>

        <!-- Card Body -->
        <div class="flex items-center space-x-4 my-auto">
            <div class="w-16 h-20 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs text-gray-500 rounded">
                Photo
            </div>
            <div class="text-xs space-y-1">
                <p><strong>Name:</strong> {{ $student->name }}</p>
                <p><strong>Class:</strong> {{ $student->class }}</p>
                <p><strong>Roll/ID:</strong> {{ $student->b_form_or_roll_no }}</p>
                <p><strong>Phone:</strong> {{ $student->guardian_phone }}</p>
            </div>
        </div>

        <!-- Card Footer -->
        <div class="text-center border-t pt-1">
            <p class="text-[9px] text-gray-600">If found, please return to school administration.</p>
        </div>
    </div>
</div>

<div class="text-center mt-6">
    <button onclick="window.print()" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm">Print ID Card</button>
</div>