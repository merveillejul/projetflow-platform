<?php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Models\Task;


// ═══════════════════════════════════════
// JUSTE AVANT les routes publiques — définir la règle
// ═══════════════════════════════════════
RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)
        ->by($request->input('email') . '|' . $request->ip())
        ->response(function () {
            return response()->json([
                'message' => 'Trop de tentatives. Réessayez dans 1 minute.',
            ], 429);
        });
});

// ═══════════════════════════════════════
// ROUTES PUBLIQUES
// ═══════════════════════════════════════
Route::get('/', fn() => response()->json(['message' => 'ProjectFlow API fonctionne']));
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('throttle:login')->post('/login', [AuthController::class, 'login']);

// Mot de passe oublié — pas besoin d'être connecté
Route::post('/auth/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $user = \App\Models\User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'Si cet email existe, un lien vous a été envoyé.']);
    }

    $token = Str::random(64);

    \DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $user->email],
        ['token' => Hash::make($token), 'created_at' => now()]
    );

    $resetUrl = 'https://projectflow-web-pink.vercel.app/reset-password?token=' . $token . '&email=' . urlencode($user->email);

    \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\ReinitialisationMdp($user->nom, $resetUrl));

    return response()->json(['message' => 'Si cet email existe, un lien vous a été envoyé.']);
});

Route::post('/auth/reset-password', function (Request $request) {
    $request->validate([
        'email'    => 'required|email',
        'token'    => 'required',
        'password' => [
        'required',
        'min:12',
        'regex:/[A-Z]/',
        'regex:/[a-z]/',
        'regex:/[0-9]/',
        'regex:/[@$!%*#?&^_\-+=]/',
        'confirmed',
    ],

    ]);

    $record = \DB::table('password_reset_tokens')
        ->where('email', $request->email)
        ->first();

    if (!$record || !Hash::check($request->token, $record->token)) {
        return response()->json(['message' => 'Token invalide ou expiré.'], 422);
    }

    if (now()->diffInMinutes($record->created_at) > 60) {
        \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        return response()->json(['message' => 'Token expiré. Refaites la demande.'], 422);
    }

    $user = \App\Models\User::where('email', $request->email)->first();
    $user->update(['password' => Hash::make($request->password)]);

    \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

    return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
});

// ═══════════════════════════════════════
// ROUTES PROTÉGÉES
// ═══════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function(Request $request) {
        return response()->json($request->user());
    });
    Route::put('/user', [AuthController::class, 'updateProfile']);

    // Changement mot de passe
    //  validation forte + révocation des tokens :
    Route::post('/auth/change-password', function (Request $request) {
        $request->validate([
            'current_password' => 'required',
            'password' => [
                'required',
                'min:12',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&^_\-+=]/',
                'confirmed',
            ],
        ], [
            'password.min'      => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex'    => 'Doit contenir majuscule, minuscule, chiffre et caractère spécial.',
            'password.confirmed'=> 'La confirmation ne correspond pas.',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $request->user()->update([
            'password'    => Hash::make($request->password),
            'first_login' => false,
        ]);

        // ✅ Révoquer tous les tokens — force une reconnexion sécurisée
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Mot de passe mis à jour. Veuillez vous reconnecter.']);
    });

    // Première connexion
    Route::post('/auth/first-login-password', function (Request $request) {
        $request->validate(['password' => 'required|min:12']);
        $request->user()->update([
            'password'    => Hash::make($request->password),
            'first_login' => false,
        ]);
        return response()->json(['message' => 'Mot de passe défini.']);
    });

    // Photo de profil
    Route::post('/user/photo', function (Request $request) {
        $request->validate(['photo' => 'required|image|max:2048']);
        $user = $request->user();

        // Supprimer l'ancienne photo si elle existe
        if ($user->photo) {
            $oldPath = str_replace(url('/storage/'), '', $user->photo);
            if (\Storage::disk('public')->exists($oldPath)) {
                \Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('photo')->store('photos', 'public');
        $fullUrl = 'https://projetflow-platform-production.up.railway.app/storage/' . $path;
        $user->update(['photo' => $fullUrl]);

        return response()->json(['message' => 'Photo mise à jour.', 'photo' => $fullUrl]);
    });

    // Mes tâches assignées
    Route::get('/my-tasks', function(Request $request) {
        return Task::where('assigne_a', $request->user()->id)->with('project')->get();
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Projets
    Route::get('/projects',           [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::post('/projects',          [ProjectController::class, 'store'])->middleware('role:chef');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->middleware('role:chef');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('role:chef');

    // Tâches
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}',             [TaskController::class, 'show']);
    Route::post('/tasks',                   [TaskController::class, 'store'])->middleware('role:chef');
    Route::put('/tasks/{task}',             [TaskController::class, 'update']);
    Route::delete('/tasks/{task}',          [TaskController::class, 'destroy'])->middleware('role:chef');

    // Membres
    Route::get('/projects/{project}/members',           [ProjectMemberController::class, 'index']);
    Route::post('/projects/{project}/members',          [ProjectMemberController::class, 'store'])->middleware('role:chef');
    Route::delete('/projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy'])->middleware('role:chef');

    // Commentaires
    Route::get('/tasks/{task}/comments',  [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}',  [CommentController::class, 'destroy']);

    // Fichiers
    Route::get('/projects/{project}/files',  [FileController::class, 'index']);
    Route::get('/files/{file}/download',     [FileController::class, 'download']);
    Route::post('/projects/{project}/files', [FileController::class, 'store'])->middleware('role:chef');
    Route::delete('/files/{file}',           [FileController::class, 'destroy'])->middleware('role:chef');

    // Notifications
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read',   [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all',    [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);

    // Utilisateurs
    Route::get('/users', [AuthController::class, 'listUsers'])->middleware('role:admin,chef');

    // Admin
    Route::patch('/users/{user}/validate', [AuthController::class, 'validateAccount'])->middleware('role:admin');
    Route::put('/users/{user}/role',       [AuthController::class, 'updateRole'])->middleware('role:admin');
    Route::delete('/users/{user}',         [AuthController::class, 'deleteUser'])->middleware('role:admin');
});