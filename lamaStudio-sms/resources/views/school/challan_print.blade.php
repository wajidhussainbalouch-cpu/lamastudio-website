<div class="max-w-xl mx-auto p-6 bg-white border border-gray-300 rounded shadow-md mt-6">
    <div class="text-center border-b pb-4 mb-4">
        <h1 class="text-xl font-bold uppercase text-gray-800">LamaStudio School Management System</h1>
        <p class="text-sm text-gray-600">Fee Voucher / Challan Slip</p>
    </div>

    <div class="flex justify-between text-sm mb-4">
        <div>
            <p><strong>Challan No:</strong> {{ $fee->challan_no }}</p>
            <p><strong>Month:</strong> {{ $fee->month }}</p>
        </div>
        <div>
            <p><strong>Due Date:</strong> {{ $fee->due_date }}</p>
            <p><strong>Status:</strong> <span class="uppercase font-semibold {{ $fee->status == 'paid' ? 'text-green-600' : 'text-red-600' }}">{{ $fee->status }}</span></p>
        </div>
    </div>

    <div class="mb-6 bg-gray-50 p-4 rounded border">
        <p><strong>Student Name:</strong> {{ $fee->student->name }}</p>
        <p><strong>Class:</strong> {{ $fee->student->class }}</p>
        <p><strong>Roll No / B-Form:</strong> {{ $fee->student->b_form_or_roll_no }}</p>
    </div>

    <div class="flex justify-between items-center border-t pt-4 mb-6">
        <span class="text-lg font-bold">Total Payable Amount:</span>
        <span class="text-xl font-extrabold text-indigo-600">Rs. {{ number_format($fee->amount, 2) }}</span>
    </div>

    <div class="text-center">
        <button onclick="window.print()" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Print Voucher</button>
    </div>
</div>