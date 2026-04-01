"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Salva a nova imagem comprimida B64 do aluno no banco de dados.
 */
export async function updateProfileImage(imageBase64: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Usuário Desconectado. Faça login." };
    }

    const userId = (session.user as any).id;

    if (!imageBase64.startsWith("data:image/")) {
      return { success: false, error: "O formato da imagem comprimida é inválido." };
    }

    // Proteção de tamanho bruto no backend (se o hacker burlar o canvas front-end e mandar um filme base64 de 50MB) 
    // Em base64, cada caractere = ~0.75 bytes. Limitamos a ~500.000 chars (~375KB) que é muito mais do que um WebP de 200px.
    if (imageBase64.length > 500000) {
      return { success: false, error: "Sua foto ultrassou o limite de seguradora (350kb comprimido). A compressão falhou." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: imageBase64 }
    });

    revalidatePath("/perfil");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/ranking");

    return { success: true, message: "Foto do passaporte acadêmico atualizada!" };
  } catch (err: any) {
    console.error("❌ Falha crítica ao processar Avatar:", err);
    return { success: false, error: "Instabilidade interna ao processar midia HD." };
  }
}
