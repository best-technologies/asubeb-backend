const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllSchoolStudentCounts() {
  try {
    console.log('🔄 Updating school student counts...');
    
    const schools = await prisma.school.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    console.log(`📚 Found ${schools.length} active schools`);

    for (const school of schools) {
      const studentCount = await prisma.student.count({
        where: {
          schoolId: school.id,
          isActive: true,
        },
      });

      await prisma.school.update({
        where: { id: school.id },
        data: { totalStudents: studentCount },
      });

      console.log(`✅ ${school.name}: ${studentCount} students`);
    }

    console.log('🎉 All school student counts updated successfully!');
  } catch (error) {
    console.error('❌ Error updating school counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllSchoolStudentCounts(); 