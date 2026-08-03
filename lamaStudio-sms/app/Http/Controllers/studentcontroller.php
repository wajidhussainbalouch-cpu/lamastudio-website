<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function store(Request $request)
    {
        $school = Auth::user()->school; // Get the currently logged-in school

        // Count current active students for this school
        $currentStudentCount = Student::where('school_id', $school->id)->count();

        // Check if school is on free tier and has reached the limit
        if ($school->subscription_status === 'free' && $currentStudentCount >= $school->student_limit) {
            return redirect()->back()->with('error', 'Free tier limit reached! Your school has reached the maximum limit of 50 students. Please upgrade to the full management system on lamastudio.pk to add more.');
        }

        // Validate incoming student data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'b_form_or_roll_no' => 'required|string|max:50',
            'class' => 'required|string|max:50',
            'guardian_phone' => 'required|string|max:20',
        ]);

        // Save new student tied to this specific school
        Student::create([
            'school_id' => $school->id,
            'name' => $validated['name'],
            'b_form_or_roll_no' => $validated['b_form_or_roll_no'],
            'class' => $validated['class'],
            'guardian_phone' => $validated['guardian_phone'],
        ]);

        return redirect()->back()->with('success', 'Student registered successfully!');
    }
}