<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReinitialisationMdp extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nom,
        public string $resetUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'ProjectFlow — Réinitialisation de votre mot de passe');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.reinitialisation-mdp');
    }
}