declare const process: { env: Record<string, string | undefined> };
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listNgos from "./tools/list-ngos";
import listOrphanages from "./tools/list-orphanages";
import listOpenNeeds from "./tools/list-open-needs";

export default defineMcp({
  name: "rescue-nourish-mcp",
  title: "Rescue & Nourish",
  version: "0.1.0",
  instructions:
    "Directory tools for the Rescue & Nourish food donation platform. Use `list_ngos` to browse partner NGOs, `list_orphanages` to browse orphanages and their needs, and `list_open_needs` to see currently open help requests. Requires an authenticated Rescue & Nourish account.",
  auth: auth.oauth.issuer({
    issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    acceptedAudiences: "authenticated",
    resourceName: "Rescue & Nourish MCP",
  }),
  tools: [listNgos, listOrphanages, listOpenNeeds],
});
