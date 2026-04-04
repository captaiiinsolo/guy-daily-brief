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

- Expand the full-text source mix for the tech section
- Improve ranking/deduping rules across sources
- Tune the scheduled publish time if you want the update to land earlier or later

## Scheduled publishing

This repo now supports automated daily publishing through GitHub Actions.

- Workflow: `.github/workflows/publish-daily-brief.yml`
- Schedule: `0 13 * 3-10 *` and `0 14 * 1,2,11,12 *` (targets 6:00 AM Los Angeles local time across daylight saving changes)
- Manual full run: GitHub Actions → **Publish Daily Brief** → **Run workflow**
- Manual single-section run: choose the `section` input (`us`, `world`, or `tech`) before running the workflow

The workflow can either:
- run `npm run publish` for a full daily refresh, or
- run `npm run refresh-section -- <section>` to regenerate only one section for today's brief

Afterward it validates the brief, commits any changed file in `content/briefs`, and pushes to `main`, which lets Cloudflare Pages deploy the updated dashboard.

## Shipping checklist

1. Push `guy-daily-brief` to GitHub
2. Create a Cloudflare Pages project and connect the repo
3. Attach `news.solomonsantos.me`
4. Verify production rendering and mobile layout
5. Confirm the GitHub Actions scheduled publish is enabled and succeeding
