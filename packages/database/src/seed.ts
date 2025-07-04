// import "dotenv/config";
import { createDatabase } from "./index";

export async function seed() {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const db = createDatabase(process.env.DATABASE_URL!);

  console.log("Seeding completed.");
}

seed().catch((err) => {
  console.error(err);
});
