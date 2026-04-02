import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const subjects = [
  { name: "Matemática", slug: "matematica", color: "bg-blue-600", icon: "Calculator" },
  { name: "Biologia", slug: "biologia", color: "bg-emerald-600", icon: "Dna" },
  { name: "Física", slug: "fisica", color: "bg-indigo-600", icon: "Zap" },
  { name: "Química", slug: "quimica", color: "bg-teal-600", icon: "TestTube" },
  { name: "História", slug: "historia", color: "bg-amber-700", icon: "History" },
  { name: "Geografia", slug: "geografia", color: "bg-green-700", icon: "Globe" },
  { name: "Filosofia", slug: "filosofia", color: "bg-violet-700", icon: "Brain" },
  { name: "Sociologia", slug: "sociologia", color: "bg-purple-700", icon: "Users" },
  { name: "Atualidades", slug: "atualidades", color: "bg-rose-600", icon: "Newspaper" },
  { name: "Linguagens", slug: "linguagens", color: "bg-orange-600", icon: "Languages" },
  { name: "Redação", slug: "redacao", color: "bg-pink-600", icon: "PenTool" },
];

async function main() {
  console.log("🚀 Sincronizando categorias via HTTP Direto (Sem Prisma)...");
  
  for (const s of subjects) {
    try {
      // Upsert simplificado via SQL
      await sql`
        INSERT INTO "Subject" (id, name, slug, color, icon)
        VALUES (${'subj_' + s.slug}, ${s.name}, ${s.slug}, ${s.color}, ${s.icon})
        ON CONFLICT (slug) DO UPDATE 
        SET name = EXCLUDED.name, color = EXCLUDED.color, icon = EXCLUDED.icon
      `;
      console.log(`✅ Categoria vinculada: ${s.name}`);
    } catch (err) {
      console.error(`❌ Erro em ${s.name}:`, err.message);
    }
  }
  
  console.log("\n✨ Todas as categorias foram sincronizadas com a base de dados!");
}

main().catch(console.error);
