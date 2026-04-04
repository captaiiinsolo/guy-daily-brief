import { refreshBriefSection } from "../src/lib/generate";
import type { BriefCategory } from "../src/lib/sources";

const section = process.argv[2] as BriefCategory | undefined;
const validSections: BriefCategory[] = ["us", "world", "tech"];

async function main() {
  if (!section || !validSections.includes(section)) {
    console.error(`Usage: npm run refresh-section -- <${validSections.join("|")}>`);
    process.exit(1);
  }

  const brief = await refreshBriefSection(section);
  console.log(`Refreshed ${section} for ${brief.date}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
