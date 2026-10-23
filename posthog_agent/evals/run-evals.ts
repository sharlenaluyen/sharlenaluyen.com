/**
 * Run eval cases against a deployed (or local) MCP server.
 *
 *   npm run evals -- [URL]            default https://mcp.sharlenaluyen.com/mcp
 *   npm run evals -- [URL] --select   also check that Claude picks expected_tool from the
 *                                     tool descriptions alone (needs ANTHROPIC_API_KEY)
 *
 * Check 1: call expected_tool with expected_tool_args; the response must not be an error
 *          and must contain every must_mention string.
 * Check 2 (--select): tests the tool descriptions, i.e. "docs written for a machine".
 */
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

interface EvalCase {
  query: string;
  expected_tool: string;
  expected_tool_args: Record<string, unknown>;
  must_mention: string[];
}

const args = process.argv.slice(2);
const select = args.includes("--select");
const url = args.find((a) => !a.startsWith("--")) ?? "https://posthog-mcp.sharlenatluyen.workers.dev/mcp";
const cases: EvalCase[] = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf8"));

type Tool = { name: string; description?: string; inputSchema: unknown };

async function pickTool(tools: Tool[], query: string): Promise<string | undefined> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-5-5",
      max_tokens: 256,
      tools: tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.inputSchema })),
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: query }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { content: { type: string; name?: string }[] };
  return body.content.find((b) => b.type === "tool_use")?.name;
}

const client = new Client({ name: "evals", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(url)));
const tools = (await client.listTools()).tools;
const names = new Set(tools.map((t) => t.name));

let failures = 0;
for (const c of cases) {
  const problems: string[] = [];
  if (!names.has(c.expected_tool)) {
    problems.push(`tool '${c.expected_tool}' not exposed`);
  } else {
    const result = await client.callTool({ name: c.expected_tool, arguments: c.expected_tool_args });
    const text = ((result.content as { type: string; text?: string }[]) ?? []).map((x) => x.text ?? "").join("\n");
    if (result.isError) problems.push(`tool error: ${text.slice(0, 120)}`);
    for (const needle of c.must_mention) {
      if (!text.toLowerCase().includes(needle.toLowerCase())) problems.push(`missing '${needle}'`);
    }
  }
  if (select) {
    const chosen = await pickTool(tools, c.query);
    if (chosen !== c.expected_tool) problems.push(`model chose '${chosen}', expected '${c.expected_tool}'`);
  }
  if (problems.length) failures++;
  console.log(`[${problems.length ? "FAIL" : "PASS"}] ${c.query}`);
  for (const p of problems) console.log(`       - ${p}`);
}

await client.close();
console.log(`\n${cases.length - failures}/${cases.length} passed`);
process.exit(failures ? 1 : 0);
