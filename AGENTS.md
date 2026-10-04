<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- The authenticated area is split in two: `/admin` is the Website Content CMS (works, articles, careers, messages) and `/intelligence/*` is the SYAN Intelligence product (overview, mentions, topics, competitors, reports, ask, projects, integrations, users). Never merge their layouts or nav; both live under `src/routes/_authenticated/`.
- Public site content (case studies, articles, careers) comes from `cms_*` tables; contact enquiries are submitted through a validated server function (honeypot + timing spam checks) into `contact_messages`; no mailto submission.
- Works (case studies) live only in `cms_case_studies`; public `/work` pages read them through server functions with the publishable key and filter `published AND NOT archived`; writes require the matching permission via RLS. Cover images are stored as paths in the private `work-covers` bucket and served via signed URLs (public buckets are blocked in this workspace).
- Careers live only in `cms_careers`; public `/careers` and `/careers/$slug` read through server functions with the publishable key and show only `published AND NOT archived` rows whose closing date has not passed; writes require `careers.manage` via RLS.
- AI job-description drafting runs in an admin-checked server function calling Lovable AI Gateway (Responses API, streamed and consumed server-side); the key never reaches the browser.

- Website CMS access is permission-based: `staff_members` + `staff_permissions` with `has_permission()` (owners in `user_roles` admin hold all) enforced in RLS on every `cms_*` table, `contact_messages` and the cover bucket; the admin nav and `RequirePermission` only mirror it. Staff access starts only from a `staff_invitations` row (created by settings.manage-checked server functions); `accept_staff_invitation()` converts it into staff rows when that verified email signs in. Clients have no write grants on staff/role tables and cannot self-claim admin.
- Articles (public "Insights") live only in `cms_articles`; public pages read through publishable-key server functions showing `published AND NOT archived` with a publish date not in the future. Covers reuse the private `work-covers` bucket under `articles/`.
- `/admin/*` access is resolved once in the admin layout's `beforeLoad` (via `my_permissions()`) after the `_authenticated` session gate; users with no permissions get a no-access screen with no CMS chrome. There is no self-service sign-up in the UI.
- Intelligence client workspaces live in `intelligence_workspaces` (one per owner, owner-only RLS); users without a staff role and no workspace are redirected to `/intelligence-setup`.
- Monitored mentions live in `intelligence_mentions` (per workspace); clients only read (owner or staff via RLS) and rows are written only by the `refreshMentions` server function (news search via the Firecrawl connector, sentiment/topic/relevance labelled by Lovable AI; reach left null when the source gives none) — never seeded.
- The MCP server (src/lib/mcp/, mounted at /mcp) uses the app's sign-in as an OAuth server; tools query as the signed-in user so RLS applies — never a service-role client.
