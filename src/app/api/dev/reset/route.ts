export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  // Segurança dupla: só funciona se estiver logado E for o email dev
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.user.email !== process.env.DEV_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const userId = (session.user as any).id;

  // Deleta apenas os desafios do próprio dev, não de outros usuários
  const deleted = await prisma.dailyChallenge.deleteMany({
    where: { userId }
  });

  return NextResponse.json({ 
    success: true, 
    message: `${deleted.count} desafio(s) resetado(s). Pode fazer de novo!` 
  });
}
