const { PrismaClient, SchoolLevel } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed subjects for Abia State
 * 
 * This script creates all subjects for Abia State across different school levels:
 * - ECCDE (Pre-primary) - mapped to PRIMARY level
 * - Primary School
 * - Junior Secondary School (mapped to SECONDARY level)
 */
async function seedAbiaSubjects() {
  try {
    console.log('🌱 Starting Abia State subjects seeding...\n');

    // Get Abia State
    const abiaState = await prisma.state.findFirst({
      where: { stateId: 'ABIA' },
    });

    if (!abiaState) {
      throw new Error('Abia State not found. Please run migrations first.');
    }

    console.log(`✅ Found Abia State: ${abiaState.stateName} (${abiaState.id})\n`);

    // Define subjects by level
    const subjects = [
      // ECCDE (Pre-primary) - using PRIMARY level
      {
        name: 'Number Work',
        code: 'NUM',
        level: SchoolLevel.PRIMARY,
        description: 'Number Work for Early Childhood Care and Development Education',
      },
      {
        name: 'Letter Work',
        code: 'LET',
        level: SchoolLevel.PRIMARY,
        description: 'Letter Work for Early Childhood Care and Development Education',
      },
      {
        name: 'General Norms',
        code: 'GNM',
        level: SchoolLevel.PRIMARY,
        description: 'General Norms for Early Childhood Care and Development Education',
      },
      {
        name: 'Rhyme',
        code: 'RHY',
        level: SchoolLevel.PRIMARY,
        description: 'Rhyme for Early Childhood Care and Development Education',
      },
      {
        name: 'Igbo Language',
        code: 'IGB',
        level: SchoolLevel.PRIMARY,
        description: 'Igbo Language for Early Childhood Care and Development Education',
      },

      // Primary School Subjects
      {
        name: 'English Language',
        code: 'ENG',
        level: SchoolLevel.PRIMARY,
        description: 'English Language for Primary School',
      },
      {
        name: 'Mathematics',
        code: 'MTH',
        level: SchoolLevel.PRIMARY,
        description: 'Mathematics for Primary School',
      },
      {
        name: 'Igbo Language',
        code: 'IGB',
        level: SchoolLevel.PRIMARY,
        description: 'Igbo Language for Primary School',
      },
      {
        name: 'National Values Education',
        code: 'NVE',
        level: SchoolLevel.PRIMARY,
        description: 'National Values Education for Primary School',
      },
      {
        name: 'Pre-Vocational Studies',
        code: 'PVS',
        level: SchoolLevel.PRIMARY,
        description: 'Pre-Vocational Studies for Basic 4 and 5',
      },
      {
        name: 'Christian Religious Studies',
        code: 'CRS',
        level: SchoolLevel.PRIMARY,
        description: 'Christian Religious Studies for Primary School',
      },
      {
        name: 'History',
        code: 'HIS',
        level: SchoolLevel.PRIMARY,
        description: 'History for Primary School',
      },
      {
        name: 'Cultural and Creative Arts',
        code: 'CCA',
        level: SchoolLevel.PRIMARY,
        description: 'Cultural and Creative Arts for Primary School',
      },
      {
        name: 'Basic Science and Technology',
        code: 'BST',
        level: SchoolLevel.PRIMARY,
        description: 'Basic Science and Technology for Primary School',
      },

      // Junior Secondary School Subjects (SECONDARY level)
      {
        name: 'English Language',
        code: 'ENG',
        level: SchoolLevel.SECONDARY,
        description: 'English Language for Junior Secondary School',
      },
      {
        name: 'French Language',
        code: 'FRN',
        level: SchoolLevel.SECONDARY,
        description: 'French Language for Junior Secondary School',
      },
      {
        name: 'Igbo Language',
        code: 'IGB',
        level: SchoolLevel.SECONDARY,
        description: 'Igbo Language for Junior Secondary School',
      },
      {
        name: 'Pre-Vocational Studies',
        code: 'PVS',
        level: SchoolLevel.SECONDARY,
        description: 'Pre-Vocational Studies for Junior Secondary School',
      },
      {
        name: 'Cultural and Creative Arts',
        code: 'CCA',
        level: SchoolLevel.SECONDARY,
        description: 'Cultural and Creative Arts for Junior Secondary School',
      },
      {
        name: 'National Values Education',
        code: 'NVE',
        level: SchoolLevel.SECONDARY,
        description: 'National Values Education for Junior Secondary School',
      },
      {
        name: 'Mathematics',
        code: 'MTH',
        level: SchoolLevel.SECONDARY,
        description: 'Mathematics for Junior Secondary School',
      },
      {
        name: 'Christian Religious Studies',
        code: 'CRS',
        level: SchoolLevel.SECONDARY,
        description: 'Christian Religious Studies for Junior Secondary School',
      },
      {
        name: 'Business Studies',
        code: 'BUS',
        level: SchoolLevel.SECONDARY,
        description: 'Business Studies for Junior Secondary School',
      },
      {
        name: 'History',
        code: 'HIS',
        level: SchoolLevel.SECONDARY,
        description: 'History for Junior Secondary School',
      },
      {
        name: 'Basic Technology',
        code: 'BTE',
        level: SchoolLevel.SECONDARY,
        description: 'Basic Technology for Junior Secondary School',
      },
    ];

    let created = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`📚 Creating ${subjects.length} subjects...\n`);

    for (const subjectData of subjects) {
      try {
        // Use upsert to update existing or create new subject
        // First try to find by exact match
        const existing = await prisma.subject.findFirst({
          where: {
            stateId: abiaState.id,
            name: subjectData.name,
            level: subjectData.level,
          },
        });

        if (existing) {
          // Update existing subject with new data (in case code or description changed)
          const subject = await prisma.subject.update({
            where: { id: existing.id },
            data: {
              code: subjectData.code,
              description: subjectData.description,
            },
          });
          console.log(`🔄 Updated: ${subject.name} (${subject.code}) - ${subject.level}`);
          created++;
        } else {
          // Try to create new subject
          try {
            const subject = await prisma.subject.create({
              data: {
                ...subjectData,
                stateId: abiaState.id,
              },
            });
            console.log(`✅ Created: ${subject.name} (${subject.code}) - ${subject.level}`);
            created++;
          } catch (createError) {
            // If creation fails due to unique constraint, try to find and update
            if (createError.code === 'P2002') {
              // Unique constraint violation - subject might exist with different case
              const existingByCode = await prisma.subject.findFirst({
                where: {
                  stateId: abiaState.id,
                  code: subjectData.code,
                  level: subjectData.level,
                },
              });

              if (existingByCode) {
                // Update existing subject with proper name
                const subject = await prisma.subject.update({
                  where: { id: existingByCode.id },
                  data: {
                    name: subjectData.name,
                    description: subjectData.description,
                  },
                });
                console.log(`🔄 Updated: ${subject.name} (${subject.code}) - ${subject.level}`);
                created++;
              } else {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${subjectData.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📚 Total: ${subjects.length}\n`);

    // Display all subjects by level
    const allSubjects = await prisma.subject.findMany({
      where: { stateId: abiaState.id },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });

    console.log('📖 All Abia State Subjects:\n');
    
    const primarySubjects = allSubjects.filter(s => s.level === SchoolLevel.PRIMARY);
    const secondarySubjects = allSubjects.filter(s => s.level === SchoolLevel.SECONDARY);

    console.log('🏫 PRIMARY Level:');
    primarySubjects.forEach(s => {
      console.log(`   ${s.name} (${s.code})`);
    });

    console.log('\n🏫 SECONDARY Level:');
    secondarySubjects.forEach(s => {
      console.log(`   ${s.name} (${s.code})`);
    });

    console.log('\n✨ Seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAbiaSubjects()
  .then(() => {
    console.log('🎉 Seed script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });

