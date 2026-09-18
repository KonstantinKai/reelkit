---
title: AI / LLM Integration
url: https://reelkit.dev/docs/llms
section: Meta
order: 3
desc: Machine-readable docs for AI coding assistants — llms.txt, llms-full.txt, the Context7 manifest, and WebMCP tools.
---

# AI / LLM Integration

Machine-readable docs for AI coding assistants. Both `.txt` endpoints regenerate on every docs build; corpus tracks published site.

## Endpoints

| Endpoint                                                                         | Purpose                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`/llms.txt`](https://reelkit.dev/llms.txt)                                      | Indexed link list of every doc page. Drop into any LLM context.      |
| [`/llms-full.txt`](https://reelkit.dev/llms-full.txt)                            | Same index plus embedded per-page summaries. Full corpus, one fetch. |
| [`context7.com/websites/reelkit_dev`](https://context7.com/websites/reelkit_dev) | Live-indexed Context7 manifest. Plug in via `@context7` MCP server.  |

## Quick start

### Agent prompt

Paste endpoint URL into agent → answers grounded in current docs.

```text
reelkit.dev/llms-full.txt How do I wire vertical-feed gestures?
```

### Context7 MCP server

Install [@context7](https://github.com/upstash/context7) MCP server. Agent picks up ReelKit manifest automatically, fetches docs on demand. Mention `reelkit` in prompt.

### Direct ingestion

```bash
curl -s https://reelkit.dev/llms.txt
curl -s https://reelkit.dev/llms-full.txt
```

## In-browser agents (WebMCP)

Every reelkit.dev page registers [WebMCP](https://webmachinelearning.github.io/webmcp/) tools → agent running in the browser reads docs directly, no scraping.

| Tool          | Purpose                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `list_pages`  | Every docs page: title, URL, group.                                                             |
| `search_docs` | Site search by `query`; optional `locale`, `framework`. ≤ 20 results, section anchors included. |
| `get_page`    | One page as markdown — English text `llms-full.txt` holds for it.                               |
| `open_page`   | Opens page in current tab, in reader's language, optionally at a section.                       |

WebMCP = draft standard. reelkit.dev: works in Chrome 149–156 via origin trial; elsewhere Chrome needs `chrome://flags/#enable-webmcp-testing`. Browsers without it load nothing extra. Tools read public docs only — no cookies, no storage, no requests beyond the site.

## What gets indexed

- Getting started + Installation
- Core engine guide + API
- React, Vue, Angular bindings (guide + API + reel-player + lightbox + stories-player)
- Stories core engine
- SSR notes
- Troubleshooting
- Changelog

## Why

AI assistants lag behind library changes; generated code references stale APIs. Endpoints update with every doc release → suggestions match current behavior.
