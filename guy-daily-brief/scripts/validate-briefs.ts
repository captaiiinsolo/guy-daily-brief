import fs from "node:fs";
import path from "node:path";
import { briefSchema } from "../src/lib/schema";

const briefsDir = path.join(process.cwd(), "content", "briefs");

function main() {
  if (!fs.existsSync(briefsDir)) {
    console.error(`Briefs directory not found: ${briefsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(briefsDir).filter((file) => file.endsWith(".json"));

  if (files.length === 0) {
    console.warn("No briefing files found.");
    return;
  }

  for (const file of files) {
    const filePath = path.join(briefsDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    briefSchema.parse(parsed);
    console.log(`✓ ${file}`);
  }

  console.log(`Validated ${files.length} briefing file(s).`);
}

main();
