import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_workspace",
  title: "Get Intelligence workspace",
  description: "Show your SYAN Intelligence organisation, monitored keywords, competitors and priorities.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("intelligence_workspaces")
      .select("id, organisation_name, website, keywords, competitors, priorities")
      .eq("owner_id", ctx.getUserId()!)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No Intelligence workspace set up for this account yet." }] };
    const workspace = {
      id: data.id,
      organisation_name: data.organisation_name,
      website: data.website,
      keywords: data.keywords,
      competitors: data.competitors,
      priorities: data.priorities,
    };
    return { content: [{ type: "text", text: JSON.stringify(workspace) }], structuredContent: { workspace } };
  },
});
