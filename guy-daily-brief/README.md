# Guy Daily Brief

A mobile-first, monochrome daily news dashboard built with Next.js and Tailwind.

## Current v1

- Today page
- Archive page
- Dated briefing pages
- JSON-backed content files
- Editorial-style dark UI with stronger hierarchy
- Generator + validator script stubs

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Validate content

```bash
npm run validate
```

## Generate a placeholder brief

```bash
npm run generate
```

## Content

Daily briefs live in:

```bash
content/briefs/YYYY-MM-DD.json
```

## Suggested next steps

- Connect the repo to GitHub
- Deploy to Cloudflare Pages
- Add cron or a timer-based publish job
- Expand the full-text source mix for the tech section
- Improve ranking/deduping rules across sources

## Shipping checklist

1. Push `guy-daily-brief` to GitHub
2. Create a Cloudflare Pages project and connect the repo
3. Attach `news.solomonsantos.me`
4. Verify production rendering and mobile layout
5. Add a scheduled `npm run publish` job on the source machine if local generation remains the source of truth
