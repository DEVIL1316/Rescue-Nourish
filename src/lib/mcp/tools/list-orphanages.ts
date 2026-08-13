declare const process: { env: Record<string, string | undefined> };
import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_orphanages",
  title: "List orphanages",
  description: "List orphanages on the Rescue & Nourish platform with their current needs description.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).default(50).describe("Maximum number of orphanages to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const token = ctx?.getToken?.();
    if (!token) {
      return { content: [{ type: "text", text: "Authentication required." }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data, error } = await supabase.rpc("mcp_list_orphanages", { _limit: limit });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { orphanages: data ?? [] },
    };
  },
});
