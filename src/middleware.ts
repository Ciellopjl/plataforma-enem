import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * middleware.ts — Roda no Edge Runtime do Next.js
 *
 * CRÍTICO: Importa apenas `auth.config.ts` (sem Prisma, sem Node.js APIs).
 * O `auth.ts` completo (com PrismaAdapter) só é usado em API Routes.
 */
const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Definição de Rotas
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute =
    [
      "/",
      "/login",
      "/login/esqueceu-senha",
      "/login/resetar-senha",
      "/manifest.json",
      "/logo-enem.png",
      "/favicon.ico",
      "/sw.js",
      "/finalizar-cadastro"
    ].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/icons/");

  const isAuthRoute = nextUrl.pathname === "/login";

  // 2. Permitir APIs de Autenticação sem interceptação
  if (isApiAuthRoute) return NextResponse.next();

  // SÊNIOR: Verificação "Instantânea" de Segurança no Edge (via Neon HTTP)
  if (isLoggedIn) {
    const userId = (req.auth as any)?.user?.id;
    if (userId) {
      try {
        const sql = neon(process.env.DATABASE_URL!);
        const users = await sql`SELECT "isBlocked", "id" FROM "User" WHERE id = ${userId}`;
        const dbUser = users[0];
        
        // Se aluno foi removido do banco OU bloqueado
        if (!dbUser || dbUser.isBlocked) {
          const response = NextResponse.redirect(new URL("/login?error=AccessDenied", nextUrl));
          response.cookies.delete("authjs.session-token");
          response.cookies.delete("__Secure-authjs.session-token");
          response.cookies.delete("next-auth.session-token");
          response.cookies.delete("__Secure-next-auth.session-token");
          return response;
        }
      } catch (err) {
        console.error("Erro Edge DB Auth Check:", err);
      }
    }
  }

  // 3. Lógica de Redirecionamento de Auth
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 4. Proteção Global: Bloquear acesso se não estiver logado
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // 4.5 Interceptar preenchimento de perfil obrigatório (Google Users)
  if (isLoggedIn && (req.auth as any)?.user?.needsPassword && nextUrl.pathname !== "/finalizar-cadastro") {
    return NextResponse.redirect(new URL("/finalizar-cadastro", nextUrl));
  }

  // 4.1 Proteção da Rota Admin
  if (nextUrl.pathname.startsWith("/admin")) {
    const role = (req.auth as any)?.user?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // 5. Injeção de Cabeçalhos de Segurança
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
});

// Interceptar tudo exceto arquivos estáticos e rotas de API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
