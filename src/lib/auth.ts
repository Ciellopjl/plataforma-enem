import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Sua Conta Segura",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha Secreta", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Insira seu e-mail e sua senha.");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });

        // Se o usuário não existir ou não tiver senha cadastrada (entrou pelo Google mas agora tenta senha)
        if (!user || !user.password) {
           throw new Error("E-mail não está matriculado ainda na plataforma ou foi criado por outro método.");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Senha ou E-mail incorretos. Acesso Bloqueado.");
        }

        // Se está bloqueado pelo Admin
        if (user.isBlocked) {
          throw new Error("Sua conta está detida. Contate o suporte da plataforma.");
        }

        return user;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        
        // Anti-Cookie Overflow: Se for Base64 grande, armazenamos a rota do renderizador no Cookie!
        if (user.image?.startsWith("data:image")) {
          token.picture = `/api/avatar/${user.id}?v=${Date.now()}`;
        } else {
          token.picture = user.image;
        }
        
        // GALAXY BRAIN: O seu e-mail é o Mestre Absoluto (Super Admin)
        if (user.email === "ciellolisboa023@gmail.com") {
          token.role = "ADMIN";
        } else {
          token.role = (user as any).role || "STUDENT";
        }

        token.points = (user as any).points || 0;
        token.streak = (user as any).streak || 0;
        token.isBlocked = (user as any).isBlocked || false;
      }
      
      // Permitir atualização manual da sessão se necessário
      if (trigger === "update" && session) {
        if (session.user?.image) {
          token.picture = session.user.image;
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
      }
      return session;
    },
    async signIn({ user }) {
      // SÊNIOR: Bloqueio em Tempo Real. Se isBlocked estiver true, login negado.
      if ((user as any).isBlocked) {
        return false;
      }
      
      // MONITORAMENTO SÊNIOR: Registrar Login passando userId explicitamente
      // (neste ponto o JWT ainda não existe, então auth() retornaria null)
      if (user.id) {
        // Não logar admin
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
        if (dbUser?.role !== "ADMIN") {
          await logActivity("🔐 Entrou na Plataforma", `via Google`, user.id);
        }
      }
      
      return true;
    },
  },
  events: {
    async createUser(message) {
      if (message.user.id) {
        await logActivity("✨ Novo Aluno Cadastrado", "Criou a conta via botão Google.", message.user.id);
      }
    }
  }
});
