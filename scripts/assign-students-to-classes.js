const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignStudentsToClasses() {
  try {
    // Get all active students without class assignments
    const studentsWithoutClasses = await prisma.student.findMany({
      where: { 
        isActive: true,
        classId: null
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
      },
    });

    // Get all available classes
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        schoolId: true,
      },
    });

    if (classes.length === 0) {
      console.log('❌ No classes found in database!');
      return;
    }

    console.log(`Found ${studentsWithoutClasses.length} students without class assignments`);
    console.log(`Found ${classes.length} available classes`);

    // Assign students to classes randomly
    let updatedCount = 0;
    for (const student of studentsWithoutClasses) {
      // Randomly select a class
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      
      try {
        await prisma.student.update({
          where: { id: student.id },
          data: { classId: randomClass.id },
        });
        
        updatedCount++;
        console.log(`✅ Assigned ${student.firstName} ${student.lastName} to ${randomClass.name}`);
      } catch (error) {
        console.error(`❌ Failed to assign ${student.firstName} ${student.lastName}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully assigned ${updatedCount} students to classes`);

    // Verify the assignments
    const studentsWithClasses = await prisma.student.count({
      where: { 
        isActive: true,
        classId: { not: null }
      },
    });

    const totalStudents = await prisma.student.count({
      where: { isActive: true },
    });

    console.log(`\n📊 Final stats:`);
    console.log(`Total active students: ${totalStudents}`);
    console.log(`Students with classes: ${studentsWithClasses}`);
    console.log(`Students without classes: ${totalStudents - studentsWithClasses}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

assignStudentsToClasses(); 