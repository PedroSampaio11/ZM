-- =============================================================================
-- Super Loja 2026 — RLS (Row Level Security) Policies
-- Execute este script no Supabase Dashboard → SQL Editor
-- =============================================================================

-- ATENÇÃO: Prisma usa a connection string com pooler (pgbouncer).
-- O set_config() funciona em modo "session" — OK para transações normais.
-- O helper prismaRLS() em src/lib/prisma-rls.ts já injeta o storeId antes de cada query.
-- Estas policies são uma camada extra de proteção no banco de dados.

-- =============================================================================
-- 1. Habilitar RLS nas tabelas de negócio
-- =============================================================================

ALTER TABLE "Partner"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interaction"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Simulation"       ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. Políticas de isolamento por storeId
-- current_setting retorna '' se não setado — comparação falha, acesso negado
-- =============================================================================

-- Partner
CREATE POLICY "partner_tenant_isolation" ON "Partner"
  USING ("storeId" = current_setting('app.current_store_id', true));

-- Vehicle
CREATE POLICY "vehicle_tenant_isolation" ON "Vehicle"
  USING ("storeId" = current_setting('app.current_store_id', true));

-- Lead
CREATE POLICY "lead_tenant_isolation" ON "Lead"
  USING ("storeId" = current_setting('app.current_store_id', true));

-- IntegrationConfig
CREATE POLICY "integration_tenant_isolation" ON "IntegrationConfig"
  USING ("storeId" = current_setting('app.current_store_id', true));

-- Interaction (filtrada via lead)
CREATE POLICY "interaction_tenant_isolation" ON "Interaction"
  USING (
    EXISTS (
      SELECT 1 FROM "Lead" l
      WHERE l.id = "Interaction"."leadId"
        AND l."storeId" = current_setting('app.current_store_id', true)
    )
  );

-- Simulation (filtrada via lead)
CREATE POLICY "simulation_tenant_isolation" ON "Simulation"
  USING (
    EXISTS (
      SELECT 1 FROM "Lead" l
      WHERE l.id = "Simulation"."leadId"
        AND l."storeId" = current_setting('app.current_store_id', true)
    )
  );

-- =============================================================================
-- 3. Política de bypass para service_role (Prisma usa anon key via pooler)
-- Se o Prisma usar service_role key, adicione:
-- =============================================================================

-- ALTER POLICY "partner_tenant_isolation" ON "Partner"
--   USING (auth.role() = 'service_role' OR "storeId" = current_setting('app.current_store_id', true));

-- =============================================================================
-- 4. Verificar policies criadas
-- =============================================================================

SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
