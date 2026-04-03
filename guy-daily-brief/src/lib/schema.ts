import { z } from "zod";

export const storySchema = z.object({
  headline: z.string(),
  summary: z.string(),
  whyItMatters: z.string(),
  source: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
});

export const briefSchema = z.object({
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  sections: z.object({
    us: z.array(storySchema),
    world: z.array(storySchema),
    tech: z.array(storySchema),
  }),
  watchlist: z.array(z.string()),
});

export type Story = z.infer<typeof storySchema>;
export type Brief = z.infer<typeof briefSchema>;
