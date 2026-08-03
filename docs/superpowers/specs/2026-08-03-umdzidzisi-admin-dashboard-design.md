# Umdzidzisi Admin Dashboard — Design Spec

**Date:** 2026-08-03
**Status:** Approved (design), pending implementation plan
**Scope:** Umdzidzisi admin only (`apps/umdzidzisi/admin`). Reusable components built so umtengesi can adopt later.

## Context

The umdzidzisi admin dashboard (`dashboard-home.component.ts`) is a placeholder: a static 3-card Tailwind grid with no data, no hierarchy, no visual identity. The left menu already works well (icon rail + text tree via the shared `SidebarLayoutComponent`). This redesign gives the dashboard a polished, distinctive look using `designs/img_3.png` (the "Codename" CRM dashboard) as the visual reference — adapted to umdzidzisi's actual education domain (examinations, subjects, educational levels, subscriptions) rather than img_3's sales/CRM content.

**Decisions locked with the user:**

- **Accent:** keep the existing umdzidzisi brand **purple `#544a88`** — no theme-token changes. Apply img_3's _layout_ with purple as the highlight.
- **Content:** education-domain adaptation of img_3's structure (not a literal CRM clone).
- **Charts:** hand-rolled SVG (no new dependency).
- **Left menu:** polish the existing `SidebarLayoutComponent` (no rebuild).
- **Tenant:** umdzidzisi only.
- **Hero metric:** Active learners.
- **Body blocks:** KPI stat row + subject-performance breakdown + activity chart + examinations leaderboard (all four).

## Design language

**The thesis / hero.** Where img_3 opens on Revenue, umdzidzisi opens on **learning throughput**. The signature element is a **hero KPI block**: one oversized tabular-figure number ("Active learners"), an inline filled-purple delta pill (`▲ 8.2% +947`), and a period-comparison line (`vs prev 11,533 · This term`). This is the one bold element; everything else stays quiet.

**Tokens (all existing, re-theme automatically):**

- Primary `--theme-primary-color` `#544a88`; accent `--theme-accent-color` `#756d9e`
- Surface `#fafafa` / card `#ffffff`; text `#0b0a14` / secondary `#544a88`; border `#d7d6e0`
- Purple scale `--umdzidzisi-50…900` for chart fills, sparkline gradients, ranked-list bars
- Semantic `success` / `error` (already in `tailwind.config.js`) for up/down deltas
- Consume via `var(--theme-*)` and Tailwind `theme-*` / `umdzidzisi-*` utilities so dark mode + re-theming work for free

**Type.** Keep the system font stack (no custom face loaded today) but establish a deliberate scale: oversized hero number, medium section labels, quiet secondary captions. All figures use `font-variant-numeric: tabular-nums` so columns of numbers align — essential for a data dashboard and a key reason img_3 reads as polished.

