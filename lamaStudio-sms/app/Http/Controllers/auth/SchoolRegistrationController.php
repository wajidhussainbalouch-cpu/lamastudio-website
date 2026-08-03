<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SchoolRegistrationController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:schools',
            'phone' => 'required|string|max:20',
            'admin_name' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create the school workspace
        $school = School::create([
            'name' => $validated['school_name'],
            'slug' => Str::slug($validated['school_name']) . '-' . rand(100, 999),
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subscription_status' => 'free',
            'student_limit' => 50,
        ]);

        // Create the main admin user for this school
        User::create([
            'school_id' => $school->id,
            'name' => $validated['admin_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'school_admin',
        ]);

        return redirect()->to('/login')->with('success', 'School registered successfully! You can now log in and manage up to 50 students for free.');
    }
}