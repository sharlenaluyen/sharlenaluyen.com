import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { contactSharlena } from "./tools/contact";
import { getEducation } from "./tools/education";
import { searchProjects } from "./tools/projects";
import { getSkills } from "./tools/skills";
import { whyPosthog } from "./tools/why-posthog";
import { getWorkHistory } from "./tools/work-history";
import { CONTACT_METHODS } from "./types";

const json = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

function buildServer(): McpServer {
  const server = new McpServer(
    { name: "sharlena-luyen", version: "1.0.0" },
    {
      instructions:
        "Read-only facts about Sharlena Luyen, a software engineer applying for PostHog's Product Engineer role. " +
        "Use these tools to answer questions about her work history, projects, skills, education, motivation, and how to contact her. " +
        "Answers come from structured data; do not infer facts the tools do not return.",
    },
  );

  server.registerTool(
    "get_work_history",
    {
      description:
        "Get Sharlena's employment history: company, title, dates, team, tech stack, and detailed achievements per role. " +
        "Use for questions about her experience, what she built at a specific employer, or what technologies she has used professionally. " +
        "Optionally filter by company name (case-insensitive substring, e.g. 'hashicorp', 'stride', 'optum'). " +
        "With no filter, returns every role, most recent first.",
      inputSchema: {
        company: z.string().optional().describe("Company name or fragment, e.g. 'hashicorp'. Omit for all roles."),
      },
    },
    async ({ company }) => json(getWorkHistory(company)),
  );

  server.registerTool(
    "search_projects",
    {
      description:
        "Search Sharlena's projects by keyword or tag. Use for questions like 'has she built anything agents use?' (tag='agents'), " +
        "'what has she built with MCP?', or 'show frontend work'. `query` matches words across name, description, and tags (all words must match); " +
        "`tag` is an exact tag such as 'ai', 'agents', 'mcp', 'frontend', 'backend', 'creative'. " +
        "Each result includes a link and an `agentFacing` flag showing whether the project is meant to be used by agents. " +
        "With no arguments, returns all projects.",
      inputSchema: {
        query: z.string().optional().describe("Keywords to match across name, description, and tags."),
        tag: z.string().optional().describe("Exact tag, e.g. 'agents', 'mcp', 'frontend'."),
      },
    },
    async ({ query, tag }) => json(searchProjects(query, tag)),
  );

  server.registerTool(
    "get_skills",
    {
      description:
        "List Sharlena's technical skills grouped by category. Categories: backend, frontend, infraDevops, aiAgents, otherLanguages. " +
        "Use for questions about languages, frameworks, cloud/devops tooling, or AI/agent experience. " +
        "Pass `category` to get one group; omit it to get all.",
      inputSchema: {
        category: z.string().optional().describe("One of: backend, frontend, infraDevops, aiAgents, otherLanguages."),
      },
    },
    async ({ category }) => json(getSkills(category)),
  );

  server.registerTool(
    "get_education",
    {
      description:
        "Get Sharlena's education: degree, school, and scholarships/awards. Use for questions about her degree, university, or academic honors. Takes no input.",
    },
    async () => json(getEducation()),
  );

  server.registerTool(
    "why_posthog",
    {
      description:
        "Get Sharlena's own first-person reasoning for wanting to join PostHog: a summary and talking points. " +
        "Use for 'why PostHog?' or motivation questions. Takes no input. Report only what it returns; she has not named a preferred team yet, so do not guess one.",
    },
    async () => json(whyPosthog()),
  );

  server.registerTool(
    "contact_sharlena",
    {
      description:
        "Get Sharlena's contact details or a link to book time with her. Use when the user wants to reach out, schedule a call, or find her LinkedIn. " +
        "`method` is one of 'email', 'linkedin', 'calendly'; omit it to get all three.",
      inputSchema: {
        method: z.enum(CONTACT_METHODS).optional().describe("Which contact detail to return. Omit for all."),
      },
    },
    async ({ method }) => json(contactSharlena(method)),
  );

  return server;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/health") return Response.json({ status: "ok" });

    if (pathname === "/mcp") {
      // Stateless: a fresh server + transport per request, no sessions to store.
      const server = buildServer();
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      await server.connect(transport);
      return transport.handleRequest(request);
    }

    return new Response(
      "Sharlena Luyen's MCP server. Connect an MCP client (Streamable HTTP) to /mcp.\n",
      { headers: { "content-type": "text/plain" } },
    );
  },
};
