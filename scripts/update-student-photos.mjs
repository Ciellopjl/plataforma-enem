
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Abby",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Pepper",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Willow",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna"
];

async function updatePhotos() {
  console.log("🔍 Buscando alunos sem fotos...");
  const students = await prisma.user.findMany({
    where: { 
      OR: [
        { image: null },
        { image: "" }
      ]
    }
  });

  console.log(`✨ Encontrados ${students.length} alunos para atualizar.`);

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const avatarUrl = AVATARS[i % AVATARS.length];
    
    await prisma.user.update({
      where: { id: student.id },
      data: { image: avatarUrl }
    });
    
    console.log(`✅ Foto atualizada para: ${student.name || student.email}`);
  }

  console.log("🚀 Todos os alunos atualizados com avatares premium!");
}

updatePhotos()
  .catch((e) => {
    console.error("❌ Erro ao atualizar fotos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
