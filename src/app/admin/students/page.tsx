export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, GraduationCap, Mail, Trophy, Calendar } from "lucide-react";
import Image from "next/image";

export default async function AdminStudentsPage() {
  const session = await auth();

  // Proteção Sênior: Apenas Admins acessam
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    // Se não for admin, mas o usuário for o dono (email no env), podemos deixar passar para teste
    const isOwner = session?.user?.email === process.env.DEV_EMAIL;
    if (!isOwner) {
      redirect("/dashboard");
    }
  }

  // Busca todos os usuários com papel STUDENT
  const students = await prisma.user.findMany({
    where: { 
      role: "STUDENT" 
    },
    orderBy: { 
      totalPoints: "desc" 
    }
  });

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <GraduationCap className="text-primary-500 w-10 h-10" />
              Banco de Dados de Alunos
            </h1>
            <p className="text-zinc-500 mt-2">
              Gerenciamento centralizado de todos os estudantes cadastrados via Google.
            </p>
          </div>
          <div className="bg-primary-500/10 border border-primary-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
            <Users className="text-primary-400" />
            <div>
              <span className="block text-xs text-zinc-500 font-bold uppercase">Total de Alunos</span>
              <span className="text-2xl font-black">{students.length}</span>
            </div>
          </div>
        </header>

        <div className="glass overflow-hidden rounded-[2rem] border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Aluno</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Contato</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Desempenho</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full ring-2 ring-primary-500/20 ring-offset-2 ring-offset-black overflow-hidden group-hover:ring-primary-500/40 transition-all duration-500 shadow-2xl shadow-primary-500/10">
                          {student.image ? (
                            <Image 
                              src={student.image} 
                              alt={student.name || ""} 
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center font-black text-primary-400">
                              {student.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{student.name || "Sem Nome"}</div>
                          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                            <span className="opacity-30">ID</span> 
                            {student.id.substring(0, 12)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Mail size={14} className="text-zinc-600" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400 font-black">
                          <Trophy size={14} />
                          {student.totalPoints} pts
                        </div>
                        <div className="text-xs text-zinc-500">
                          Streak Atual: <span className="text-orange-400 font-bold">{student.streak} dias</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Calendar size={14} />
                        {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-500">
                      Nenhum aluno encontrado no banco de dados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
