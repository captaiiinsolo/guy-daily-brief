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
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…");
}

export function stripTags(text: string): string {
  return decodeHtml(text)
    .replace(/<img[^>]*>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6]|li)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
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

function normalizeParagraph(paragraph: string): string {
  return paragraph
    .replace(/\s+/g, " ")
    .replace(/^\s*[•·-]\s*/g, "")
    .trim();
}

function isBoilerplateParagraph(paragraph: string): boolean {
  return (
    paragraph.length < 40 ||
    /hide caption|toggle caption|copyright|all rights reserved|newsletter|sign up|advertisement|supported by|listen\s*·|read more|follow us/i.test(paragraph)
  );
}

function extractMetaContent(html: string, key: string, attr: "property" | "name" = "property"): string | undefined {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<meta[^>]+${attr}=["']${escapedKey}["'][^>]+content=["']([\\s\\S]*?)["'][^>]*>`, "i");
  return regex.exec(html)?.[1] ? decodeHtml(regex.exec(html)?.[1] ?? "").trim() : undefined;
}

function extractJsonLdArticleBody(html: string): string | undefined {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const script of scripts) {
    const raw = script[1]?.trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const candidate of candidates) {
        const graph = candidate?.["@graph"];
        const nodes = Array.isArray(graph) ? graph : [candidate, ...(Array.isArray(graph) ? graph : [])];

        for (const node of nodes) {
          const articleBody = node?.articleBody;
          if (typeof articleBody === "string") {
            const cleaned = normalizeParagraph(stripTags(articleBody));
            if (cleaned.length > 300) return cleaned;
          }

          const description = node?.description;
          if (typeof description === "string") {
            const cleaned = normalizeParagraph(stripTags(description));
            if (cleaned.length > 300) return cleaned;
          }
        }
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

export async function fetchReadableArticle(url: string): Promise<string | undefined> {
  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          "user-agent": "GuyDailyBrief/1.0 (+https://news.solomonsantos.me)",
          accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
      },
      9000,
    );

    if (!response.ok) return undefined;
    const html = await response.text();

    const jsonLdBody = extractJsonLdArticleBody(html);
    if (jsonLdBody) return jsonLdBody;

    const metaDescription =
      extractMetaContent(html, "og:description") ??
      extractMetaContent(html, "twitter:description", "name") ??
      extractMetaContent(html, "description", "name");

    const articleBodyMatches = [...html.matchAll(/<(article|main|section|div)[^>]*>([\s\S]*?)<\/\1>/gi)]
      .flatMap((match) => [...match[2].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)])
      .map((match) => normalizeParagraph(stripTags(match[1])))
      .filter((paragraph) => !isBoilerplateParagraph(paragraph));

    const fallbackParagraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => normalizeParagraph(stripTags(match[1])))
      .filter((paragraph) => !isBoilerplateParagraph(paragraph));

    const paragraphs = (articleBodyMatches.length >= 3 ? articleBodyMatches : fallbackParagraphs)
      .filter((paragraph, index, array) => array.indexOf(paragraph) === index)
      .slice(0, 18);

    const combined = paragraphs.join("\n\n").trim();

    if (combined.length > 500) return combined;
    if (combined.length > 220 && metaDescription && !combined.includes(metaDescription)) {
      return `${metaDescription}\n\n${combined}`.trim();
    }
    if (combined.length > 220) return combined;
    if (metaDescription) return metaDescription;
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
