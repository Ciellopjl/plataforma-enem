import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

/**
 * auth.config.ts — Configuração LEVE de Auth (Edge Runtime Safe)
 *
 * REGRA DE OURO: Este arquivo NÃO pode importar Prisma, bcrypt, ou qualquer
 * lib que use APIs Node.js nativas (fs, net, tls, crypto).
 * Ele é usado pelo middleware que roda no Edge Runtime do Next.js.
 *
 * A config completa (com PrismaAdapter e bcrypt) está em auth.ts.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "STUDENT";
        token.isBlocked = (user as any).isBlocked ?? false;
        token.needsPassword = !(user as any).password;
      }

      // Sênior: Lógica para atualização via trigger update no Edge
      if (trigger === "update" && session) {
        if (session.needsPassword === false) {
          token.needsPassword = false;
        }
        // Merging session data into token
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = (token as any).role ?? "STUDENT";
        (session.user as any).isBlocked = (token as any).isBlocked ?? false;
        (session.user as any).needsPassword = (token as any).needsPassword ?? false;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      return true;
    },
  },
};
