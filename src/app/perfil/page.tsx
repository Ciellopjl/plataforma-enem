import { Button } from "@/components/ui/base-ui";
import { User, LogOut, Flame, Trophy, Mail } from "lucide-react";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function PerfilPage() {
  const session = await auth();

  // Proteção da rota
  if (!session?.user) {
    redirect("/login");
  }

  // Buscar pontos do Prisma
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { points: true }
  });

  const points = user?.points || 0;

  // Server Action para deslogar
  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seu Perfil</h1>
          <p className="text-zinc-400">Configure sua conta e acompanhe sua evolução.</p>
        </div>
      </header>

      <div className="glass p-8 rounded-[2.5rem] border-white/[0.05] shadow-2xl space-y-8 relative overflow-hidden">
         {/* Efeito de brilho de fundo */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] rounded-full" />
         
         <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
            {/* Imagem do Usuário vinda do Google */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/5 bg-zinc-900 shadow-xl relative shrink-0">
               {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="Foto de perfil" 
                    fill 
                    className="object-cover" 
                  />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-primary-500/20 text-primary-500">
                   <User size={48} />
                 </div>
               )}
            </div>

            <div className="space-y-4 flex-1">
               <div>
                  <h2 className="text-2xl font-black text-white">{session.user.name}</h2>
                  <div className="flex items-center gap-2 text-zinc-400 justify-center md:justify-start mt-1 font-medium">
                     <Mail size={16} />
                     {session.user.email}
                  </div>
               </div>

               <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-xl font-bold border border-yellow-500/20">
                     <Trophy size={18} />
                     {points} Pontos
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-xl font-bold border border-orange-500/20">
                     <Flame size={18} />
                     Ofensiva
                  </div>
               </div>
            </div>
         </div>

         <div className="pt-8 border-t border-white/[0.05]">
            <form action={handleLogout}>
              <Button 
                 variant="secondary" 
                 className="w-full sm:w-auto py-6 group hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                  <LogOut size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                  Sair do Aplicativo
              </Button>
            </form>
         </div>
      </div>
    </div>
  );
}
