use Illuminate\Support\Facades\Route;

// Public Welcome Page
get('/', function () {
    return view('welcome');
});

// Protected Dashboard Route (Requires Authentication)
Route::middleware(['auth', 'verified'])->group(function () {
    get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});