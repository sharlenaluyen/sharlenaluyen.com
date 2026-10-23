# Clippy portfolio agent

A Clippy-themed chat assistant for sharlenaluyen.com. Visitors ask questions about me, and Clippy answers from a knowledge file instead of from the model's memory.

**Live at:** `https://clippy-agent.sharlenatluyen.workers.dev/chat` (try it on [posthog.html](../posthog.html))

## How it works

This is a simple form of **RAG (retrieval-augmented generation)**: the model's answer is grounded in text I supply.

1. The browser widget ([../js/clippy-agent.js](../js/clippy-agent.js)) sends the visitor's question to this Worker.
2. The Worker ([src/index.ts](src/index.ts)) puts the whole of [sharlena-knowledge.txt](sharlena-knowledge.txt) into the system prompt, together with rules ("answer only from the knowledge, say you don't know otherwise").
3. It calls the Anthropic API (`claude-haiku-5-5`) and returns the reply.

The Anthropic API key is a Worker secret, so it never reaches the browser. The retrieval step is the simplest possible one: the file is small enough to include in full on every request, so there is no vector search or chunking. If the file grows large, that is the point to add real retrieval. The knowledge block is marked cacheable, which makes repeat requests cheaper.

## Requests and responses

Cross-origin requests must come from an allowed origin (see [Using it on other pages](#using-it-on-other-pages)).

| Request | Response |
|---|---|
| Any path other than `/chat`, or any method other than `POST` and `OPTIONS` (e.g. opening the URL in a browser) | `404`, `{"error":"POST /chat"}` |
| `OPTIONS /chat` (browser preflight) | `204`, no body, with CORS headers |
| `POST /chat` with a missing or disallowed `Origin` header (e.g. plain curl) | `403`, `{"error":"Forbidden"}` |
| `POST /chat` from an allowed origin with an invalid body (no messages, empty text, or not starting and ending with a user message) | `400`, `{"error":"Send {messages:[{role,content}]} ending with a user message."}` |
| `POST /chat` from an allowed origin with a valid body | `200`, `{"reply":"..."}` |
| Valid request, but the Anthropic call fails (bad key, outage, rate limit) | `502`, `{"error":"Clippy is taking a break. Try again in a moment."}` |

Limits: only the last 10 messages are used, each cut to 500 characters, and replies are capped at 400 tokens.

A working request:
```
curl -X POST https://clippy-agent.sharlenatluyen.workers.dev/chat \
  -H 'origin: https://sharlenaluyen.com' -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"What does she do at HashiCorp?"}]}'
```

## Deploy the Worker

```
cd clippy_agent
npm install
npx wrangler secret put ANTHROPIC_KEY_CLIPPY   # paste only the key, no quotes or prefix
npm run deploy
```

- **Secret name:** the secret must be named exactly `ANTHROPIC_KEY_CLIPPY`, because that is what [src/index.ts](src/index.ts) reads. Check what is set with `npx wrangler secret list`.
- **Workspace:** the API key should be created inside an Anthropic workspace. If it isn't, uncomment the `[vars]` block in [wrangler.toml](wrangler.toml) and set `ANTHROPIC_WORKSPACE_ID` to the workspace ID, then redeploy.
- **Updating Clippy's knowledge:** edit [sharlena-knowledge.txt](sharlena-knowledge.txt) and run `npm run deploy` again. Keep it true and public: Clippy will repeat anything in it.

### Run it locally

1. Put `ANTHROPIC_KEY_CLIPPY=...` in `clippy_agent/.dev.vars` (gitignored).
2. Run `npm run dev` in `clippy_agent`.
3. From the repo root, serve the site with `python3 -m http.server 8000`, and open `http://localhost:8000/posthog.html`.

`localhost:8000` is in the allowed origins. The widget talks to the deployed Worker unless you set `window.CLIPPY_ENDPOINT` to your local `wrangler dev` URL.

## Using it on other pages

Add this to any page, just before `</body>`:

```html
<script src="/js/clippy-agent.js" defer></script>
```

- On a page that already has the posthog.html Clippy (`#clippyChar`), clicking him opens the chat. On any other page the script draws its own small Clippy in the bottom-right.
- For a page on **another domain**, use the full script URL (`https://sharlenaluyen.com/js/clippy-agent.js`) and add that domain to `ALLOWED_ORIGINS` in [src/index.ts](src/index.ts), then redeploy. Otherwise the Worker returns `403`.
- To point the widget at a different Worker URL, set `window.CLIPPY_ENDPOINT = "https://.../chat"` before the script loads.
- To change the suggested questions, edit `SUGGESTIONS` at the top of the script.

## Troubleshooting

If the chat panel says "Clippy is taking a break," the Worker's call to Anthropic failed. Run `npx wrangler tail` in `clippy_agent`, ask Clippy again, and read the error:

| Error in the logs | Cause and fix |
|---|---|
| `401 invalid x-api-key` | The secret is missing, misnamed, or the key is bad. Run `npx wrangler secret list` and confirm the name is `ANTHROPIC_KEY_CLIPPY`; re-set it with `npx wrangler secret put ANTHROPIC_KEY_CLIPPY`. |
| `400 … not scoped to a workspace … anthropic-workspace-id` | Create the key inside a workspace, or set `ANTHROPIC_WORKSPACE_ID` (see [Deploy the Worker](#deploy-the-worker)). |
| Browser console shows a CORS error or the Worker returns `403` | The page's origin isn't in `ALLOWED_ORIGINS`. |
| Nothing changes after an edit | Redeploy with `npm run deploy` and hard refresh (Cmd+Shift+R). Secret changes apply immediately, but code changes don't. |

## Cost abuse caveat

**Anyone can spend my Anthropic credits through this endpoint.** There is no login, and the origin allowlist only stops *other websites* from calling it from a browser. A script or curl can send any `Origin` header it likes, so it is not a security boundary.

What limits the damage today:
- Each request is capped at 10 messages, 500 characters per message, and 400 output tokens, and it uses a small, cheap model.
- I've set a spend limit on my Anthropic account.

What is still missing is a limit on how many requests one person can send. I'm considering a Cloudflare rate-limiting rule on the Worker's `/chat` route, or Turnstile (a bot challenge) in front of it.
