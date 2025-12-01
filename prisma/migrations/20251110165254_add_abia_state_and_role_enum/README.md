# Migration: Add Abia State and UserRole Enum

This migration:
1. Creates the `UserRole` enum with all role types
2. Creates/updates Abia State with the following details:
   - **State ID**: ABIA
   - **State Name**: Abia State
   - **Code**: AB
   - **Capital**: Umuahia
   - **Region**: South East
   - **Contact Email**: omayowagold@gmail.com
3. Adds `stateId` columns to all models that need it (if missing)
4. Updates all existing records to reference Abia State
5. Makes `stateId` required (NOT NULL) in all tables
6. Converts User.role from String to UserRole enum

## How to Run

```bash
# Generate Prisma client first
npx prisma generate

# Run the migration
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

## What This Migration Does

- **Creates Abia State**: If Abia State doesn't exist, it creates it. If it exists, it updates missing fields.
- **Updates All Records**: All existing users, schools, teachers, students, parents, LGAs, and officers will be assigned to Abia State.
- **Adds Foreign Keys**: Creates proper foreign key relationships between all tables and the states table.
- **Converts Role to Enum**: Safely converts the string-based role field to the UserRole enum type.

## Important Notes

- This migration is **idempotent** - it can be run multiple times safely
- All existing records will be assigned to Abia State
- The role enum conversion maps common role strings to enum values
- After migration, you'll need to update your code to use `UserRole` enum instead of strings

