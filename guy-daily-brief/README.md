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

- Replace placeholder content with real generated briefs
- Connect the repo to GitHub
- Deploy to Cloudflare Pages
- Add cron or a timer-based publish job
- Wire trusted source ingestion into `scripts/generate-brief.ts`
