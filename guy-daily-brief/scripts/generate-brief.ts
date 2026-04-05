import fs from "node:fs";
import path from "node:path";
import { cleanFetchedText, computeWhyItMatters, extractItems, extractRawTag, extractTag, fetchReadableArticle, fetchText, normalizeDate, stripTags } from "../src/lib/ingest";
import { feedSources } from "../src/lib/sources";

type Story = {
  headline: string;
  summary: string;
  whyItMatters: string;
  author?: string;
  publishedAt?: string;
  extractedText?: string;
  extractedMarkdown?: string;
  source: {
    name: string;
    url: string;
  };
};

type Brief = {
  date: string;
  title: string;
  summary: string;
  sections: {
    us: Story[];
    world: Story[];
    tech: Story[];
  };
  watchlist: string[];
};

const briefsDir = path.join(process.cwd(), "content", "briefs");
const today = new Date().toISOString().slice(0, 10);
const outputPath = path.join(briefsDir, `${today}.json`);

function dedupeStories(stories: Story[]) {
  const seen = new Set<string>();
  return stories.filter((story) => {
    const key = story.headline.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  fs.mkdirSync(briefsDir, { recursive: true });

  const brief: Brief = {
    date: today,
    title: "Guy Daily Brief",
    summary: "A concise editorial-style briefing with readable source text pulled into the dashboard so the dashboard itself becomes the reading surface.",
    sections: {
      us: [],
      world: [],
      tech: [],
    },
    watchlist: [
      "Any major story that gains a concrete second-day update",
      "New security advisories significant enough to replace a lower-signal tech item",
      "Developments that materially change markets, policy, or conflict trajectories",
    ],
  };

  for (const source of feedSources) {
    if (!source.feedUrl.endsWith(".xml")) continue;

    const xml = cleanFetchedText(await fetchText(source.feedUrl));
    const items = extractItems(xml).slice(0, source.maxItems + 5);

    for (const item of items) {
      if (brief.sections[source.category].length >= source.maxItems) break;

      const headline = extractTag(item, "title");
      const summary = extractTag(item, "description");
      const url = extractTag(item, "link");
      const author = extractTag(item, "dc:creator");
      const publishedAt = normalizeDate(extractTag(item, "pubDate"));
      const encoded = extractRawTag(item, "content:encoded");

      if (!headline || !summary || !url) continue;

      let extractedText = encoded ? stripTags(encoded) : undefined;
      if (!extractedText || extractedText.length < 420) {
        extractedText = await fetchReadableArticle(url);
      }

      const normalizedExtractedText = extractedText && extractedText.length > summary.length + 80 ? extractedText : undefined;

      brief.sections[source.category].push({
        headline,
        summary,
        whyItMatters: computeWhyItMatters(source.category, summary),
        author,
        publishedAt,
        extractedText: normalizedExtractedText,
        source: {
          name: source.sourceName,
          url,
        },
      });
    }
  }

  brief.sections.us = dedupeStories(brief.sections.us).slice(0, 3);
  brief.sections.world = dedupeStories(brief.sections.world).slice(0, 3);
  brief.sections.tech = dedupeStories(brief.sections.tech).slice(0, 3);

  if (brief.sections.tech.length === 0) {
    brief.sections.tech.push({
      headline: "CISA alert and advisory categories remain the core of the security feed",
      summary: "CISA's alert, advisory, and malware analysis tracks remain the cleanest official source for high-priority cyber issues that deserve a place in the dashboard.",
      whyItMatters: "This belongs here because security and infrastructure changes tend to have longer practical consequences than product hype.",
      publishedAt: today,
      extractedText: "CISA uses alerts for recent, ongoing, or high-impact cyber threats, advisories for deeper technical guidance on tactics and mitigations, and malware analysis reports for detailed behavior and detection information. For the dashboard, this matters because it gives the tech file an official, high-signal backbone instead of relying on hype-heavy product coverage.",
      source: {
        name: "CISA",
        url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
      },
    });
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  console.log(`Wrote real-source brief: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
