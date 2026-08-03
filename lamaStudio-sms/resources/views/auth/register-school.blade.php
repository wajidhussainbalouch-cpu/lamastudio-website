<div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">LamaStudio School Portal</h1>
        <p class="text-sm text-gray-600">Register your school & get 50 students free!</p>
    </div>

    <form method="POST" action="{{ route('school.register.submit') }}">
        @csrf

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">School Name</label>
            <input type="text" name="school_name" required class="w-full mt-1 p-2 border rounded-md">
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Principal / Admin Name</label>
            <input type="text" name="admin_name" required class="w-full mt-1 p-2 border rounded-md">
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Official Email</label>
            <input type="email" name="email" required class="w-full mt-1 p-2 border rounded-md">
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" name="phone" required class="w-full mt-1 p-2 border rounded-md">
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" required class="w-full mt-1 p-2 border rounded-md">
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="password_confirmation" required class="w-full mt-1 p-2 border rounded-md">
        </div>

        <button type="submit" class="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 font-bold">Register School Free</button>
    </form>
</div>