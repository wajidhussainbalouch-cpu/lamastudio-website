<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IdCardController extends Controller
{
    public function printStudentId($studentId)
    {
        $school = Auth::user()->school;
        $student = Student::where('school_id', $school->id)->findOrFail($studentId);

        return view('school.id_card_print', compact('student', 'school'));
    }
}