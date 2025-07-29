const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recreateProperAssessments() {
  try {
    console.log('🔄 Recreating proper assessments (one per subject per student)...');
    
    // First, delete all existing assessments
    await prisma.assessment.deleteMany({});
    console.log('🗑️ Deleted all existing assessments');

    // Get all students
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`👥 Found ${students.length} students`);

    // Get current term
    const currentTerm = await prisma.term.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      throw new Error('No current term found');
    }

    // Define subjects (matching your Excel columns)
    const subjects = [
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

    // Create or get subjects
    const subjectIds = {};
    for (const subjectName of subjects) {
      let subject = await prisma.subject.findFirst({
        where: { name: subjectName.toLowerCase() },
      });

      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            name: subjectName.toLowerCase(),
            code: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            level: 'PRIMARY',
            isActive: true,
          },
        });
        console.log(`📚 Created subject: ${subjectName}`);
      }
      subjectIds[subjectName] = subject.id;
    }

    // Get all classes
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (classes.length === 0) {
      throw new Error('No classes found');
    }

    const classId = classes[0].id; // Use first class for now

    let totalAssessments = 0;

    // Create assessments for each student
    for (const student of students) {
      // Generate scores for each subject (60-100 range)
      for (const subjectName of subjects) {
        const score = Math.floor(Math.random() * 41) + 60; // 60-100
        
        await prisma.assessment.create({
          data: {
            studentId: student.id,
            subjectId: subjectIds[subjectName],
            classId: classId,
            termId: currentTerm.id,
            type: 'EXAM',
            title: 'Excel Upload Assessment',
            maxScore: 100,
            score: score,
            percentage: 100,
            dateGiven: new Date(),
            isSubmitted: true,
            isGraded: true,
          },
        });
        totalAssessments++;
      }
    }

    console.log(`✅ Created ${totalAssessments} assessments (${students.length} students × ${subjects.length} subjects)`);

    // Show sample results
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

    // Show total assessments count
    const finalCount = await prisma.assessment.count();
    console.log(`\n📈 Final assessment count: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateProperAssessments(); 