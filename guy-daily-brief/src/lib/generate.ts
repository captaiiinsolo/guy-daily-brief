import fs from "node:fs";
import path from "node:path";
import {
  cleanFetchedText,
  computeWhyItMatters,
  extractItems,
  extractRawTag,
  extractTag,
  fetchReadableArticle,
  fetchText,
  normalizeDate,
  stripTags,
} from "./ingest";
import { feedSources, type BriefCategory } from "./sources";
import type { Brief, Story } from "./schema";

const briefsDir = path.join(process.cwd(), "content", "briefs");

function dedupeStories(stories: Story[]) {
  const seen = new Set<string>();
  return stories.filter((story) => {
    const key = `${story.headline.toLowerCase()}|${story.source.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function generateStoriesForCategory(category: BriefCategory): Promise<Story[]> {
  const categorySources = feedSources.filter((source) => source.category === category);
  const stories: Story[] = [];

  for (const source of categorySources) {
    if (!source.feedUrl.endsWith(".xml")) continue;

    const xml = cleanFetchedText(await fetchText(source.feedUrl));
    const items = extractItems(xml).slice(0, source.maxItems + 3);

    for (const item of items) {
      const headline = extractTag(item, "title");
      const summary = extractTag(item, "description");
      const url = extractTag(item, "link");
      const author = extractTag(item, "dc:creator");
      const publishedAt = normalizeDate(extractTag(item, "pubDate"));
      const encoded = extractRawTag(item, "content:encoded");

      if (!headline || !summary || !url) continue;

      let extractedText = encoded ? stripTags(encoded) : undefined;
      if (!extractedText || extractedText.length < 280) {
        extractedText = await fetchReadableArticle(url);
      }

      stories.push({
        headline,
        summary,
        whyItMatters: computeWhyItMatters(category, summary),
        author,
        publishedAt,
        extractedText,
        source: {
          name: source.sourceName,
          url,
        },
      });

      if (stories.length >= categorySources.reduce((sum, item) => sum + item.maxItems, 0)) {
        break;
      }
    }

    if (stories.length >= categorySources.reduce((sum, item) => sum + item.maxItems, 0)) {
      break;
    }
  }

  const maxItems = categorySources.reduce((sum, item) => sum + item.maxItems, 0);
  const deduped = dedupeStories(stories).slice(0, maxItems);

  if (category === "tech" && deduped.length === 0) {
    deduped.push({
      headline: "CISA alert and advisory categories remain the core of the security feed",
      summary:
        "CISA's alert, advisory, and malware analysis tracks remain the cleanest official source for high-priority cyber issues that deserve a place in the dashboard.",
      whyItMatters:
        "This belongs here because security and infrastructure changes tend to have longer practical consequences than product hype.",
      publishedAt: new Date().toISOString().slice(0, 10),
      extractedText:
        "CISA uses alerts for recent, ongoing, or high-impact cyber threats, advisories for deeper technical guidance on tactics and mitigations, and malware analysis reports for detailed behavior and detection information. For the dashboard, this matters because it gives the tech file an official, high-signal backbone instead of relying on hype-heavy product coverage.",
      source: {
        name: "CISA",
        url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
      },
    });
  }

  return deduped;
}

export async function generateBrief(date = new Date().toISOString().slice(0, 10)): Promise<Brief> {
  fs.mkdirSync(briefsDir, { recursive: true });

  const brief: Brief = {
    date,
    title: "Guy Daily Brief",
    summary:
      "A concise editorial-style briefing with readable source text pulled into the dashboard so the dashboard itself becomes the reading surface.",
    sections: {
      us: await generateStoriesForCategory("us"),
      world: await generateStoriesForCategory("world"),
      tech: await generateStoriesForCategory("tech"),
    },
    watchlist: [
      "Any major story that gains a concrete second-day update",
      "New security advisories significant enough to replace a lower-signal tech item",
      "Developments that materially change markets, policy, or conflict trajectories",
    ],
  };

  return brief;
}

export async function refreshBriefSection(category: BriefCategory, date = new Date().toISOString().slice(0, 10)): Promise<Brief> {
  fs.mkdirSync(briefsDir, { recursive: true });

  const outputPath = path.join(briefsDir, `${date}.json`);
  const existing = fs.existsSync(outputPath)
    ? (JSON.parse(fs.readFileSync(outputPath, "utf8")) as Brief)
    : await generateBrief(date);

  existing.sections[category] = await generateStoriesForCategory(category);
  existing.date = date;

  fs.writeFileSync(outputPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
  return existing;
}

export function writeBrief(brief: Brief) {
  fs.mkdirSync(briefsDir, { recursive: true });
  const outputPath = path.join(briefsDir, `${brief.date}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  return outputPath;
}
