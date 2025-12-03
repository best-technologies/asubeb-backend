-- Add stateId to subjects table safely
-- This migration handles existing subjects by assigning them to Abia State

DO $$
DECLARE
    abia_state_id TEXT;
    subject_count INTEGER;
BEGIN
    -- Get Abia State ID
    SELECT "id" INTO abia_state_id FROM "states" WHERE "stateId" = 'ABIA' LIMIT 1;
    
    IF abia_state_id IS NULL THEN
        RAISE EXCEPTION 'Abia State not found. Please ensure Abia State exists before running this migration.';
    END IF;
    
    -- Count existing subjects
    SELECT COUNT(*) INTO subject_count FROM "subjects";
    
    RAISE NOTICE 'Found % existing subjects. Assigning them to Abia State...', subject_count;
    
    -- Step 1: Drop old unique constraints if they exist
    DROP INDEX IF EXISTS "subjects_code_key";
    DROP INDEX IF EXISTS "subjects_name_key";
    
    -- Step 2: Add stateId column as nullable first
    ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "stateId" TEXT;
    
    -- Step 3: Update all existing subjects to use Abia State
    UPDATE "subjects" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    
    -- Step 4: Make stateId required (NOT NULL)
    ALTER TABLE "subjects" ALTER COLUMN "stateId" SET NOT NULL;
    
    -- Step 5: Create new unique constraints (stateId + name, stateId + code)
    -- Check for duplicates first
    IF EXISTS (
        SELECT 1 FROM "subjects" 
        GROUP BY "stateId", "name" 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate subject names found for the same state. Please resolve duplicates before running this migration.';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM "subjects" 
        GROUP BY "stateId", "code" 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate subject codes found for the same state. Please resolve duplicates before running this migration.';
    END IF;
    
    CREATE UNIQUE INDEX IF NOT EXISTS "subjects_stateId_name_key" ON "subjects"("stateId", "name");
    CREATE UNIQUE INDEX IF NOT EXISTS "subjects_stateId_code_key" ON "subjects"("stateId", "code");
    
    -- Step 6: Add foreign key constraint
    ALTER TABLE "subjects" 
    DROP CONSTRAINT IF EXISTS "subjects_stateId_fkey",
    ADD CONSTRAINT "subjects_stateId_fkey" 
    FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    
    RAISE NOTICE 'Successfully added stateId to subjects table. All % subjects assigned to Abia State.', subject_count;
END $$;
