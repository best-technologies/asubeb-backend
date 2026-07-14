const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { firstName: 'Super' } }).then(u => {
  console.log(u);
}).finally(() => prisma.$disconnect());
