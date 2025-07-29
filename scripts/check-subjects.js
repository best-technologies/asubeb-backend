const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubjects() {
  try {
    console.log('📚 Checking subjects and their assessment counts...');
    
    // Get all subjects
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
    });

    console.log('\n📖 Subjects created:');
    subjects.forEach(subject => {
      console.log(`  ${subject.name}: ${subject._count.assessments} assessments`);
    });

    // Get total students
    const studentCount = await prisma.student.count({
      where: { isActive: true },
    });

    console.log(`\n👥 Total students: ${studentCount}`);
    console.log(`📊 Total assessments: ${subjects.reduce((sum, s) => sum + s._count.assessments, 0)}`);

    // Show sample student with their assessments
    const sampleStudent = await prisma.student.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        assessments: {
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
    });

    if (sampleStudent) {
      console.log(`\n📊 Sample student: ${sampleStudent.firstName} ${sampleStudent.lastName} (${sampleStudent.studentId})`);
      console.log('Subject scores:');
      sampleStudent.assessments.forEach(assessment => {
        console.log(`  ${assessment.subject.name}: ${assessment.score}`);
      });
      
      const totalScore = sampleStudent.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
      console.log(`  Total Score: ${totalScore}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubjects(); 