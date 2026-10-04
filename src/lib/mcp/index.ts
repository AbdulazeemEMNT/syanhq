import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getWorkspaceTool from "./tools/get-workspace";
import listMentionsTool from "./tools/list-mentions";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "syan-media-studio",
  title: "Syan Media Studio",
  version: "0.1.0",
  instructions:
    "SYAN Intelligence tools. Use `get_workspace` to see the organisation being monitored and `list_mentions` to read real monitored media mentions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getWorkspaceTool, listMentionsTool],
});
