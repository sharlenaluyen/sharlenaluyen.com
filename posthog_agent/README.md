# Sharlena Luyen MCP server

A read-only remote MCP server (Streamable HTTP, Typescript, Cloudflare Workers) that exposes Sharlena's work history, projects, skills, education, and contact info as tools, so an agent can ask about her candidacy directly. Built for the PostHog Product Engineer application.

Endpoint: `https://posthog-mcp.sharlenatluyen.workers.dev/mcp` (health check: `/health`)

Custom domain (`mcp.sharlenaluyen.com`) isn't set up because `sharlenaluyen.com` DNS lives at Namecheap, and Worker custom domains need the zone on Cloudflare. A small logistical oversight; all of my other sites are on Cloudflare.

## Tools
| Tool | Input | Purpose |
|---|---|---|
| `get_work_history` | `company?` | Roles, stack, achievements |
| `search_projects` | `query?`, `tag?` | Projects, with an `agentFacing` flag |
| `get_skills` | `category?` | Skills by category |
| `get_education` | none | Degree and awards |
| `why_posthog` | none | Her own reasoning for PostHog |
| `contact_sharlena` | `method?` | email / phone / linkedin / calendly |

The server is stateless: each request builds a fresh MCP server and transport, so there are no sessions or storage to manage. Data lives in [data/](data/) as JSON, imported at build time.

## What to expect from each URL
This is an MCP server, not a web page. A browser or a bare `curl` will mostly show plain text or an error; use an MCP client for real queries.

| Request | Response |
|---|---|
| `curl https://posthog-mcp.sharlenatluyen.workers.dev/` | `200`, a plain text line: "Sharlena Luyen's MCP server. Connect an MCP client (Streamable HTTP) to /mcp." |
| `curl https://posthog-mcp.sharlenatluyen.workers.dev/health` | `200`, `{"status":"ok"}` |
| `curl https://posthog-mcp.sharlenatluyen.workers.dev/mcp` (browser or plain GET) | `406`, "Not Acceptable: Client must accept text/event-stream". This is expected: the endpoint only speaks the MCP protocol. |
| `curl -X POST https://posthog-mcp.sharlenatluyen.workers.dev/mcp` with the headers and body below | `200`, JSON-RPC result (here, the list of tools) |

```
curl -X POST https://posthog-mcp.sharlenatluyen.workers.dev/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Run locally
```
npm install
npm run dev                          # http://localhost:8787/mcp
npx @modelcontextprotocol/inspector  # connect with Streamable HTTP to the URL above
npm run typecheck
```

## Evals
```
npm run evals -- http://localhost:8787/mcp   # omit the URL to hit the deployed Worker
ANTHROPIC_API_KEY=... npm run evals -- --select   # also checks tool selection from the descriptions
```

## Deploy
1. `npx wrangler login`, then `npm run deploy`.
2. Run the evals against the live URL.

## Connect it
Claude Desktop / Claude Code: add a remote MCP server with URL `https://posthog-mcp.sharlenatluyen.workers.dev/mcp`.
