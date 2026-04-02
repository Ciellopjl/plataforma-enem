"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { validateNameSafety } from "@/lib/ai-service";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const name = formData.get("name")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !password) {
    return { error: "Nome e senha são obrigatórios." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  try {
    // 1. Validar Nome via IA Scanner de Elite
    console.log(`[AI MODERATION] Validando nome: ${name}...`);
    const { safe, reason } = await validateNameSafety(name);
    
    if (!safe) {
      return { error: `Nome Recusado: ${reason}` };
    }

    // 2. Hash da Senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Atualizar Usuário
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        name,
        password: hashedPassword,
      }
    });

    revalidatePath("/");
    return { success: true, message: "Perfil finalizado com sucesso!" };

  } catch (error: any) {
    console.error("[UPDATE_PROFILE_ERROR]:", error);
    return { error: "Falha ao processar o cadastro." };
  }
}
