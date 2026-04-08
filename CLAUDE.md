# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This repo is a skill/package for generating an "AI Technology Digest". It has two distinct runtimes:

1. **Central feed generation**: `scripts/generate-feed.js` runs in GitHub Actions and refreshes the committed feed snapshots in the repo root (`feed-x.json`, `feed-podcasts.json`, `feed-blogs.json`) plus dedup state in `state-feed.json`.
2. **User-side digest preparation and delivery**: the installed skill runs `scripts/prepare-digest.js` to fetch the latest committed feeds/prompts and merge them with the user's local config, then an LLM remixes that JSON into digest text, and `scripts/deliver.js` sends it to stdout / Telegram / email.

The repo is not a conventional app with a build step. The main artifacts are Node scripts, prompt templates, source definitions, and committed feed JSON.

## Common commands

Run all commands from `scripts/` unless noted otherwise.

### Install dependencies
```bash
cd scripts && npm install
```

### Generate central feeds locally
```bash
cd scripts && node generate-feed.js
```

Requires:
- `X_BEARER_TOKEN`
- `POD2TXT_API_KEY`

Useful partial runs:
```bash
cd scripts && node generate-feed.js --tweets-only
cd scripts && node generate-feed.js --podcasts-only
cd scripts && node generate-feed.js --blogs-only
```

### Prepare the LLM input blob
```bash
cd scripts && node prepare-digest.js
```

This reads `~/.follow-builders/config.json`, fetches the published feeds/prompts, and prints one JSON blob to stdout for the model to consume.

### Deliver a digest
```bash
echo "digest text" | node scripts/deliver.js
node scripts/deliver.js --message "digest text"
node scripts/deliver.js --file /absolute/path/to/digest.txt
```

`deliver.js` reads delivery settings from `~/.follow-builders/config.json` and secrets from `~/.follow-builders/.env`.

### Reproduce the GitHub Action locally
```bash
cd scripts && npm install && node generate-feed.js
```

The scheduled workflow itself is in `.github/workflows/generate-feed.yml`.

### Tests / lint / build

There is currently **no dedicated test suite, lint command, or build command** configured in this repo.
- `scripts/package.json` only defines `generate-feed` and `prepare-digest`.
- There is no single-test command because no test runner is configured.

When changing behavior, validate by running the relevant script directly and inspecting the generated JSON / delivery behavior.

## High-level architecture

### 1. Feed generation pipeline

`scripts/generate-feed.js` is the central aggregator. It:
- loads tracked sources from `config/default-sources.json`
- fetches X posts from tracked technology/news sources via the X API
- fetches podcast episodes from RSS feeds and transcripts from pod2txt
- scrapes Anthropic Engineering and Claude Blog articles
- deduplicates against `state-feed.json`
- writes fresh feed snapshots back to the repo root

Important implementation detail: dedup state is intentionally committed in-repo (`state-feed.json`) so GitHub Actions can avoid repeating content across runs.

### 2. Digest preparation for the LLM

`scripts/prepare-digest.js` is the deterministic preprocessor. It does **all non-LLM fetching** and emits a single JSON object containing:
- user preferences from `~/.follow-builders/config.json`
- the latest published feeds from GitHub raw URLs
- prompt text
- summary stats
- non-fatal fetch/load errors

Prompt loading priority is:
1. user override in `~/.follow-builders/prompts/`
2. latest prompt file from GitHub raw
3. local prompt file shipped in this repo

That priority is important: local prompt edits in this repo are only the final fallback once installed, unless the installed copy is also the one being fetched locally.

### 3. LLM boundary

The intended contract is: `prepare-digest.js` gathers data; the model only remixes that JSON into readable digest text by following the prompt templates in `prompts/`.

If you change summary behavior, prefer editing the prompt files rather than adding more logic to the scripts.

### 4. Delivery boundary

`scripts/deliver.js` is intentionally small and transport-focused:
- `stdout` for in-chat / terminal delivery
- Telegram Bot API delivery
- Resend email delivery

It does not generate summaries; it only transports already-generated digest text.

### 5. Skill/onboarding layer

`SKILL.md` contains the agent-facing workflow for onboarding, scheduling, delivery setup, and digest generation. Treat it as product behavior/spec guidance, not just prose documentation.

## Important files

- `scripts/generate-feed.js` — central feed generation and dedup pipeline
- `scripts/prepare-digest.js` — deterministic digest-prep step for the LLM
- `scripts/deliver.js` — stdout / Telegram / email delivery
- `config/default-sources.json` — curated source list for podcasts, blogs, and tracked X sources
- `config/config-schema.json` — shape of `~/.follow-builders/config.json`
- `prompts/*.md` — prompt templates that control summarization/tone/translation
- `.github/workflows/generate-feed.yml` — daily feed refresh job
- `examples/sample-digest.md` — canonical example of output shape/tone

## Repository-specific notes

- User state lives outside the repo in `~/.follow-builders/` (`config.json`, `.env`, and optional prompt overrides). Repo changes alone do not fully represent runtime behavior.
- The committed `feed-*.json` files are generated artifacts consumed by installed clients. Be careful when editing them manually.
- Blog scraping logic is source-specific: Anthropic Engineering parsing assumes Next.js data / `/engineering/<slug>` patterns, while Claude Blog parsing assumes Webflow-like `/blog/<slug>` pages.
- `config/default-sources.json` now uses neutral tracked-source naming for X (`x_sources`) rather than person-centric builder naming.
- USTC-style official sources can be added safely only when they fit the current source model cleanly (e.g. compatible X accounts, or other already-supported source types). Arbitrary new official sites will require new parsing logic.
