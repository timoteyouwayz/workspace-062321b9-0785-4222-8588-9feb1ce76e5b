const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/lib/auth');

async function setupProductionDatabase() {
  const db = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('Setting up production database...');

    // Create admin user
    const admin = await db.user.upsert({
      where: { email: 'helpdesk@kenyayfc.org' },
      update: {
        password: hashPassword('admin2024'),
        role: 'ADMIN',
      },
      create: {
        email: 'helpdesk@kenyayfc.org',
        name: 'System Administrator',
        password: hashPassword('admin2024'),
        role: 'ADMIN',
        department: 'IT',
      },
    });

    // Create director user
    const director = await db.user.upsert({
      where: { email: 'shem@kenyayfc.org' },
      update: {
        password: hashPassword('director2024'),
        role: 'DIRECTOR',
      },
      create: {
        email: 'shem@kenyayfc.org',
        name: 'Shem - National Director',
        password: hashPassword('director2024'),
        role: 'DIRECTOR',
        department: 'National Office',
      },
    });

    // Create accountant user
    const accountant = await db.user.upsert({
      where: { email: 'accounts@kenyayfc.org' },
      update: {
        password: hashPassword('accounts2024'),
        role: 'ACCOUNTANT',
      },
      create: {
        email: 'accounts@kenyayfc.org',
        name: 'Accounts Officer',
        password: hashPassword('accounts2024'),
        role: 'ACCOUNTANT',
        department: 'Finance',
      },
    });

    // Create staff user
    const staff = await db.user.upsert({
      where: { email: 'staff@kenyayfc.org' },
      update: {
        password: hashPassword('staff2024'),
        role: 'STAFF',
      },
      create: {
        email: 'staff@kenyayfc.org',
        name: 'Staff Member',
        password: hashPassword('staff2024'),
        role: 'STAFF',
        department: 'Programs',
      },
    });

    console.log('✅ Production database setup complete!');
    console.log('Users created:');
    console.log('- Admin: helpdesk@kenyayfc.org / admin2024');
    console.log('- Director: shem@kenyayfc.org / director2024');
    console.log('- Accountant: accounts@kenyayfc.org / accounts2024');
    console.log('- Staff: staff@kenyayfc.org / staff2024');

  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  setupProductionDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { setupProductionDatabase };
