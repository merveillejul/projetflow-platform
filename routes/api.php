<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Models\Task;

Route::get('/', fn() => response()->json(['message' => 'ProjectFlow API fonctionne']));
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function(Request $request) {
        $user = $request->user();
        return response()->json($user);
    });
    Route::put('/user',    [AuthController::class, 'updateProfile']);

    // Changement mot de passe — UNE SEULE FOIS avec vérification ancien mdp
    Route::post('/auth/change-password', function (Request $request) {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:12|confirmed',
        ]);
        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }
        $request->user()->update([
            'password'    => Hash::make($request->password),
            'first_login' => false,
        ]);
        return response()->json(['message' => 'Mot de passe mis à jour.']);
    });

    // Mes tâches assignées
    Route::get('/my-tasks', function(Request $request) {
        return Task::where('assigne_a', $request->user()->id)
            ->with('project')
            ->get();
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Projets — lecture pour tous
    Route::get('/projects',           [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    // Projets — création réservée chef
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('role:chef');

    // Projets — modification réservée chef (pour changer statut aussi)
    Route::put('/projects/{project}',    [ProjectController::class, 'update'])->middleware('role:chef');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('role:chef');

    // Tâches — lecture pour tous
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}',             [TaskController::class, 'show']);

    // Tâches — création et suppression réservées chef
    Route::post('/tasks',          [TaskController::class, 'store'])->middleware('role:chef');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->middleware('role:chef');

    // Tâches — mise à jour statut — membre ne peut mettre à jour QUE ses propres tâches (vérifié dans le controller)
    Route::put('/tasks/{task}', [TaskController::class, 'update']);

    // Membres
    Route::get('/projects/{project}/members',           [ProjectMemberController::class, 'index']);
    Route::post('/projects/{project}/members',          [ProjectMemberController::class, 'store'])->middleware('role:chef');
    Route::delete('/projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy'])->middleware('role:chef');

    // Commentaires — tous les rôles peuvent commenter
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
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Utilisateurs — chef peut voir la liste pour ajouter des membres
    Route::get('/users', [AuthController::class, 'listUsers'])->middleware('role:admin,chef');

    // Admin uniquement
    Route::patch('/users/{user}/validate', [AuthController::class, 'validateAccount'])->middleware('role:admin');
    Route::put('/users/{user}/role',       [AuthController::class, 'updateRole'])->middleware('role:admin');
    Route::delete('/users/{user}',         [AuthController::class, 'deleteUser'])->middleware('role:admin');

    Route::post('/user/photo', function (Request $request) {
        $request->validate(['photo' => 'required|image|max:2048']);
        
        $user = $request->user();
        
        if ($user->photo && \Storage::disk('public')->exists(str_replace(url('storage/'), '', $user->photo))) {
            \Storage::disk('public')->delete(str_replace(url('storage/'), '', $user->photo));
        }
        
        $path = $request->file('photo')->store('photos', 'public');
        $fullUrl = 'http://192.168.1.179:8000/storage/' . $path;
        $user->update(['photo' => $fullUrl]);
        
        return response()->json([
            'message' => 'Photo mise à jour.',
            'photo'   => $fullUrl
        ]);
    });
});