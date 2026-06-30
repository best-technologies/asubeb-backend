const { PrismaClient, UserRole, SchoolLevel } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestAccounts() {
  try {
    console.log('🌱 Starting test accounts seeding...\n');

    // 1. Get or Create Abia State
    let state = await prisma.state.findFirst({ where: { stateId: 'ABIA' } });
    if (!state) {
      state = await prisma.state.create({
        data: {
          stateId: 'ABIA',
          stateName: 'Abia State',
          code: 'AB',
        },
      });
      console.log('✅ Created Abia State');
    }

    // 2. Get or Create LGA
    let lga = await prisma.localGovernmentArea.findFirst({ where: { name: 'Aba North', stateId: state.id } });
    if (!lga) {
      lga = await prisma.localGovernmentArea.create({
        data: {
          name: 'Aba North',
          code: 'ABA-N',
          state: 'ABIA',
          stateId: state.id,
        },
      });
      console.log('✅ Created LGA: Aba North');
    }

    // 3. Get or Create School
    let school = await prisma.school.findFirst({ where: { name: 'Aba North Primary School', stateId: state.id } });
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Aba North Primary School',
          code: 'ABA-N-PRI-01',
          level: SchoolLevel.PRIMARY,
          address: '123 School Road, Aba',
          lgaId: lga.id,
          stateId: state.id,
        },
      });
      console.log('✅ Created School: Aba North Primary School');
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    // 4. Create SUPER_ADMIN
    const adminEmail = 'admin@asubeb.com';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          username: 'superadmin',
          password: passwordHash,
          firstName: 'Super',
          lastName: 'Admin',
          role: UserRole.SUPER_ADMIN,
          stateId: state.id,
        },
      });
      console.log('✅ Created SUPER_ADMIN user: admin@asubeb.com / password123');
    } else {
      console.log('ℹ️ SUPER_ADMIN already exists: admin@asubeb.com');
    }

    // 5. Create SUBEB_OFFICER
    const officerEmail = 'officer@asubeb.com';
    let officer = await prisma.user.findUnique({ where: { email: officerEmail } });
    if (!officer) {
      officer = await prisma.user.create({
        data: {
          email: officerEmail,
          username: 'subebofficer',
          password: passwordHash,
          firstName: 'Exam',
          lastName: 'Officer',
          role: UserRole.SUBEB_OFFICER,
          stateId: state.id,
          subebOfficer: {
            create: {
              officerId: 'OFF-001',
              firstName: 'Exam',
              lastName: 'Officer',
              email: officerEmail,
              phone: '08000000001',
              stateId: state.id,
              lgaId: lga.id,
            }
          }
        },
      });
      console.log('✅ Created SUBEB_OFFICER user: officer@asubeb.com / password123');
    } else {
      console.log('ℹ️ SUBEB_OFFICER already exists: officer@asubeb.com');
    }

    // 6. Create SCHOOL_IT
    const itEmail = 'it@school.com';
    let itPerson = await prisma.user.findUnique({ where: { email: itEmail } });
    if (!itPerson) {
      itPerson = await prisma.user.create({
        data: {
          email: itEmail,
          username: 'schoolit',
          password: passwordHash,
          firstName: 'School',
          lastName: 'IT',
          role: UserRole.SCHOOL_IT,
          stateId: state.id,
          schoolIt: {
            create: {
              schoolItId: 'IT-001',
              firstName: 'School',
              lastName: 'IT',
              email: itEmail,
              phone: '08000000002',
              stateId: state.id,
              schoolId: school.id,
            }
          }
        },
      });
      console.log('✅ Created SCHOOL_IT user: it@school.com / password123');
    } else {
      console.log('ℹ️ SCHOOL_IT already exists: it@school.com');
    }

    console.log('\n✨ Seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding test accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestAccounts();
