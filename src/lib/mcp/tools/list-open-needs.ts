declare const process: { env: Record<string, string | undefined> };
import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_open_needs",
  title: "List open needs",
  description: "List open medical, clothing, and other needs posted by NGOs and orphanages that donors can help with.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).default(50).describe("Maximum number of open needs to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    const { data, error } = await supabase.rpc("mcp_list_open_needs", { _limit: limit });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { needs: data ?? [] },
    };
  },
});
