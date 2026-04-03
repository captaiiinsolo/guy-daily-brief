export type BriefCategory = "us" | "world" | "tech";

export type FeedSource = {
  category: BriefCategory;
  sourceName: string;
  feedUrl: string;
  articleDomainHint: string;
  maxItems: number;
};

export const feedSources: FeedSource[] = [
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
  {
    category: "tech",
    sourceName: "CISA",
    feedUrl: "https://www.cisa.gov/news-events/cybersecurity-advisories",
    articleDomainHint: "cisa.gov",
    maxItems: 1,
  },
];
