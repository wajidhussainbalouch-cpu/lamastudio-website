<div class="max-w-xl mx-auto p-6 bg-white border border-gray-300 rounded shadow-md mt-6">
    <div class="text-center border-b pb-4 mb-4">
        <h1 class="text-xl font-bold uppercase text-gray-800">{{ $fee->school->name }}</h1>
        <p class="text-sm text-gray-600">Official Fee Payment Receipt</p>
    </div>

    <div class="flex justify-between text-sm mb-4">
        <div>
            <p><strong>Receipt No / Challan:</strong> {{ $fee->challan_no }}</p>
            <p><strong>Fee Month:</strong> {{ $fee->month }}</p>
        </div>
        <div>
            <p><strong>Payment Date:</strong> {{ $fee->updated_at->format('d-M-Y') }}</p>
            <p><strong>Status:</strong> <span class="uppercase font-semibold text-green-600">PAID</span></p>
        </div>
    </div>

    <div class="mb-6 bg-gray-50 p-4 rounded border">
        <p><strong>Student Name:</strong> {{ $fee->student->name }}</p>
        <p><strong>Class:</strong> {{ $fee->student->class }}</p>
        <p><strong>Roll No / B-Form:</strong> {{ $fee->student->b_form_or_roll_no }}</p>
    </div>

    <div class="flex justify-between items-center border-t pt-4 mb-6">
        <span class="text-lg font-bold">Amount Paid:</span>
        <span class="text-xl font-extrabold text-green-600">Rs. {{ number_format($fee->amount, 2) }}</span>
    </div>

    <div class="flex justify-between text-xs text-gray-500 pt-8 border-t mt-12">
        <p>Authorized Signature ___________________</p>
        <p>System Generated via LamaStudio SaaS</p>
    </div>

    <div class="text-center mt-6">
        <button onclick="window.print()" class="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">Print Receipt</button>
    </div>
</div>