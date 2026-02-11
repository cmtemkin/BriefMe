/**
 * Syncs RELEASE-NOTES.md and USER-GUIDE.md content into app-readable data files.
 * The /changelog and /guide pages read these files at build time.
 * Runs automatically via GitHub Actions on merge to main.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");

const DOCS_TO_SYNC = [
  {
    source: "RELEASE-NOTES.md",
    destDir: join(ROOT, "src", "app", "(marketing)", "changelog"),
    destFile: "content.md",
  },
  {
    source: "USER-GUIDE.md",
    destDir: join(ROOT, "src", "app", "(marketing)", "guide"),
    destFile: "content.md",
  },
];

function main() {
  for (const doc of DOCS_TO_SYNC) {
    const sourcePath = join(ROOT, doc.source);
    if (!existsSync(sourcePath)) {
      console.log(`Source not found: ${doc.source}, skipping.`);
      continue;
    }

    if (!existsSync(doc.destDir)) {
      mkdirSync(doc.destDir, { recursive: true });
    }

    const content = readFileSync(sourcePath, "utf-8");
    const destPath = join(doc.destDir, doc.destFile);
    writeFileSync(destPath, content);

    console.log(`Synced ${doc.source} → ${destPath}`);
  }
}

main();
