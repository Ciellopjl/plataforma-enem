/**
 * Utilitário de E-mail "Senior Fullstack" - Versão Ponte Invencível (Invincible Bridge)
 * Esta versão NÃO importa o nodemailer, tornando o erro 'Module not found' impossível.
 * Delega o envio para um processo independente que o Next.js/Webpack não enxerga.
 */
import { exec } from "child_process";
import path from "path";

export async function sendEmail({ to, subject, body, html }: { to: string; subject: string; body: string; html?: string }) {
  return new Promise((resolve, reject) => {
    // SÊNIOR: Caminho real do script de ponte
    const scriptPath = path.resolve(process.cwd(), "scripts/send-mail-bridge.js");
    
    // Execução como um processo separado (Imunidade Total de Build)
    const command = `node "${scriptPath}" "${to}" "${body.match(/\d{6}/)?.[0] || '000000'}"`;

    console.log(`📡 [INVINCIBLE BRIDGE] Disparando ponte de e-mail para: ${to}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ [BRIDGE EXEC ERROR]: ${error.message}`);
        resolve({ success: false, error: "Erro na ponte de e-mail." });
        return;
      }
      if (stderr) {
        console.error(`⚠️ [BRIDGE STDERR]: ${stderr}`);
      }
      
      console.log(`✅ [BRIDGE STDOUT]: ${stdout.trim()}`);
      resolve({ success: true });
    });
  });
}

/**
 * Função para envio de Código de Recuperação. 
 * (Inalterada mas agora chama a ponte invencível).
 */
export async function sendResetCodeEmail(email: string, code: string) {
  const subject = "🔑 Seu Código de Recuperação - ENEM 2026";
  const body = `Seu código de acesso temporário é: ${code}. Expira em 1 hora.`;
  
  // Nota: Template HTML agora é gerenciado pelo script de ponte para reduzir poluição de build.
  return sendEmail({ to: email, subject, body });
}
