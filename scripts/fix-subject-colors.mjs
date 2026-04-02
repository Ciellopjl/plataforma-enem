import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(neonPool);
const prisma = new PrismaClient({ adapter });

// Mapa completo de cores vibrantes e ícones por slug
const SUBJECT_MAP = {
  "matematica":    { color: "bg-blue-600",    icon: "Calculator" },
  "portugues":     { color: "bg-orange-600",   icon: "Type" },
  "literatura":    { color: "bg-rose-600",     icon: "BookMarked" },
  "ingles":        { color: "bg-sky-600",      icon: "Globe" },
  "espanhol":      { color: "bg-red-600",      icon: "Globe2" },
  "artes":         { color: "bg-pink-600",     icon: "Palette" },
  "educacao-fisica":{ color: "bg-emerald-600", icon: "Dumbbell" },
  "tecnologias":   { color: "bg-cyan-600",     icon: "Cpu" },
  "redacao":       { color: "bg-fuchsia-600",  icon: "PenTool" },
  "historia":      { color: "bg-amber-600",    icon: "Landmark" },
  "geografia":     { color: "bg-green-600",    icon: "Map" },
  "filosofia":     { color: "bg-violet-600",   icon: "Brain" },
  "sociologia":    { color: "bg-purple-600",   icon: "Users" },
  "biologia":      { color: "bg-teal-600",     icon: "Dna" },
  "quimica":       { color: "bg-lime-600",     icon: "FlaskConical" },
  "fisica":        { color: "bg-indigo-600",   icon: "Zap" },
};

async function main() {
  console.log("🎨  Sincronizando cores e ícones de todas as matérias...\n");

  const subjects = await prisma.subject.findMany();

  let updated = 0;
  for (const subject of subjects) {
    const map = SUBJECT_MAP[subject.slug];
    if (!map) {
      console.warn(`  ⚠️  Slug não mapeado: ${subject.slug} — pulando`);
      continue;
    }

    await prisma.subject.update({
      where: { id: subject.id },
      data: { color: map.color, icon: map.icon },
    });

    console.log(`  ✅  ${subject.name.padEnd(20)} → ${map.color}  |  icon: ${map.icon}`);
    updated++;
  }

  console.log(`\n🚀  ${updated} matérias atualizadas com sucesso!`);
}

main()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
