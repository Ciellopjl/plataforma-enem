import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messages = await (prisma as any).tutorMessage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Pega até 50 últimas mensagens 
    });

    // Inverter para ficar cronológico no front
    const chronologicalMessages = messages.reverse();

    return NextResponse.json(chronologicalMessages);
  } catch (error) {
    console.error("Erro ao buscar histórico de chat:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
