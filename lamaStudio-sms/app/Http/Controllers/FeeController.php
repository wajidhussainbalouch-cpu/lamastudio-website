<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeeController extends Controller
{
    public function generateChallan(Request $request, $studentId)
    {
        $school = Auth::user()->school;
        $student = Student::where('school_id', $school->id)->findOrFail($studentId);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'month' => 'required|string|max:50',
            'due_date' => 'required|date',
        ]);

        // Generate a unique challan code
        $challanNo = 'LS-CH-' . strtoupper(uniqid());

        Fee::create([
            'school_id' => $school->id,
            'student_id' => $student->id,
            'challan_no' => $challanNo,
            'amount' => $validated['amount'],
            'month' => $validated['month'],
            'due_date' => $validated['due_date'],
            'status' => 'unpaid',
        ]);

        return redirect()->back()->with('success', 'Fee challan generated successfully!');
    }
}