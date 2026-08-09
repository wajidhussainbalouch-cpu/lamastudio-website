<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'wajid@lamastudio.pk'],
            [
                'name' => 'Wajid',
                // CHANGE THIS before deploying — see README "First admin login".
                'password' => Hash::make('change-me-now'),
            ]
        );
    }
}
