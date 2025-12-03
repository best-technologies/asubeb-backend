-- Update unique constraints on subjects table to include level
-- This allows the same subject name/code to exist for both PRIMARY and SECONDARY levels

DO $$
BEGIN
    -- Drop old unique constraints
    DROP INDEX IF EXISTS "subjects_stateId_name_key";
    DROP INDEX IF EXISTS "subjects_stateId_code_key";
    
    -- Create new unique constraints that include level
    CREATE UNIQUE INDEX IF NOT EXISTS "subjects_stateId_name_level_key" 
    ON "subjects"("stateId", "name", "level");
    
    CREATE UNIQUE INDEX IF NOT EXISTS "subjects_stateId_code_level_key" 
    ON "subjects"("stateId", "code", "level");
    
    RAISE NOTICE 'Successfully updated subject unique constraints to include level';
END $$;

