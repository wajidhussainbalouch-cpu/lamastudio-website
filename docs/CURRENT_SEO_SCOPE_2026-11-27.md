# LAMA Studio — Current SEO Scope (27 November 2026)

This document defines the maintained *public-facing* site scope. It is not a request to restore retired categories.

## Actively maintained public categories
- Tech — `/categories/tech/`
- Developer Tools — `/categories/developer-tools/`
- Productivity — `/categories/productivity/`
- Network & Security — `/categories/network-security/`
- Education — `/categories/education/`

Public business/product landing pages also include the homepage, School Suite homepage, PPSC Academy homepage, six current app showcase pages, five category blogs, Learn With Fun, and the live school-software solution and attendance guide. The Vercel build generates a sitemap from allowlisted existing HTML pages; the November 27 production build reported **81 public sitemap URLs**.

## Permanently retired category families
`/categories/business/`, `/categories/travel/`, `/categories/sports/`, `/categories/fashion/`, `/categories/news/`, `/categories/weather/`, `/categories/health/`, and matching deleted category blog files.

These are absent from the repository and must **not** be re-created, added to the sitemap, linked from public navigation, or redirected to unrelated pages merely to clear Google Search Console errors. Existing `404 Not Found` or deliberate `410 Gone` responses are correct when no genuinely equivalent replacement exists. Keep them crawlable (do not disallow their paths in `robots.txt`) so Google can observe their removal. Search Console may continue showing historical 404 URLs even after they are out of Google's search index.

**Important distinction:** The deleted Weather category does not mean the separate **LamaSky weather app** is deleted; the deleted Business category does not imply that the separately hosted LAMA Bazaar business is deleted.

## URLs with replacements
Explicit permanently redirected legacy routes in `vercel.json` are preserved only when a closely equivalent live target exists. Do not blanket redirect deleted categories to the homepage.

## Search Console operations
- Focus Page Indexing and URL Inspection on current public sitemap URLs.
- Check the sitemap at `https://www.lamastudio.pk/sitemap.xml` and submit that path to the verified Domain property once if not submitted.
- For retired 404/410 pages, no "Validate Fix" action is required; removal is the intended behavior.
- A Search Console Removals request is optional if a removed page still visibly appears in Google Search and needs immediate temporary hiding; it is not a permanent deletion and should never target a prefix that includes active pages.
- Do not claim that excluded, retired, redirected, or deliberately noindexed private pages should be indexed.

## SEO and AdSense quality goals
- Original, genuinely useful public content on the maintained pages; clear authorship, contact, about, privacy and terms.
- Responsive navigation, accessible headings, strong internal links, useful page descriptions, consistent canonical URLs, truthful structured data, working HTTPS and fast performance.
- Protect school ERP, authentication, student and teacher records from indexing and do not display public ad placements inside private workflows.
- `ads.txt` and the AdSense publisher verification metadata are technical signals only. Google determines approval, policy suitability and ranking; no website changes can guarantee "100%" ranking or approval.

## Source evidence and limits
Google Search Console drilldown exported 27 November 2026 lists 146 historical 404 URLs, with latest chart date 23 November. It does not show Google search-result visibility or current per-URL HTTP responses. Repository inspection verifies current files and routing configuration; Vercel production build logs verify deploy success, not Google's current crawl state.
