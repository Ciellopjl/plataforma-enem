import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Definição de Rotas
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = [
    "/",
    "/login", 
    "/manifest.json", 
    "/logo-enem.png", 
    "/favicon.ico",
    "/sw.js"
  ].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/icons/");
  
  const isAuthRoute = nextUrl.pathname === "/login";

  // 2. Permitir APIs de Autenticação
  if (isApiAuthRoute) return NextResponse.next();

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
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  // 5. Injeção de Cabeçalhos de Segurança (Segurança Máxima)
  const response = NextResponse.next();
  
  // Prevenir Clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevenir Sniffing de MIME
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Proteção contra XSS em navegadores antigos
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Política de Referência Segura
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Forçar HTTPS (HSTS)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  
  // Privacidade de Permissões
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  return response;
});

// Configuração do Matcher para interceptar TUDO exceto arquivos estáticos do Next.js
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
