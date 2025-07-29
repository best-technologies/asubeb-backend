const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAssessments() {
  try {
    console.log('🔍 Checking database for terms and assessments...');
    
    // Check sessions
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        name: true,
        isCurrent: true,
        isActive: true,
      },
    });
    console.log('\n📚 Sessions:', sessions);

    // Check terms
    const terms = await prisma.term.findMany({
      select: {
        id: true,
        name: true,
        isCurrent: true,
        isActive: true,
        session: {
          select: {
            name: true,
          },
        },
      },
    });
    console.log('\n📅 Terms:', terms);

    // Check assessments
    const assessmentCount = await prisma.assessment.count();
    console.log(`\n📊 Total assessments: ${assessmentCount}`);

    // Check assessments by term
    const assessmentsByTerm = await prisma.assessment.groupBy({
      by: ['termId'],
      _count: {
        termId: true,
      },
    });
    console.log('\n📈 Assessments by term:', assessmentsByTerm);

    // Check a few sample assessments
    const sampleAssessments = await prisma.assessment.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        termId: true,
        score: true,
        type: true,
        title: true,
      },
    });
    console.log('\n🎯 Sample assessments:', sampleAssessments);

    // Check students with assessments
    const studentsWithAssessments = await prisma.student.findMany({
      where: {
        assessments: {
          some: {},
        },
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            assessments: true,
          },
        },
      },
      take: 5,
    });
    console.log('\n👥 Sample students with assessments:', studentsWithAssessments);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssessments(); 