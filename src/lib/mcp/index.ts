import { defineMcp } from "@lovable.dev/mcp-js";
import listNgos from "./tools/list-ngos";
import listOrphanages from "./tools/list-orphanages";
import listOpenNeeds from "./tools/list-open-needs";

export default defineMcp({
  name: "rescue-nourish-mcp",
  title: "Rescue & Nourish",
  version: "0.1.0",
  instructions:
    "Public directory tools for the Rescue & Nourish food donation platform. Use `list_ngos` to browse partner NGOs, `list_orphanages` to browse orphanages and their needs, and `list_open_needs` to see currently open help requests.",
  tools: [listNgos, listOrphanages, listOpenNeeds],
});
