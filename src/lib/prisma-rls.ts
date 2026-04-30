import { prisma } from '@/lib/prisma';

/**
 * Extensão do Prisma para suportar RLS (Row Level Security) no Supabase.
 * Injeta o ID do parceiro via set_config() antes de cada query,
 * usando queries parametrizadas (sem interpolação de string).
 */
export const prismaRLS = (partnerId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          await prisma.$executeRaw`SELECT set_config('app.current_partner_id', ${partnerId}, false)`;
          return query(args);
        },
      },
    },
  });
};

/**
 * Exemplo de uso no Route Handler ou Server Action:
 *
 * const user = await getSessionUser();
 * const db = prismaRLS(user.partnerId);
 * const leads = await db.lead.findMany(); // retorna apenas leads do parceiro
 */
