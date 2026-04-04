import type { BriefCategory } from "./sources";

const DEFAULT_FETCH_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function decodeHtml(text: string): string {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export function stripTags(text: string): string {
  return decodeHtml(text)
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function extractItems(xml: string) {
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return matches.map((match) => match[1]);
}

export function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : undefined;
}

export function extractRawTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : undefined;
}

export function cleanFetchedText(text: string): string {
  return text
    .replace(/SECURITY NOTICE:[\s\S]*?<<<EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>\nSource: Web Fetch\n---\n?/m, "")
    .replace(/<<<END_EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>/g, "")
    .trim();
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetchWithTimeout(url, {
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

export async function fetchReadableArticle(url: string): Promise<string | undefined> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "user-agent": "GuyDailyBrief/1.0 (+https://news.solomonsantos.me)",
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    }, 9000);

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

export function computeWhyItMatters(category: BriefCategory, summary: string): string {
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

export function normalizeDate(date?: string): string | undefined {
  if (!date) return undefined;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toISOString().slice(0, 10);
}
