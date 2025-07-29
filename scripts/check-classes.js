const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClasses() {
  try {
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        school: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log('Available classes:');
    classes.forEach((cls, index) => {
      console.log(`${index + 1}. ${cls.name} (School: ${cls.school?.name || 'No school'})`);
    });

    console.log(`\nTotal classes: ${classes.length}`);

    // Check if there are any classes at all
    if (classes.length === 0) {
      console.log('\n⚠️  No classes found in database!');
      console.log('This is why students don\'t have class associations.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkClasses(); 