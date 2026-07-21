-- database/init/70-agent-monica-sects.sql
-- §18 (SYNTHESIS_MODEL.md): a planetary agent's monica is sect-dependent — the
-- same configuration expresses differently by day and night — so we store both
-- sects. `monica_constant` is repurposed as their average (the value existing
-- readers already use); these two columns hold the components.
--
-- Nullable and unused until the §18 write-fix + backfill lands (agentMonica.ts →
-- the three write sites → backfill the ~3672 agent rows). Adding them early is
-- harmless: nullable, no default cost, and IF NOT EXISTS keeps this idempotent.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monica_diurnal NUMERIC(12,6);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monica_nocturnal NUMERIC(12,6);
