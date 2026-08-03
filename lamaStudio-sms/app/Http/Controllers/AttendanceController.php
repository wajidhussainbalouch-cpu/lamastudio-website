<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use App\Services\SmsService;
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
            // Update or create daily attendance record
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

            // Trigger SMS notification if the student is absent
            if ($status === 'absent') {
                $student = Student::find($studentId);

                if ($student && !empty($student->guardian_phone)) {
                    $message = "Alert from {$school->name}: Your child {$student->name} was marked ABSENT today ({$validated['date']}).";
                    
                    // Dispatch SMS using your SMS service
                    SmsService::sendSms($student->guardian_phone, $message);
                }
            }
        }

        return redirect()->back()->with('success', 'Attendance marked and SMS alerts sent for absent students successfully!');
    }
}