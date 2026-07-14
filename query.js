const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.auditLog.findMany({ take: 5 }).then(logs => {
  console.log("Logs:", logs);
  
  const userIds = [...new Set(logs.map(l => l.userId))];
  prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, role: true } }).then(users => {
    console.log("Users:", users);
  });
}).finally(() => prisma.$disconnect());
