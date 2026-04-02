import { PrismaClient } from "@prisma/client";

/**
 * prisma.ts — Cliente Prisma Nativo (Senior Fix)
 * Removemos o Neon Adapter localmente porque WebSockets e Serverless HTTP 
 * conflitam com Server Actions do Next.js (causando "Failed to fetch" e bugs de datas).
 */

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("❌ DATABASE_URL não definida no .env.");
  }

  // Instância nativa usando a engine Rust do Prisma pela conexão normal (Porta 5432).
  // 100% de estabilidade para Next.js Server Actions e Tipagem de Datas.
  const client = new PrismaClient({
    datasourceUrl: connectionString,
  });

  // Motor de Resiliência: retry automático em falhas transientes
  return client.$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 1200;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            return await query(args);
          } catch (error: any) {
            const isRetryable =
              error.message?.includes("fetch failed") ||
              error.message?.includes("ECONNRESET") ||
              error.message?.includes("ETIMEDOUT") ||
              error.message?.includes("reach database") ||
              error.code === "P1001" ||
              error.code === "P2024";

            if (isRetryable && attempt < MAX_RETRIES) {
              console.warn(
                `[PRISMA] Falha de rede em '${operation}'. Tentativa ${attempt}/${MAX_RETRIES}...`
              );
              await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
              continue;
            }

            throw error;
          }
        }

        throw new Error(
          `[PRISMA] Operação '${operation}' falhou após ${MAX_RETRIES} tentativas.`
        );
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ExtendedPrismaClient | undefined;
}

/**
 * Singleton — reutiliza a mesma instância em dev (evita esgotamento de
 * conexões no hot-reload do Next.js) e cria uma nova por cold-start em prod.
 */
export const prisma: ExtendedPrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
