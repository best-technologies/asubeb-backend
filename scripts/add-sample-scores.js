const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleScores() {
  try {
    console.log('🎯 Adding sample scores to assessments...');
    
    // Get all assessments
    const assessments = await prisma.assessment.findMany({
      select: {
        id: true,
        studentId: true,
        score: true,
      },
    });

    console.log(`📊 Found ${assessments.length} assessments`);

    // Generate random scores between 60 and 100
    const updates = assessments.map(assessment => {
      const randomScore = Math.floor(Math.random() * 41) + 60; // 60-100
      return prisma.assessment.update({
        where: { id: assessment.id },
        data: { score: randomScore },
      });
    });

    // Update all assessments
    await Promise.all(updates);

    console.log('✅ All assessments updated with sample scores!');

    // Show some sample results
    const sampleAssessments = await prisma.assessment.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        score: true,
        title: true,
      },
    });

    console.log('\n🎯 Sample updated assessments:', sampleAssessments);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleScores(); 