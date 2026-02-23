import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function main() {
  console.log('Creating organization accounts...\n');

  // Admin - helpdesk@kenyayfc.org - Can do ANYTHING
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
  console.log('✓ Admin account created:');
  console.log('  Email: helpdesk@kenyayfc.org');
  console.log('  Password: admin2024');
  console.log('  Role: ADMIN (Full access)\n');

  // National Director - shem@kenyayfc.org - Can APPROVE only
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
  console.log('✓ National Director account created:');
  console.log('  Email: shem@kenyayfc.org');
  console.log('  Password: director2024');
  console.log('  Role: DIRECTOR (Can approve requisitions)\n');

  // Accounts Officer - accounts@kenyayfc.org - Can CHECK, DISBURSE, verify receipts
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
  console.log('✓ Accounts Officer account created:');
  console.log('  Email: accounts@kenyayfc.org');
  console.log('  Password: accounts2024');
  console.log('  Role: ACCOUNTANT (Can check, disburse, verify receipts)\n');

  // Demo staff account
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
  console.log('✓ Demo Staff account created:');
  console.log('  Email: staff@kenyayfc.org');
  console.log('  Password: staff2024');
  console.log('  Role: STAFF (Can create requisitions)\n');

  console.log('='.repeat(50));
  console.log('ALL ACCOUNTS READY FOR PRODUCTION');
  console.log('='.repeat(50));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
