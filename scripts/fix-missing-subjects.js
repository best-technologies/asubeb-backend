const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMissingSubjects() {
  try {
    console.log('🔧 Fixing missing subjects and assessments...');
    
    // Missing subjects
    const missingSubjects = [
      'English Language',
      'Number work'
    ];

    console.log(`📚 Adding missing subjects: ${missingSubjects.join(', ')}`);

    // Create missing subjects
    const subjectIds = {};
    for (const subjectName of missingSubjects) {
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
        console.log(`✅ Created subject: ${subjectName}`);
      } else {
        console.log(`ℹ️ Subject already exists: ${subjectName}`);
      }
      subjectIds[subjectName] = subject.id;
    }

    // Get current term
    const currentTerm = await prisma.term.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      throw new Error('No current term found');
    }

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

    // Get all classes
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (classes.length === 0) {
      throw new Error('No classes found');
    }

    const classId = classes[0].id;

    let totalNewAssessments = 0;

    // Create assessments for missing subjects
    for (const student of students) {
      for (const subjectName of missingSubjects) {
        // Generate a score between 60-100 for demo
        const score = Math.floor(Math.random() * 41) + 60;
        
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
        totalNewAssessments++;
      }
    }

    console.log(`✅ Created ${totalNewAssessments} new assessments`);

    // Show updated subject counts
    const updatedSubjects = await prisma.subject.findMany({
      select: {
        name: true,
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

    console.log('\n📖 Updated subject counts:');
    updatedSubjects.forEach(subject => {
      console.log(`  ${subject.name}: ${subject._count.assessments} assessments`);
    });

    // Show total assessments
    const totalAssessments = updatedSubjects.reduce((sum, s) => sum + s._count.assessments, 0);
    console.log(`\n📊 Total assessments: ${totalAssessments}`);

    // Show sample student with all subjects
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
          orderBy: {
            subject: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (sampleStudent) {
      console.log(`\n📊 Sample student: ${sampleStudent.firstName} ${sampleStudent.lastName} (${sampleStudent.studentId})`);
      console.log('All subject scores:');
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

fixMissingSubjects(); 