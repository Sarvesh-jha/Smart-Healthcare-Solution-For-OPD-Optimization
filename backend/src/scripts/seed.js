import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { seedDemoData } from "../utils/seedDemoData.js";

async function run() {
  try {
    const cliUri =
      process.argv.slice(2).find((arg) => arg.startsWith("mongodb://") || arg.startsWith("mongodb+srv://")) ||
      process.argv.slice(2).find((arg) => arg.startsWith("--uri="))?.split("=")[1] ||
      process.argv.slice(2).find((arg) => arg.startsWith("--mongodb_uri="))?.split("=")[1] ||
      process.argv.slice(2).find((arg) => arg.startsWith("--mongo_uri="))?.split("=")[1];

    const targetUri = cliUri || process.env.MONGODB_URI || process.env.MONGO_URI || env.mongoUri;

    const maskedUri = targetUri
      ? targetUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
      : "undefined";

    console.log(`[MEDIrxCARE Seeder] Connecting to MongoDB: ${maskedUri}`);
    await connectDatabase(targetUri);

    console.log("[MEDIrxCARE Seeder] Provisioning baseline clinical departments, doctors, test categories, and emergency points...");
    await seedDemoData();

    console.log("[MEDIrxCARE Seeder] Database seeded successfully with zero duplicate key conflicts.");
  } catch (error) {
    console.error("[MEDIrxCARE Seeder] Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

run();

