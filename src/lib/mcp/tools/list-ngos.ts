declare const process: { env: Record<string, string | undefined> };
import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_ngos",
  title: "List NGOs",
  description: "List NGOs registered on the Rescue & Nourish platform (name, description, location, website).",
  inputSchema: {
    limit: z.number().int().min(1).max(200).default(50).describe("Maximum number of NGOs to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    const { data, error } = await supabase.rpc("mcp_list_ngos", { _limit: limit });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { ngos: data ?? [] },
    };
  },
});
