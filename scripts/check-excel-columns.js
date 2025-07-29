const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExcelColumns() {
  try {
    console.log('🔍 Checking subjects and Excel column mapping...');
    
    // Get all subjects in database
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            assessments: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('\n📖 Subjects in database:');
    subjects.forEach(subject => {
      console.log(`  ${subject.name}: ${subject._count.assessments} assessments`);
    });

    // Expected Excel columns
    const expectedColumns = [
      'English Language',
      'Mathematics', 
      'Number work',
      'General norms',
      'Letter work',
      'Rhyme',
      'National values',
      'Prevocational',
      'CRS',
      'History',
      'Igbo Language',
      'CCA',
      'Basic science and technology'
    ];

    console.log('\n📋 Expected Excel columns:');
    expectedColumns.forEach(column => {
      const found = subjects.find(s => s.name === column.toLowerCase());
      console.log(`  ${column}: ${found ? '✅ Found' : '❌ Missing'} (${found ? found._count.assessments : 0} assessments)`);
    });

    // Check if there are any subjects with 0 assessments
    const subjectsWithZeroAssessments = subjects.filter(s => s._count.assessments === 0);
    if (subjectsWithZeroAssessments.length > 0) {
      console.log('\n⚠️ Subjects with 0 assessments:');
      subjectsWithZeroAssessments.forEach(subject => {
        console.log(`  ${subject.name}`);
      });
    }

    // Check total assessments
    const totalAssessments = subjects.reduce((sum, s) => sum + s._count.assessments, 0);
    console.log(`\n📊 Total assessments: ${totalAssessments}`);

    // Check if we have the right number of students
    const studentCount = await prisma.student.count({
      where: { isActive: true },
    });
    console.log(`👥 Total students: ${studentCount}`);

    // Expected vs actual
    const expectedAssessments = studentCount * expectedColumns.length;
    console.log(`📈 Expected assessments: ${expectedAssessments} (${studentCount} students × ${expectedColumns.length} subjects)`);
    console.log(`📉 Missing assessments: ${expectedAssessments - totalAssessments}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExcelColumns(); 