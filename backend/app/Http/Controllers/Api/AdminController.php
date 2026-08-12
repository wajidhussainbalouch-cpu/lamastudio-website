<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Display the admin panel dashboard.
     */
    public function index()
    {
        // You can return a view or a JSON response depending on how your app is built
        // Example for a Blade view:
        return view('admin.dashboard');

        // Or if it's an API response:
        // return response()->json(['message' => 'Welcome to the Admin Panel']);
    }
}