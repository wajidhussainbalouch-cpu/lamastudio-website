<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $school = Auth::user()->school;

        $validated = $request->validate([
            'date' => 'required|date',
            'attendance' => 'required|array', // Array of student_id => status
            'attendance.*' => 'required|in:present,absent,leave',
        ]);

        foreach ($validated['attendance'] as $studentId => $status) {
            Attendance::updateOrCreate(
                [
                    'school_id' => $school->id,
                    'student_id' => $studentId,
                    'date' => $validated['date'],
                ],
                [
                    'status' => $status
                ]
            );
        }

        return redirect()->back()->with('success', 'Attendance marked successfully!');
    }
}