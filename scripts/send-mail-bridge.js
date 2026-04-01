/**
 * Ponte Independente de E-mail (Invincible Bridge)
 * Este script roda fora do Next.js/Webpack, o que elimina 100% dos erros de build.
 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Carregamento manual do .env (Sênior Performance)
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
});

async function main() {
    const [recipient, code] = process.argv.slice(2);

    if (!recipient || !code) {
        console.error("❌ Uso: node send-mail-bridge.js <email> <codigo>");
        process.exit(1);
    }

    const { EMAIL_USER, EMAIL_PASS } = env;

    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error("❌ Credenciais ausentes no .env.");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"ENEM 2026" <${EMAIL_USER}>`,
            to: recipient,
            subject: "🔑 Seu Código de Recuperação - ENEM 2026",
            text: `Seu código de acesso temporário é: ${code}. Expira em 1 hora.`,
            html: `
                <div style="font-family:sans-serif;background:#0b0b0b;color:#fff;padding:40px;border-radius:24px;max-width:500px;margin:0 auto;border:1px solid #222;text-align:center;">
                    <h1 style="color:#8b5cf6;margin-bottom:24px;">ENEM <span style="color:#fff;">2026</span></h1>
                    <p style="font-size:16px;color:#a1a1aa;">Use o código abaixo para redefinir sua senha.</p>
                    <div style="background:linear-gradient(135deg,#18181b,#09090b);padding:32px;border-radius:20px;border:1px solid #333;margin:32px 0;">
                        <span style="font-size:42px;font-weight:900;letter-spacing:8px;font-family:monospace;">${code}</span>
                    </div>
                </div>
            `,
        });
        console.log(`✅ [BRIDGE SUCCESS] Enviado para ${recipient} | ID: ${info.messageId}`);
    } catch (err) {
        console.error("❌ [BRIDGE CRASH]", err.message);
        process.exit(1);
    }
}

main();
