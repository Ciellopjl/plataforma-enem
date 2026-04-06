import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { image: true },
    });

    if (!user || !user.image) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Se no DB ele está como string Base64 (Nós comprimimos via Canvas)
    if (user.image.startsWith("data:image")) {
      // Extrai o MIME type e a string codificada
      const mimeMatch = user.image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/webp";
      
      const base64Data = user.image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400, immutable", // Cache por 1 dia no navegador
        },
      });
    }

    // Se for URL externa (Google ou Dicebear), faz o redirect
    return NextResponse.redirect(user.image);

  } catch (error) {
    console.error("Erro ao servir avatar:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
