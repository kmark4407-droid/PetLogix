// server/test-db.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to DB and reading sample rows...");
  const sample = await prisma.petlogix.findMany({ take: 2 });
  console.log("Sample rows (may be empty):", sample);

  console.log("Inserting a test pet...");
  const pet = await prisma.petlogix.create({
    data: {
      name: "Buddy (test)",
      owner: "Mark (test)",
      species: "Dog",
      breed: "Labrador",
      // optional fields omitted or add imageUrl/address/contact if you want
    },
  });

  console.log("Inserted pet:", pet);

  // Optional: fetch again to confirm
  const all = await prisma.petlogix.findMany({ orderBy: { id: "desc" }, take: 5 });
  console.log("Recent rows:", all);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("ERROR in test script:", e);
  prisma.$disconnect().finally(() => process.exit(1));
});
