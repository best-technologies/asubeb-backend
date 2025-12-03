const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Fix old subjects by updating their names and codes to match the standard format
 * This script updates subjects with old codes (SUB-*) to use proper names and codes
 */
async function fixOldSubjects() {
  try {
    console.log('🔧 Fixing old subjects...\n');

    // Get Abia State
    const abiaState = await prisma.state.findFirst({
      where: { stateId: 'ABIA' },
    });

    if (!abiaState) {
      throw new Error('Abia State not found.');
    }

    // Mapping of old subject names (lowercase) to new standard format
    const subjectMappings = {
      'english language': { name: 'English Language', code: 'ENG' },
      'mathematics': { name: 'Mathematics', code: 'MTH' },
      'igbo language': { name: 'Igbo Language', code: 'IGB' },
      'national values': { name: 'National Values Education', code: 'NVE' },
      'prevocational': { name: 'Pre-Vocational Studies', code: 'PVS' },
      'crs': { name: 'Christian Religious Studies', code: 'CRS' },
      'history': { name: 'History', code: 'HIS' },
      'cca': { name: 'Cultural and Creative Arts', code: 'CCA' },
      'basic science and technology': { name: 'Basic Science and Technology', code: 'BST' },
      'number work': { name: 'Number Work', code: 'NUM' },
      'letter work': { name: 'Letter Work', code: 'LET' },
      'general norms': { name: 'General Norms', code: 'GNM' },
      'rhyme': { name: 'Rhyme', code: 'RHY' },
    };

    // Get all old subjects (with SUB- codes)
    const oldSubjects = await prisma.subject.findMany({
      where: {
        stateId: abiaState.id,
        code: { startsWith: 'SUB-' },
      },
    });

    console.log(`Found ${oldSubjects.length} old subjects to update\n`);

    let updated = 0;
    let deleted = 0;
    let errors = 0;

    for (const oldSubject of oldSubjects) {
      try {
        const lowerName = oldSubject.name.toLowerCase().trim();
        const mapping = subjectMappings[lowerName];

        if (!mapping) {
          console.log(`⚠️  No mapping found for: ${oldSubject.name} (${oldSubject.code})`);
          continue;
        }

        // Check if a proper subject already exists with this name and level
        const existingProper = await prisma.subject.findFirst({
          where: {
            stateId: abiaState.id,
            name: mapping.name,
            level: oldSubject.level,
            code: { not: { startsWith: 'SUB-' } },
          },
        });

        if (existingProper) {
          // Proper subject exists, we need to migrate assessments
          console.log(`📋 Migrating assessments from "${oldSubject.name}" to "${mapping.name}"...`);
          
          // Update all assessments to use the proper subject
          const assessmentCount = await prisma.assessment.updateMany({
            where: { subjectId: oldSubject.id },
            data: { subjectId: existingProper.id },
          });

          console.log(`   ✅ Migrated ${assessmentCount.count} assessments`);

          // Now delete the old subject
          await prisma.subject.delete({
            where: { id: oldSubject.id },
          });
          console.log(`   🗑️  Deleted old subject: ${oldSubject.name} (${oldSubject.code})`);
          deleted++;
        } else {
          // No proper subject exists, update this one
          const updated = await prisma.subject.update({
            where: { id: oldSubject.id },
            data: {
              name: mapping.name,
              code: mapping.code,
            },
          });
          console.log(`✅ Updated: ${oldSubject.name} → ${mapping.name} (${mapping.code})`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${oldSubject.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   🗑️  Deleted (merged): ${deleted}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📚 Total processed: ${oldSubjects.length}\n`);

    console.log('✨ Fix completed successfully!\n');
  } catch (error) {
    console.error('❌ Error fixing subjects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixOldSubjects()
  .then(() => {
    console.log('🎉 Fix script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix script failed:', error);
    process.exit(1);
  });

