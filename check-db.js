const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({where: {email: 'officer@asubeb.com'}})
  .then(u => console.log(u))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
