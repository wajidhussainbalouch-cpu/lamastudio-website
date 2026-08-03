<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    public function storeMarks(Request $request)
    {
        $school = Auth::user()->school;

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'marks' => 'required|array', // student_id => [subject => obtained_marks]
            'subject' => 'required|string',
            'total_marks' => 'required|numeric',
        ]);

        foreach ($validated['marks'] as $studentId => $obtainedMarks) {
            Result::updateOrCreate(
                [
                    'school_id' => $school->id,
                    'exam_id' => $validated['exam_id'],
                    'student_id' => $studentId,
                    'subject' => $validated['subject'],
                ],
                [
                    'total_marks' => $validated['total_marks'],
                    'obtained_marks' => $obtainedMarks,
                ]
            );
        }

        return redirect()->back()->with('success', 'Exam results saved successfully!');
    }
}