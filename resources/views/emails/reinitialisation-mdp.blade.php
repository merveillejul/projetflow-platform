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
        .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .warning p { margin: 4px 0; color: #92400e; font-size: 14px; }
        .footer { padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ProjectFlow</h1>
        </div>
        <div class="body">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour {{ $nom }},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe ProjectFlow. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.</p>

            <a href="{{ $resetUrl }}" class="btn">Réinitialiser mon mot de passe</a>

            <div class="warning">
                <p>⏱ Ce lien est valable <strong>60 minutes</strong> seulement.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>

            <p style="color: #94a3b8; font-size: 13px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>{{ $resetUrl }}</p>
        </div>
        <div class="footer">
            <p>ProjectFlow — Système de Gestion Collaborative de Projets</p>
            <p>Cet email a été envoyé automatiquement, ne pas répondre.</p>
        </div>
    </div>
</body>
</html>