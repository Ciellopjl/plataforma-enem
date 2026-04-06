"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

/**
 * Sênior: Ação para finalizar o perfil do aluno após o primeiro login via Google.
 * Define o nome real e a senha de acesso para contingência.
 */
export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, error: "Sessão expirada ou inválida. Faça login novamente." };
    }

    const name = formData.get("name")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!name || !password) {
      return { success: false, error: "Nome e Senha são obrigatórios." };
    }

    if (password.length < 6) {
      return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
    }

    // Criptografia Hashed para segurança máxima
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza o registro do aluno no Banco de Dados
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        password: hashedPassword,
      },
    });

    // Auditoria para o Painel Admin
    await logActivity(
      "📝 Perfil Finalizado", 
      `O aluno definiu o nome real (${name}) e criou sua senha de acesso.`, 
      (session.user as any).id
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_PROFILE_ERROR]:", error);
    return { success: false, error: "Erro interno ao salvar seus dados." };
  }
}
