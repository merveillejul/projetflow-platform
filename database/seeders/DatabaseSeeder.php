<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'username' => 'admin',
            'nom'      => 'Administrateur',
            'email'    => 'admin.projectflow@demo.fr',
            'password' => Hash::make('Admin@PF2026!'),
            'role'     => 'admin',
            'statut'   => 'actif',
            'first_login' => 0,
        ]);

        // Chef de projet
        User::create([
            'username' => 'chef',
            'nom'      => 'Chef de Projet',
            'email'    => 'chef.projectflow@demo.fr',
            'password' => Hash::make('Chef@PF2026!'),
            'role'     => 'chef',
            'statut'   => 'actif',
            'first_login' => 0,
        ]);

        // Membre
        User::create([
            'username' => 'membre',
            'nom'      => 'Membre Equipe',
            'email'    => 'membre.projectflow@demo.fr',
            'password' => Hash::make('Membre@PF2026!'),
            'role'     => 'membre',
            'statut'   => 'actif',
            'first_login' => 0,
        ]);
    }
}