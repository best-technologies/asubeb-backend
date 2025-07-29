const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDashboardCalculation() {
  try {
    console.log('🔍 Debugging dashboard calculation...');
    
    // Get current term
    const currentTerm = await prisma.term.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      throw new Error('No current term found');
    }

    console.log(`📅 Current term: ${currentTerm.name} (ID: ${currentTerm.id})`);

    // Get all students with their assessments for current term
    const studentsWithScores = await prisma.student.findMany({
      where: { isActive: true },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        gender: true,
        class: {
          select: {
            name: true,
            school: {
              select: {
                name: true,
              },
            },
          },
        },
        assessments: {
          where: {
            termId: currentTerm.id,
          },
          select: {
            score: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    console.log(`\n👥 Found ${studentsWithScores.length} students`);

    // Calculate total scores (same as dashboard)
    const studentsWithTotalScores = studentsWithScores
      .map(student => {
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        return {
          ...student,
          totalScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    console.log('\n🏆 Top 10 students (dashboard calculation):');
    studentsWithTotalScores.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} (${student.studentId}): ${student.totalScore} points`);
      console.log(`   Subjects: ${student.assessments.map(a => `${a.subject.name}: ${a.score}`).join(', ')}`);
    });

    // Let's check a specific student in detail
    const sampleStudent = studentsWithTotalScores[0];
    if (sampleStudent) {
      console.log(`\n📊 Detailed breakdown for ${sampleStudent.firstName} ${sampleStudent.lastName}:`);
      console.log('Subject scores:');
      sampleStudent.assessments.forEach(assessment => {
        console.log(`  ${assessment.subject.name}: ${assessment.score}`);
      });
      
      const manualTotal = sampleStudent.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
      console.log(`Manual calculation: ${manualTotal}`);
      console.log(`Dashboard calculation: ${sampleStudent.totalScore}`);
      console.log(`Match: ${manualTotal === sampleStudent.totalScore ? '✅' : '❌'}`);
    }

    // Check total assessments count
    const totalAssessments = studentsWithScores.reduce((sum, s) => sum + s.assessments.length, 0);
    console.log(`\n📈 Total assessments in current term: ${totalAssessments}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDashboardCalculation(); 