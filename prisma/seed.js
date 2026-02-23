const { PrismaClient } = require("@prisma/client");
const { createHash } = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return createHash("sha256")
    .update(password + "ngo-salt-2024")
    .digest("hex");
}

async function main() {
  console.log("Seeding users...");

  await prisma.user.upsert({
    where: { email: "helpdesk@kenyayfc.org" },
    update: { password: hashPassword("admin2024"), role: "ADMIN" },
    create: {
      email: "helpdesk@kenyayfc.org",
      name: "System Administrator",
      password: hashPassword("admin2024"),
      role: "ADMIN",
      department: "IT",
    },
  });

  await prisma.user.upsert({
    where: { email: "shem@kenyayfc.org" },
    update: { password: hashPassword("director2024"), role: "DIRECTOR" },
    create: {
      email: "shem@kenyayfc.org",
      name: "Shem - National Director",
      password: hashPassword("director2024"),
      role: "DIRECTOR",
      department: "National Office",
    },
  });

  await prisma.user.upsert({
    where: { email: "accounts@kenyayfc.org" },
    update: { password: hashPassword("accounts2024"), role: "ACCOUNTANT" },
    create: {
      email: "accounts@kenyayfc.org",
      name: "Accounts Officer",
      password: hashPassword("accounts2024"),
      role: "ACCOUNTANT",
      department: "Finance",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@kenyayfc.org" },
    update: { password: hashPassword("staff2024"), role: "STAFF" },
    create: {
      email: "staff@kenyayfc.org",
      name: "Staff Member",
      password: hashPassword("staff2024"),
      role: "STAFF",
      department: "Programs",
    },
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