**Surface style.** `#fafafa`/white cards, `1px` `--theme-border` borders, `rounded-xl` (matches img_3's soft radius), generous padding, subtle `--theme-shadow`. Quiet by default; boldness spent only on the hero.

## Layout (the `<main>` content area only)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🔍 Search examinations, subjects, learners…]        [🔔] [avatar ▾] │  topbar
├─────────────────────────────────────────────────────────────────────┤
│  Overview                                    [ This term ▾ ]          │  title + period
│  ┌─────────────────────────────┐  ┌────────┐┌────────┐┌────────┐      │
│  │ ACTIVE LEARNERS 12,480 ▲8.2%│  │Exams 38││Subs    ││Pass 74%│      │  HERO + 3 KPI tiles
│  │ vs prev 11,533 · This term  │  │        ││2,914 ▲ ││  ▲     │      │  (each w/ sparkline)
│  └─────────────────────────────┘  └────────┘└────────┘└────────┘      │
│  ┌────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │ Enrollments over time     ⌄    │  │ Top subjects        Filters ⌄│ │
│  │  ▁▂▃▅▇▆▅▇ (SVG bars)           │  │ ● Mathematics 1,842   38%    │ │  chart (~60%)
│  │ [Enrollments][Exams][Passes]  │  │ ● English     1,357   27%    │ │  + ranked bars (~40%)
│  └────────────────────────────────┘  └──────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Examination boards      Level   Candidates   Pass rate  ⌄        │ │  leaderboard table
│  │  Cambridge IGCSE       O-Level    4,210        76% ▲             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

Responsive: KPI row wraps to 2×2 then 1-col; chart + ranked list stack under `lg`; sidebar off-canvas under 768px (already handled by `SidebarLayoutComponent`).

## Components

New components under `apps/umdzidzisi/admin/src/app/dashboard/` (feature) and `apps/umdzidzisi/admin/src/app/dashboard/components/` (primitives). All **standalone, `OnPush`, Angular-21 idioms** (`input()`/`output()` functions, `@if`/`@for`, `inject()`), per the `angular-modern-patterns` skill. Each has one clear job and a small typed input contract.

| Component                                   | Job                                                       | Key inputs                                      | img_3 pattern               |
| ------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------- | --------------------------- |
| `DashboardHomeComponent` (rewrite existing) | Orchestrates grid; holds typed placeholder data           | —                                               | overall canvas              |
| `DashboardTopbarComponent`                  | Search + notifications + avatar row                       | `userName?`                                     | top search bar              |
| `KpiHeroComponent`                          | Signature big-number block + delta pill + comparison line | `label`, `value`, `delta`, `previous`, `period` | Revenue hero                |
| `StatTileComponent`                         | Small metric tile: label, number, delta, sparkline        | `label`, `value`, `delta`, `series`             | Top sales / Best deal cards |
| `SparklineComponent`                        | Hand-rolled inline SVG line/area                          | `series: number[]`, `tone?`                     | sales-dynamic line          |
| `BarChartComponent`                         | Hand-rolled SVG bar chart + tab switcher                  | `series`, `labels`, `tabs`                      | central bar chart           |
| `RankedListComponent`                       | Rows of label + value + % progress bar                    | `items: {label,value,pct}[]`                    | platform breakdown          |
| `LeaderboardTableComponent`                 | Ranked table w/ delta arrows                              | `columns`, `rows`                               | sales-rep leaderboard       |

**Reused as-is:** `SidebarLayoutComponent`, `TreeNavigationComponent`, `TreeNodeComponent`, `TreeNavNode`/`TreeNavConfig` (`@mushaviri/ui-common`); the `@mushaviri/util-theming` tokens + `tailwind.config.js` bridge; optionally `UserMenuComponent` for the avatar dropdown.

**Data:** realistic hardcoded placeholder data inside `DashboardHomeComponent`, typed with small interfaces (`KpiSummary`, `SubjectRank`, `BoardRow`, `TimeSeries`), structured so a future service swap is a one-line change. No backend, no HTTP.

## Sidebar polish (reuse `SidebarLayoutComponent`, `navigation.config.ts`, `dashboard-layout.component.ts`)

Light touches only — the rail+tree already matches img_3's icon-rail concept:

- Surface a **search field** in the topbar/sidebar header (img_3 has a prominent search).
- Refine the brand header chip (logo + "Umdzidzisi Admin").
- Verify rail↔tree active-state alignment (already tuned in `sidebar-layout.component.scss`).
- Add **badge counts** to a couple of nav items (e.g. Examinations `38`) via the existing `badge` field on `TreeNavNode` in `navigation.config.ts`.

## Files

**Rewrite in place:** `apps/umdzidzisi/admin/src/app/pages/dashboard-home.component.ts` stays at its current path (so `app.routes.ts` needs no change) but its template is rebuilt to orchestrate the new grid.
**New:** the other 7 components in the table above, under `apps/umdzidzisi/admin/src/app/dashboard/…` (feature) and `.../dashboard/components/…` (primitives).
**Edit (light):** `apps/umdzidzisi/admin/src/app/config/navigation.config.ts` (badges), `apps/umdzidzisi/admin/src/app/layouts/dashboard-layout.component.ts` (brand/search wiring if needed).
**No changes:** theme tokens (`themes.scss`, `theme-config.ts`, `tailwind.config.js`), shared `ui-common` components.

## Non-goals

- No theme/brand color change (stays purple).
- No charting library.
- No umtengesi changes.
- No real data/backend integration.
- No rebuild of the sidebar shell.
- Placeholder pages (`placeholder-page.component.ts`) and non-dashboard routes are untouched.

## Verification

1. `pnpm nx build umdzidzisi-admin` — typechecks and builds clean.
2. `pnpm nx lint umdzidzisi-admin` — passes.
3. Serve and view end-to-end: `npm run umdzidzisi:admin`, log in, land on `/umdzidzisi-admin/dashboard`; drive with Playwright MCP. Confirm: hero renders with tabular number + delta pill; 3 KPI tiles with sparklines; bar chart with working tab switcher; ranked subject list with % bars; leaderboard table; topbar search; sidebar unchanged and aligned.
4. Responsive check at 375 / 768 / 1280 px: KPI row reflows, chart+list stack, sidebar goes off-canvas.
5. Theme check: colors derive from `--theme-*` (spot-check that switching `data-theme` recolors the dashboard); visible keyboard focus on interactive elements; `prefers-reduced-motion` respected on any animation.
6. Quality floor: no hardcoded hex outside the token system; `tabular-nums` on all figures.
