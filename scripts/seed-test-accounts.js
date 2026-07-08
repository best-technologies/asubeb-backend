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

    // 3.5. Create Classes for Aba North Primary School
    let class1A = await prisma.class.findFirst({ where: { name: 'Primary 1A', schoolId: school.id } });
    if (!class1A) {
      class1A = await prisma.class.create({
        data: {
          name: 'Primary 1A',
          grade: '1',
          section: 'A',
          schoolId: school.id,
          academicYear: '2023-2024',
        }
      });
      console.log('✅ Created Class: Primary 1A');
    }

    let class1B = await prisma.class.findFirst({ where: { name: 'Primary 1B', schoolId: school.id } });
    if (!class1B) {
      class1B = await prisma.class.create({
        data: {
          name: 'Primary 1B',
          grade: '1',
          section: 'B',
          schoolId: school.id,
          academicYear: '2023-2024',
        }
      });
      console.log('✅ Created Class: Primary 1B');
    }

    // Dummy Schools in the same LGA for the Exam Officer
    let dummySchool1 = await prisma.school.findFirst({ where: { code: 'ABA-N-DUM-01' } });
    if (!dummySchool1) {
      dummySchool1 = await prisma.school.create({
        data: {
          name: 'Aba North Dummy School 1',
          code: 'ABA-N-DUM-01',
          level: SchoolLevel.PRIMARY,
          address: 'Dummy Address 1',
          lgaId: lga.id,
          stateId: state.id,
        }
      });
      console.log('✅ Created Dummy School 1');
    }

    let dummySchool2 = await prisma.school.findFirst({ where: { code: 'ABA-N-DUM-02' } });
    if (!dummySchool2) {
      dummySchool2 = await prisma.school.create({
        data: {
          name: 'Aba North Dummy School 2',
          code: 'ABA-N-DUM-02',
          level: SchoolLevel.SECONDARY,
          address: 'Dummy Address 2',
          lgaId: lga.id,
          stateId: state.id,
        }
      });
      console.log('✅ Created Dummy School 2');
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

    // 7. Create another SCHOOL_IT (for Dummy School 1)
    const itEmail2 = 'it2@school.com';
    let itPerson2 = await prisma.user.findUnique({ where: { email: itEmail2 } });
    if (!itPerson2) {
      itPerson2 = await prisma.user.create({
        data: {
          email: itEmail2,
          username: 'schoolit2',
          password: passwordHash,
          firstName: 'School',
          lastName: 'IT 2',
          role: UserRole.SCHOOL_IT,
          stateId: state.id,
          schoolIt: {
            create: {
              schoolItId: 'IT-002',
              firstName: 'School',
              lastName: 'IT 2',
              email: itEmail2,
              phone: '08000000003',
              stateId: state.id,
              schoolId: dummySchool1.id,
            }
          }
        },
      });
      console.log('✅ Created SCHOOL_IT user 2: it2@school.com / password123');
    } else {
      console.log('ℹ️ SCHOOL_IT 2 already exists: it2@school.com');
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
