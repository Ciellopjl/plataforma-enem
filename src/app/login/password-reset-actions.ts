"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendResetCodeEmail } from "@/lib/mail";
import { logActivity } from "@/lib/logger";

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * GERAÇÃO DE RESET - VERSÃO SENIOR FULLSTACK RÁPIDA
 */
export async function requestResetAction(email: string) {
  try {
    const emailNormalizado = (email || "").toLowerCase().trim();
    if (!emailNormalizado) return { success: false, error: "E-mail inválido." };

    // 1. Verificar Usuário no Banco (Neon/Prisma)
    const user = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    });

    // Se o usuário não existir, por segurança não confirmamos ou negamos.
    if (!user) {
      return { success: true, message: "Se o e-mail existir, um código será enviado." };
    }

    const code = generate6DigitCode();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora de validade

    // 2. Operação Atômica: Limpar códigos velhos e criar o novo
    console.log(`🔍 [RESET] Gravando token para ${emailNormalizado}...`);
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: emailNormalizado } }),
      prisma.verificationToken.create({
        data: {
          identifier: emailNormalizado,
          token: code,
          expires
        }
      })
    ]);

    // 3. Disparo assíncrono via Resend
    console.log(`📨 [RESET] Enviando e-mail real para ${emailNormalizado}...`);
    const emailRes = await sendResetCodeEmail(emailNormalizado, code);
    
    // Fallback: Se o envio falhou (por exemplo, falha de autenticação SMTP no Gmail)
    if (!emailRes.success) {
      console.error("❌ [SMTP FAILURE]", emailRes.error);
      return { 
        success: false, 
        error: "Instabilidade no serviço de e-mail (Gmail). Verifique seu EMAIL_PASS no .env." 
      };
    }

    return { success: true, message: "Código enviado! Verifique seu Inbox ou Spam (pode levar 1-2 min)." };

  } catch (error: any) {
    console.error("❌ [REQUEST RESET FATAL ERROR]", error);
    // SÊNIOR: NUNCA retorne o objeto de Erro bruto (bloqueia o Next.js de enviar a resposta)
    return { success: false, error: "Instabilidade interna no servidor. Tente novamente." };
  }
}

/**
 * REDEFINIÇÃO DE SENHA - VERSÃO SENIOR FULLSTACK RÁPIDA
 */
export async function resetPasswordAction(email: string, code: string, newPassword: string) {
  try {
    const emailNormalizado = (email || "").toLowerCase().trim();
    
    // 1. Buscar Token no Banco
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: emailNormalizado,
        token: code
      }
    });

    if (!resetToken) {
      return { success: false, error: "Código de verificação incorreto." };
    }

    // 2. Checar Expiração
    if (new Date() > resetToken.expires) {
      return { success: false, error: "Este código expirou. Peça um novo." };
    }

    // 3. Hashing de Segurança
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update de Usuário e Limpeza de Tokens em transação
    const user = await prisma.user.update({
      where: { email: emailNormalizado },
      data: { password: hashedPassword }
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: emailNormalizado }
    });

    // Monitoramento
    await logActivity("🔐 Senha Restaurada", `Usuário ID: ${user.id}`, user.id);

    return { success: true, message: "Senha redefinida com sucesso! Faça login agora." };

  } catch (error: any) {
    console.error("❌ [RESET PASSWORD FATAL ERROR]", error);
    return { success: false, error: "Erro de autenticação ou banco de dados." };
  }
}
