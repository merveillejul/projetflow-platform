<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #7c3aed; padding: 32px 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .body { padding: 40px; }
        .body h2 { color: #1e293b; }
        .body p { color: #64748b; line-height: 1.6; }
        .btn { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; }
        .info { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .info p { margin: 4px 0; color: #475569; font-size: 14px; }
        .footer { padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ProjectFlow</h1>
        </div>
        <div class="body">
            <h2>Bonjour {{ $user->nom }} 👋</h2>
            <p>Votre compte ProjectFlow a été <strong>validé par l'administrateur</strong>. Vous pouvez maintenant vous connecter et accéder à la plateforme.</p>

            <div class="info">
                <p><strong>Nom d'utilisateur :</strong> {{ $user->username }}</p>
                <p><strong>Rôle :</strong> {{ ucfirst($user->role) }}</p>
            </div>

            <p>Connectez-vous avec votre nom d'utilisateur et le mot de passe que vous avez choisi lors de l'inscription.</p>

            <a href="http://localhost:5173" class="btn">Se connecter à ProjectFlow</a>

            <p style="color: #94a3b8; font-size: 13px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
        <div class="footer">
            <p>ProjectFlow — Système de Gestion Collaborative de Projets</p>
            <p>Cet email a été envoyé automatiquement, ne pas répondre.</p>
        </div>
    </div>
</body>
</html>