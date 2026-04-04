import { generateBrief, writeBrief } from "../src/lib/generate";

async function main() {
  const brief = await generateBrief();
  const outputPath = writeBrief(brief);
  console.log(`Wrote real-source brief: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
