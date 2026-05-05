import { prisma } from '@/lib/prisma';

/**
 * Extensão do Prisma para RLS (Row Level Security) multi-tenant no Supabase.
 * Injeta o storeId via set_config() antes de cada query — sem interpolação de string.
 *
 * Política SQL correspondente no Supabase (exemplo para vehicles):
 *   CREATE POLICY "tenant_isolation" ON "Vehicle"
 *   USING ("storeId" = current_setting('app.current_store_id', true));
 */
export const prismaRLS = (storeId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          await prisma.$executeRaw`SELECT set_config('app.current_store_id', ${storeId}, false)`;
          return query(args);
        },
      },
    },
  });
};

/**
 * Uso em Route Handlers e Server Actions:
 *
 *   const { user } = await requireAuth();
 *   const storeId  = await getStoreIdForUser(user.id); // via user_metadata ou StoreUser
 *   const db = prismaRLS(storeId);
 *   const leads = await db.lead.findMany(); // retorna apenas leads da store
 */
