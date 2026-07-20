import fg from "fast-glob";
import * as path from "path";
import "reflect-metadata";

import dataSource from "@shared/infrastructure/database/data-source";

import { Seeder } from "./seeder.interface";

type SeederConstructor = new () => Seeder;

async function discoverSeeders(): Promise<SeederConstructor[]> {
  const pattern = path.join(__dirname, "../../../modules/**/*.seeder.{ts,js}").replace(/\\/g, "/");
  const files = (await fg(pattern, { absolute: true })).sort(); // alfabetycznie — patrz konwencja niżej

  const seederClasses: SeederConstructor[] = [];

  for (const file of files) {
    const module = await import(file);

    for (const exported of Object.values(module)) {
      const isSeederClass =
        typeof exported === "function" && typeof exported.prototype?.run === "function";

      if (isSeederClass) {
        seederClasses.push(exported as SeederConstructor);
      }
    }
  }

  return seederClasses;
}

async function runSeeds() {
  await dataSource.initialize();
  const seeders = await discoverSeeders();

  console.log(`Discovered ${seeders.length} seeder(s).`);

  for (const SeederClass of seeders) {
    console.log(`  → ${SeederClass.name}`);
    await new SeederClass().run(dataSource);
  }

  console.log("Seeding complete.");
  await dataSource.destroy();
}

runSeeds().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
