const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudentAssociations() {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
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
      },
      take: 5,
    });

    console.log('Sample students with their class and school:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} (${student.studentId})`);
      console.log(`   Class: ${student.class?.name || 'No class'}`);
      console.log(`   School: ${student.class?.school?.name || 'No school'}`);
      console.log('');
    });

    // Check total count of students with and without classes
    const totalStudents = await prisma.student.count({
      where: { isActive: true },
    });

    const studentsWithClasses = await prisma.student.count({
      where: { 
        isActive: true,
        classId: { not: null }
      },
    });

    console.log(`Total active students: ${totalStudents}`);
    console.log(`Students with classes: ${studentsWithClasses}`);
    console.log(`Students without classes: ${totalStudents - studentsWithClasses}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkStudentAssociations(); 