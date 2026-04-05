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
    sourceName: "The Guardian US",
    feedUrl: "https://www.theguardian.com/us-news/rss",
    articleDomainHint: "theguardian.com",
    maxItems: 4,
  },
  {
    category: "us",
    sourceName: "CBS News US",
    feedUrl: "https://www.cbsnews.com/latest/rss/us",
    articleDomainHint: "cbsnews.com",
    maxItems: 2,
  },
  {
    category: "world",
    sourceName: "The Guardian World",
    feedUrl: "https://www.theguardian.com/world/rss",
    articleDomainHint: "theguardian.com",
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
    sourceName: "Ars Technica",
    feedUrl: "https://arstechnica.com/feed/",
    articleDomainHint: "arstechnica.com",
    maxItems: 3,
  },
  {
    category: "tech",
    sourceName: "NPR Technology",
    feedUrl: "https://feeds.npr.org/1019/rss.xml",
    articleDomainHint: "npr.org",
    maxItems: 1,
  },
];
