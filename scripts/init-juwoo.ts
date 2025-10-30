import { drizzle } from "drizzle-orm/mysql2";
import { juwooProfile } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function initJuwoo() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  try {
    // Check if Juwoo profile exists
    const existing = await db.select().from(juwooProfile).where(eq(juwooProfile.id, 1)).limit(1);

    if (existing.length > 0) {
      console.log("✅ Juwoo profile already exists");
      console.log("Current points:", existing[0].currentPoints);
    } else {
      // Create Juwoo profile
      await db.insert(juwooProfile).values({
        id: 1,
        name: "주우",
        currentPoints: 0,
      });
      console.log("✅ Juwoo profile created successfully");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

initJuwoo();
