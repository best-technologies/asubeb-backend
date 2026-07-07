const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting passwords...');
  const newPassword = 'Password@123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const admins = await prisma.user.findMany({
    where: {
      email: {
        in: ['admin@asubeb.com', 'bernardmayowaa@gmail.com']
      }
    }
  });

  for (const admin of admins) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    console.log(`Updated password for ${admin.email} to: ${newPassword}`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
