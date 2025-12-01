-- Add stateId to sessions and terms tables
DO $$
DECLARE
    abia_state_id TEXT;
BEGIN
    SELECT "id" INTO abia_state_id FROM "states" WHERE "stateId" = 'ABIA' LIMIT 1;
    
    IF abia_state_id IS NULL THEN
        RAISE EXCEPTION 'Abia State not found';
    END IF;
    
    ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "stateId" TEXT;
    UPDATE "sessions" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "sessions" ALTER COLUMN "stateId" SET NOT NULL;
    ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_name_key";
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_name_stateId_key" UNIQUE ("name", "stateId");
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    
    ALTER TABLE "terms" ADD COLUMN IF NOT EXISTS "stateId" TEXT;
    UPDATE "terms" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "terms" ALTER COLUMN "stateId" SET NOT NULL;
    ALTER TABLE "terms" DROP CONSTRAINT IF EXISTS "terms_sessionId_name_key";
    ALTER TABLE "terms" ADD CONSTRAINT "terms_sessionId_name_stateId_key" UNIQUE ("sessionId", "name", "stateId");
    ALTER TABLE "terms" ADD CONSTRAINT "terms_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
END $$;
