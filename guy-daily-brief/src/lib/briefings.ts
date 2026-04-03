import fs from "node:fs";
import path from "node:path";
import { briefSchema, type Brief } from "./schema";

const briefsDir = path.join(process.cwd(), "content", "briefs");

export function getAllBriefDates(): string[] {
  if (!fs.existsSync(briefsDir)) return [];

  return fs
    .readdirSync(briefsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort()
    .reverse();
}

export function getBriefByDate(date: string): Brief | null {
  const filePath = path.join(briefsDir, `${date}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return briefSchema.parse(parsed);
}

export function getLatestBrief(): Brief | null {
  const dates = getAllBriefDates();
  if (dates.length === 0) return null;
  return getBriefByDate(dates[0]);
}
