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
- Public site content (case studies, articles, careers) comes from `cms_*` tables; contact enquiries are stored in `contact_messages` (anon insert, staff read) on top of the existing mailto handoff.
- Works (case studies) live only in `cms_case_studies`; public `/work` pages read them through server functions with the publishable key and filter `published AND NOT archived`; writes are admin-only via RLS. Cover images are stored as paths in the private `work-covers` bucket and served via signed URLs (public buckets are blocked in this workspace).
