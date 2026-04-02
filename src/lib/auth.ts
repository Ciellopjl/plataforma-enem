import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";

/**
 * auth.ts — Configuração COMPLETA de Auth (Node.js Runtime)
 *
 * Este arquivo usa Prisma + bcrypt e SÓ pode ser importado em:
 * - src/app/api/auth/[...nextauth]/route.ts
 * - Server Components e API Routes (Node.js runtime)
 *
 * NÃO importar no middleware.ts (Edge Runtime).
 * O middleware usa auth.config.ts via NextAuth({ ...authConfig }).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as any),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Sua Conta Segura",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha Secreta", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Insira seu e-mail e sua senha.");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          throw new Error(
            "E-mail não está matriculado ainda na plataforma ou foi criado por outro método."
          );
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Senha ou E-mail incorretos. Acesso Bloqueado.");
        }

        if (user.isBlocked) {
          throw new Error("Sua conta está detida. Contate o suporte da plataforma.");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;

        // Anti-Cookie Overflow: Base64 grande → rota do renderizador
        if (user.image?.startsWith("data:image")) {
          token.picture = `/api/avatar/${user.id}?v=${Date.now()}`;
        } else {
          token.picture = user.image;
        }

        // Super Admin por e-mail
        if (user.email === "ciellolisboa023@gmail.com") {
          token.role = "ADMIN";
        }
        token.id = user.id;
        token.role = (user as any).role ?? "STUDENT";
        token.isBlocked = (user as any).isBlocked ?? false;
        token.needsPassword = !(user as any).password;
      }

      // Sênior: Lógica para atualização via trigger update no Edge
      if (trigger === "update" && session) {
        console.log(`[AUTH UPDATE] Atualizando token via trigger...`, session);
        if (session.user?.image) {
          token.picture = session.user.image;
        }
        // Se passarmos needsPassword: false, limpamos no token
        if (session.needsPassword === false) {
          token.needsPassword = false;
        }
        return { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token as any).role || "STUDENT";
        (session.user as any).points = (token as any).points || 0;
        (session.user as any).streak = (token as any).streak || 0;
        (session.user as any).isBlocked = (token as any).isBlocked || false;
        (session.user as any).needsPassword = (token as any).needsPassword || false;
      }
      return session;
    },
    async signIn({ user, account }) {
      if ((user as any).isBlocked) {
        return false;
      }

      // Sênior: Agora permitimos a entrada via Google para todos, pois
      // o cadastro manual foi removido. Novos e-mails serão detectados pelo 
      // Middleware e obrigados a 'Finalizar Cadastro' (IA + Senha).
      return true;
    },
  },
  events: {
    async createUser(message) {
      if (message.user.id) {
        await logActivity(
          "✨ Novo Aluno Cadastrado",
          "Criou a conta via botão Google.",
          message.user.id
        );
      }
    },
  },
});
