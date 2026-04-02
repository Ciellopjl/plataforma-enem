import prisma from "@/lib/prisma";
import { SimuladosDashboard } from "./simulados-dashboard";

// Interface sênior para sanar erros de lint do Prisma Resource
interface ResourceItem {
  id: string;
  title: string;
  link: string;
  type: string;
  description: string | null;
}

export default async function SimuladosPage() {
  // @ts-ignore - Prisma em sincronização de tipos
  const simulados = await prisma.resource.findMany({
    where: { type: "Simulados" }
  }) as ResourceItem[];

  return <SimuladosDashboard initialSimulados={simulados} />;
}
