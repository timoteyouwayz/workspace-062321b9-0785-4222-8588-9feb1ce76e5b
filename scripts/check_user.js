const { PrismaClient } = require("@prisma/client");
const { createHash } = require("crypto");

async function main() {
  const db = new PrismaClient();
  try {
    const u = await db.user.findUnique({
      where: { email: "helpdesk@kenyayfc.org" },
    });
    console.log("DB user:", u);
    const h = createHash("sha256")
      .update("admin2024" + "ngo-salt-2024")
      .digest("hex");
    console.log("Computed hash for admin2024:", h);
  } catch (e) {
    console.error(e);
  } finally {
    await db.$disconnect();
  }
}

main();
