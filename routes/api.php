<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| ROUTES PUBLIQUES
|--------------------------------------------------------------------------
*/
Route::get('/', fn() => response()->json(['message' => 'ProjectFlow API fonctionne']));
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| ROUTES PROTÉGÉES (tous les rôles connectés)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    fn(Request $request) => $request->user());
    Route::put('/user',    [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Projets — lecture pour tous
    Route::get('/projects',        [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    // Projets — écriture réservée chef et admin
    Route::post('/projects',           [ProjectController::class, 'store'])->middleware('role:admin,chef');
    Route::put('/projects/{project}',  [ProjectController::class, 'update'])->middleware('role:admin,chef');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('role:admin,chef');

    // Tâches — lecture pour tous
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}',             [TaskController::class, 'show']);

    // Tâches — création et suppression réservées chef et admin
    Route::post('/tasks',        [TaskController::class, 'store'])->middleware('role:admin,chef');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->middleware('role:admin,chef');

    // Tâches — mise à jour statut accessible à tous (le membre met à jour ses propres tâches)
    Route::put('/tasks/{task}', [TaskController::class, 'update']);

    // Membres d'un projet — lecture pour tous
    Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index']);

    // Membres d'un projet — ajout/retrait réservés chef et admin
    Route::post('/projects/{project}/members',              [ProjectMemberController::class, 'store'])->middleware('role:admin,chef');
    Route::delete('/projects/{project}/members/{user}',     [ProjectMemberController::class, 'destroy'])->middleware('role:admin,chef');

    // Commentaires — tous les rôles
    Route::get('/tasks/{task}/comments',    [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments',   [CommentController::class, 'store']);
    Route::delete('/comments/{comment}',    [CommentController::class, 'destroy']);

    // Fichiers — lecture pour tous, upload chef/admin, suppression chef/admin
    Route::get('/projects/{project}/files',  [FileController::class, 'index']);
    Route::get('/files/{file}/download',     [FileController::class, 'download']);
    Route::post('/projects/{project}/files', [FileController::class, 'store'])->middleware('role:admin,chef');
    Route::delete('/files/{file}',           [FileController::class, 'destroy'])->middleware('role:admin,chef');

    // Notifications — tous les rôles
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read',   [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all',    [NotificationController::class, 'markAllRead']);

    // Utilisateurs — liste pour chef (ajouter membres), détail admin
    Route::get('/users', [AuthController::class, 'listUsers'])->middleware('role:admin,chef');

    // Admin uniquement — gestion des comptes
    Route::patch('/users/{user}/validate', [AuthController::class, 'validateAccount'])->middleware('role:admin');
    Route::put('/users/{user}/role',       [AuthController::class, 'updateRole'])->middleware('role:admin');
    Route::delete('/users/{user}',         [AuthController::class, 'deleteUser'])->middleware('role:admin');
});