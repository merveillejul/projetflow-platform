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

    $token = \Illuminate\Support\Str::random(64);

    \DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $user->email],
        ['token' => \Illuminate\Support\Facades\Hash::make($token), 'created_at' => now()]
    );

    $resetUrl = env('FRONTEND_URL', 'https://projectflow-web-pink.vercel.app')
        . '/reset-password?token=' . $token
        . '&email=' . urlencode($user->email);

    // ✅ API HTTP Brevo — pas de SMTP, pas de timeout
    try {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'api-key' => env('BREVO_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', [
            'sender' => [
                'name'  => 'ProjectFlow',
                'email' => 'merveillenourryssou@outlook.fr',
            ],
            'to' => [[
                'email' => $user->email,
                'name'  => $user->nom,
            ]],
            'subject' => 'Réinitialisation de votre mot de passe ProjectFlow',
            'htmlContent' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1e3a5f; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">ProjectFlow</h1>
                    </div>
                    <div style="padding: 32px; background: #f8fafc;">
                        <h2 style="color: #0f172a;">Bonjour ' . $user->nom . ',</h2>
                        <p style="color: #475569;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        <p style="color: #475569;">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="' . $resetUrl . '" 
                               style="background: #1d4ed8; color: white; padding: 12px 32px; 
                                      border-radius: 8px; text-decoration: none; font-weight: bold;">
                                Réinitialiser mon mot de passe
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px;">Ce lien expire dans 60 minutes.</p>
                        <p style="color: #94a3b8; font-size: 13px;">Si vous n\'avez pas fait cette demande, ignorez cet email.</p>
                    </div>
                </div>
            ',
        ]);

        if (!$response->successful()) {
            \Log::error('Brevo API error: ' . $response->body());
        }

    } catch (\Exception $e) {
        \Log::error('Mail error: ' . $e->getMessage());
    }

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
    ], [
        'password.min'       => 'Le mot de passe doit contenir au moins 12 caractères.',
        'password.regex'     => 'Doit contenir majuscule, minuscule, chiffre et caractère spécial.',
        'password.confirmed' => 'La confirmation ne correspond pas.',
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

    // ✅ Empêcher de remettre le même mot de passe
    if (Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Le nouveau mot de passe doit être différent de l\'ancien.'], 422);
    }

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
            'password.min'       => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex'     => 'Doit contenir majuscule, minuscule, chiffre et caractère spécial.',
            'password.confirmed' => 'La confirmation ne correspond pas.',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        // ✅ Empêcher de remettre le même mot de passe
        if (Hash::check($request->password, $request->user()->password)) {
            return response()->json(['message' => 'Le nouveau mot de passe doit être différent de l\'ancien.'], 422);
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

    // Photo de profil — Cloudinary
    Route::post('/user/photo', function (Request $request) {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        try {
            $result = cloudinary()->upload($request->file('photo')->getRealPath(), [
                'folder'    => 'projectflow/photos',
                'public_id' => 'user_' . $user->id,
                'overwrite' => true,
                'transformation' => [
                    'width' => 400, 'height' => 400,
                    'crop' => 'fill', 'gravity' => 'face',
                ],
            ]);

            $photoUrl = $result->getSecurePath();
            $user->update(['photo' => $photoUrl]);

            return response()->json([
                'message' => 'Photo mise à jour.',
                'photo'   => $photoUrl,
            ]);

        } catch (\Exception $e) {
            \Log::error('Cloudinary error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur upload: ' . $e->getMessage()], 500);
        }
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