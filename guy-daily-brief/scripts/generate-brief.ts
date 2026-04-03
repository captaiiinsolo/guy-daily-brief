import fs from "node:fs";
import path from "node:path";

type FeedSource = {
  category: "us" | "world" | "tech";
  sourceName: string;
  feedUrl: string;
  articleDomainHint: string;
  maxItems: number;
};

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

const sources: FeedSource[] = [
  {
    category: "us",
    sourceName: "NPR",
    feedUrl: "https://feeds.npr.org/1001/rss.xml",
    articleDomainHint: "npr.org",
    maxItems: 2,
  },
  {
    category: "world",
    sourceName: "NPR World",
    feedUrl: "https://feeds.npr.org/1004/rss.xml",
    articleDomainHint: "npr.org",
    maxItems: 2,
  },
  {
    category: "world",
    sourceName: "BBC World",
    feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    articleDomainHint: "bbc.com",
    maxItems: 1,
  },
];

function decodeHtml(text: string): string {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(text: string): string {
  return decodeHtml(text)
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractItems(xml: string) {
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return matches.map((match) => match[1]);
}

function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : undefined;
}

function extractRawTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : undefined;
}

function cleanFetchedText(text: string): string {
  return text
    .replace(/SECURITY NOTICE:[\s\S]*?<<<EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>\nSource: Web Fetch\n---\n?/m, "")
    .replace(/<<<END_EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>/g, "")
    .trim();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "GuyDailyBrief/1.0 (+https://news.solomonsantos.me)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }

  return await response.text();
}

async function fetchReadableArticle(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "GuyDailyBrief/1.0 (+https://news.solomonsantos.me)",
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) return undefined;
    const html = await response.text();

    const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const articleBodyMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => stripTags(match[1]))
      .filter((paragraph) => paragraph.length > 40)
      .filter((paragraph) => !paragraph.includes("hide caption"))
      .filter((paragraph) => !paragraph.includes("toggle caption"))
      .slice(0, 14);

    const combined = articleBodyMatches.join("\n\n").trim();

    if (combined.length > 300) return combined;
    if (ogDescription) return ogDescription;
    return combined || undefined;
  } catch {
    return undefined;
  }
}

function computeWhyItMatters(category: FeedSource["category"], summary: string): string {
  if (category === "us") {
    return "This landed in the US file because it points to a material change in policy, law, public safety, or the national operating environment.";
  }
  if (category === "world") {
    return "This matters because it affects the broader geopolitical picture, stability, trade, or diplomatic posture beyond a one-day headline cycle.";
  }
  if (/security|vulnerab|malware|advisory|cyber/i.test(summary)) {
    return "This belongs here because security and infrastructure changes tend to have longer practical consequences than product hype.";
  }
  return "This belongs here because it is more likely to affect the technical landscape than a routine product or hype story.";
}

function normalizeDate(date?: string): string | undefined {
  if (!date) return undefined;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toISOString().slice(0, 10);
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

  for (const source of sources) {
    const xml = cleanFetchedText(await fetchText(source.feedUrl));
    const items = extractItems(xml).slice(0, source.maxItems + 2);

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
      if (!extractedText || extractedText.length < 280) {
        extractedText = await fetchReadableArticle(url);
      }

      brief.sections[source.category].push({
        headline,
        summary,
        whyItMatters: computeWhyItMatters(source.category, summary),
        author,
        publishedAt,
        extractedText,
        source: {
          name: source.sourceName,
          url,
        },
      });
    }
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  console.log(`Wrote real-source brief: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
