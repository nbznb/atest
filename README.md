# Follow USTC

An AI-powered digest that tracks USTC official information, academic notices, selected technology news, and research-paper highlights, then turns them into concise summaries.

## What You Get

A daily or weekly digest with:

- USTC official news and notices
- Academic affairs and teaching-office announcements
- Selected technology news from public feeds
- Research paper highlights from public paper feeds
- Links to all original sources
- English, Chinese, or bilingual output

## Quick Start

1. Install the skill in your agent
2. Say "set up follow USTC"
3. The agent guides you through setup conversationally

No source API keys are required. Public content is fetched centrally.

## Architecture

- `config/default-sources.json` defines the tracked sources
- `scripts/generate-feed.js` fetches source content and writes feeds
- `scripts/prepare-digest.js` bundles feeds + prompts + config for the LLM
- `scripts/deliver.js` delivers the digest to stdout, Telegram, or email
- `prompts/` controls summary style

## Default Source Categories

- USTC official news and notices
- USTC academic affairs / teaching office updates
- Public technology news feeds
- Public research paper feeds

## Installation

### Claude Code
```bash
cd ~/.claude/skills/follow-USTC/scripts && npm install
```

## Requirements

- An AI agent (Claude Code or similar)
- Internet connection

## How It Works

1. A central feed is updated on a schedule from public sources
2. Your agent fetches the feed and your local config
3. The LLM remixes the raw items into a digest
4. The digest is shown in chat or delivered via your chosen channel

## License

MIT
