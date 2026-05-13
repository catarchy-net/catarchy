import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(import.meta.dir, "out");

for (const file of readdirSync(migrationsDir)) {
  if (!file.endsWith(".sql")) continue;

  const filePath = join(migrationsDir, file);
  const original = readFileSync(filePath, "utf-8");

  if (!original.includes("PRAGMA foreign_keys=OFF")) continue;

  const segments = original.split(/--> statement-breakpoint\n?/).map((s) => s.trim()).filter(Boolean);

  const inRecreation: string[] = [];
  const afterRecreation: string[] = [];

  for (const seg of segments) {
    if (
      /^PRAGMA foreign_keys=O(FF|N)/.test(seg) ||
      /^CREATE TABLE `__new_/.test(seg) ||
      /^INSERT INTO `__new_/.test(seg) ||
      /^DROP TABLE/.test(seg) ||
      /^ALTER TABLE `__new_.*RENAME TO/.test(seg)
    ) {
      if (!/^PRAGMA foreign_keys=ON/.test(seg)) {
        inRecreation.push(seg.replace(/^PRAGMA foreign_keys=OFF;?/, "PRAGMA defer_foreign_keys = on;"));
      }
    } else {
      afterRecreation.push(seg);
    }
  }

  if (inRecreation.length === 0) continue;

  // No BEGIN/COMMIT — just one segment so D1 runs it as a single implicit transaction
  const parts = [inRecreation.join("\n"), ...afterRecreation];

  writeFileSync(filePath, parts.join("\n--> statement-breakpoint\n") + "\n");
  console.log(`fixed: ${file}`);
}
