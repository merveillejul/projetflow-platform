<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIST FILES
    |--------------------------------------------------------------------------
    */

    public function index(Project $project)
    {
        return $project->files()
            ->with('uploader')
            ->latest()
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | UPLOAD FILE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request, Project $project)
    {
        $request->validate([
            'file' => 'required|file|max:10240'
        ]);

        $uploadedFile = $request->file('file');

        $path = $uploadedFile->store('project_files','public');

        $file = File::create([
            'nom' => $uploadedFile->getClientOriginalName(),
            'chemin' => $path,
            'type' => $uploadedFile->getClientMimeType(),
            'taille' => $uploadedFile->getSize(),
            'upload_by' => auth()->id(),
            'project_id' => $project->id
        ]);

        return response()->json($file->load('uploader'));
    }
    

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD FILE
    |--------------------------------------------------------------------------
    */

    public function download(File $file)
    {
        $this->authorize('view', $file);

        return response()->download(
            storage_path('app/public/'.$file->chemin),
            $file->nom
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE FILE
    |--------------------------------------------------------------------------
    */

    public function destroy(File $file)
    {
        $this->authorize('delete', $file);

        Storage::disk('public')->delete($file->chemin);

        $file->delete();

        return response()->json([
            'message' => 'Fichier supprimé'
        ]);
    }
}