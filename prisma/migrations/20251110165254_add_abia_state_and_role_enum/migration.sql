-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SUBEB_ADMIN', 'ADMIN', 'SUBEB_OFFICER', 'TEACHER', 'STUDENT', 'PARENT', 'USER');

-- Step 1: Add new columns to states table if they don't exist
DO $$ 
BEGIN
    -- Add capital column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'capital') THEN
        ALTER TABLE "states" ADD COLUMN "capital" TEXT;
    END IF;
    
    -- Add region column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'region') THEN
        ALTER TABLE "states" ADD COLUMN "region" TEXT;
    END IF;
    
    -- Add counter columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'totalTeachers') THEN
        ALTER TABLE "states" ADD COLUMN "totalTeachers" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'totalStudents') THEN
        ALTER TABLE "states" ADD COLUMN "totalStudents" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'totalParents') THEN
        ALTER TABLE "states" ADD COLUMN "totalParents" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'totalClasses') THEN
        ALTER TABLE "states" ADD COLUMN "totalClasses" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Step 2: Create Abia State if it doesn't exist
-- Generate a consistent ID for Abia State
DO $$
DECLARE
    abia_state_id TEXT;
BEGIN
    -- Check if Abia State already exists
    SELECT "id" INTO abia_state_id FROM "states" WHERE "stateId" = 'ABIA' OR "contactEmail" = 'omayowagold@gmail.com' LIMIT 1;
    
    -- If it doesn't exist, create it with a generated ID
    IF abia_state_id IS NULL THEN
        -- Generate a CUID-like ID (simplified version for migration)
        abia_state_id := 'cl' || substr(md5(random()::text || clock_timestamp()::text), 1, 24);
        
        INSERT INTO "states" (
            "id",
            "stateId",
            "stateName",
            "code",
            "capital",
            "region",
            "contactEmail",
            "totalLgas",
            "totalSchools",
            "totalUsers",
            "totalOfficers",
            "totalTeachers",
            "totalStudents",
            "totalParents",
            "totalClasses",
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            abia_state_id,
            'ABIA',
            'Abia State',
            'AB',
            'Umuahia',
            'South East',
            'omayowagold@gmail.com',
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            true,
            NOW(),
            NOW()
        );
    ELSE
        -- Update existing state with new fields if they're NULL
        UPDATE "states" SET
            "capital" = COALESCE("capital", 'Umuahia'),
            "region" = COALESCE("region", 'South East'),
            "contactEmail" = COALESCE("contactEmail", 'omayowagold@gmail.com'),
            "code" = COALESCE("code", 'AB'),
            "stateName" = COALESCE("stateName", 'Abia State')
        WHERE "id" = abia_state_id;
    END IF;
    
    -- Step 3: Add stateId column to users table if it doesn't exist, then update
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stateId') THEN
        ALTER TABLE "users" ADD COLUMN "stateId" TEXT;
    END IF;
    
    -- Update all users without stateId to reference Abia State
    UPDATE "users" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    
    -- Make stateId NOT NULL
    ALTER TABLE "users" ALTER COLUMN "stateId" SET NOT NULL;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_stateId_fkey' AND table_name = 'users'
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Step 4: Add stateId column to local_government_areas if missing, then update
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_government_areas' AND column_name = 'stateId') THEN
        ALTER TABLE "local_government_areas" ADD COLUMN "stateId" TEXT;
    END IF;
    
    UPDATE "local_government_areas" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "local_government_areas" ALTER COLUMN "stateId" SET NOT NULL;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'local_government_areas_stateId_fkey' AND table_name = 'local_government_areas'
    ) THEN
        ALTER TABLE "local_government_areas" ADD CONSTRAINT "local_government_areas_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Step 5: Add stateId column to schools if missing, then update
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'stateId') THEN
        ALTER TABLE "schools" ADD COLUMN "stateId" TEXT;
    END IF;
    
    UPDATE "schools" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "schools" ALTER COLUMN "stateId" SET NOT NULL;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'schools_stateId_fkey' AND table_name = 'schools'
    ) THEN
        ALTER TABLE "schools" ADD CONSTRAINT "schools_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Step 6: Add stateId column to teachers if missing, then update
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'stateId') THEN
        ALTER TABLE "teachers" ADD COLUMN "stateId" TEXT;
    END IF;
    
    UPDATE "teachers" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "teachers" ALTER COLUMN "stateId" SET NOT NULL;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'teachers_stateId_fkey' AND table_name = 'teachers'
    ) THEN
        ALTER TABLE "teachers" ADD CONSTRAINT "teachers_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Step 7: Update students stateId
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'stateId') THEN
        ALTER TABLE "students" ADD COLUMN "stateId" TEXT;
    END IF;
    
    UPDATE "students" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "students" ALTER COLUMN "stateId" SET NOT NULL;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'students_stateId_fkey' AND table_name = 'students'
    ) THEN
        ALTER TABLE "students" ADD CONSTRAINT "students_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Step 8: Add stateId column to parents if missing, then update
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parents' AND column_name = 'stateId') THEN
        ALTER TABLE "parents" ADD COLUMN "stateId" TEXT;
    END IF;
    
    UPDATE "parents" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "parents" ALTER COLUMN "stateId" SET NOT NULL;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'parents_stateId_fkey' AND table_name = 'parents'
    ) THEN
        ALTER TABLE "parents" ADD CONSTRAINT "parents_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Step 9: Update subeb_officers stateId
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subeb_officers' AND column_name = 'stateId') THEN
        ALTER TABLE "subeb_officers" ADD COLUMN "stateId" TEXT;
    END IF;
    
    UPDATE "subeb_officers" SET "stateId" = abia_state_id WHERE "stateId" IS NULL;
    ALTER TABLE "subeb_officers" ALTER COLUMN "stateId" SET NOT NULL;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subeb_officers_stateId_fkey' AND table_name = 'subeb_officers'
    ) THEN
        ALTER TABLE "subeb_officers" ADD CONSTRAINT "subeb_officers_stateId_fkey" 
        FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 10: Update User.role to use enum
-- First, create a temporary column with the enum type
ALTER TABLE "users" ADD COLUMN "role_new" "UserRole" DEFAULT 'USER';

-- Map existing string roles to enum values
UPDATE "users" SET "role_new" = CASE
    WHEN "role" = 'SUPER_ADMIN' OR LOWER("role") = 'super_admin' THEN 'SUPER_ADMIN'::"UserRole"
    WHEN "role" = 'SUBEB_ADMIN' OR LOWER("role") = 'subeb_admin' THEN 'SUBEB_ADMIN'::"UserRole"
    WHEN "role" = 'ADMIN' OR LOWER("role") = 'admin' THEN 'ADMIN'::"UserRole"
    WHEN "role" = 'SUBEB_OFFICER' OR LOWER("role") = 'subeb_officer' THEN 'SUBEB_OFFICER'::"UserRole"
    WHEN "role" = 'TEACHER' OR LOWER("role") = 'teacher' THEN 'TEACHER'::"UserRole"
    WHEN "role" = 'STUDENT' OR LOWER("role") = 'student' THEN 'STUDENT'::"UserRole"
    WHEN "role" = 'PARENT' OR LOWER("role") = 'parent' THEN 'PARENT'::"UserRole"
    ELSE 'USER'::"UserRole"
END;

-- Drop old column and rename new one
ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;

