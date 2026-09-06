# Insurance Admin Documents Dashboard — Design Spec

**Date:** 2026-09-06
**Status:** Approved (design), pending implementation plan
**Scope:** Insurance admin only (`apps/insurance/admin`). UI-only with mock data — no backend wiring in this pass.

## Context

`apps/insurance/admin` currently has a single placeholder `DashboardHomeComponent` — a static 3x2 Tailwind card grid with no data or hierarchy (`pages/dashboard-home.component.html`). There is no "Documents" page or nav entry yet, even though the domain already models identity/policy documents: `policy_holders` reference `NationalID`, `DriversLicence`, and `ProofOfAddress` files (stored via content-management-service, referenced by ID only — no local claims/document entity exists server-side yet).

The user supplied a visual reference (`docs/img.png` in the backend-services repo): a fictional "PolicyPilot" document-management dashboard — top nav, four folder-summary cards, a recent-files table with status badges, a compliance stat-bar widget, and a storage-usage donut. This spec adapts that structure to our actual insurance-admin domain and the existing **Trust Blue** brand theme, following the same pattern already used for the umdzidzisi admin dashboard redesign (`2026-08-03-umdzidzisi-admin-dashboard-design.md`).

**Decisions locked with the user:**

- **Use case:** document management (client identity + policy documents), not a broader ops/fulfilment dashboard.
- **Audience:** internal ops/admin users (insurance staff), not client-facing.
- **Host:** `apps/insurance/admin` (existing Nx remote app in `web-apps`), reached via a new top-level **Documents** sidebar entry (`/documents`), sibling to Policies/Claims/Customers.
- **Document types tracked:** Driver's Licences, Proof of Address, National IDs, Policy Documents — matches what's already modeled on `policy_holders`/`policies`. No vehicle/claim documents in this pass.
- **Theme:** reuse the existing **`insurance`** Tailwind palette (Trust Blue) — no new tokens. Primary `#1e3a5f`, accent (teal) `#00a19a`, surface `#f8fafb`, border `#d5dee7`, full `insurance-50…900` scale already in `tailwind.config.js`.
- **Data:** UI-only mockup with realistic typed placeholder data. No HTTP calls to insurance-service or content-management-service in this pass — a future task wires real endpoints once document-compliance APIs exist server-side.
- **Charts/widgets:** hand-rolled (CSS conic-gradient donut, flex stat bar) — no charting library exists in the repo and none is being introduced.

## Design language

**The thesis.** Where the reference mockup is a generic blue SaaS look, ours reads as **Trust Blue applied to compliance oversight**: the one thing an ops manager needs at a glance is "what's expiring or invalid, and how much room is left." The compliance stat bar and storage donut on the right rail carry that signal; the table is where they act on it.

**Tokens (all existing, no changes to `tailwind.config.js`):**

- Primary `--theme-primary-color` → `insurance.primary` `#1e3a5f`; accent `insurance.accent` `#00a19a`
- Surface `insurance.surface` `#f8fafb` / card `#ffffff`; text `insurance.text` `#0d1b2a` / secondary `insurance['text-secondary']` `#3c5a7d`; border `insurance.border` `#d5dee7`
- Status badges use the existing semantic tokens: `success` (`#52c41a` / `success-light` `#f6ffed`) for Valid, `error` (`#ff4d4f` / `error-light` `#fff2f0`) for Invalid, `warning` (`#faad14` / `warning-light` `#fffbe6`) for Expiring/Incomplete
- Consumed via `theme-*` Tailwind utilities (as `dashboard-home.component.html` already does: `bg-theme-surface`, `border-theme-border`, `text-theme-text`) so the page inherits tenant re-theming for free
- Card style matches the existing pattern exactly: `bg-theme-surface border-theme-border rounded-lg border p-6`

**Type.** System font stack (no custom face today). Table and stat numbers use `font-variant-numeric: tabular-nums` so figures align in columns.

**Surface style.** White/`insurance.surface` cards, `1px` `theme-border`, `rounded-lg`, generous padding — consistent with the existing dashboard-home cards, not a new visual system.

## Layout (the `<router-outlet>` content area only — sidebar chrome is unchanged)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Documents                                        [+ New Document]    │  page header
│  ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐    │
│  │📄 Driver's   ││🏠 Proof of   ││🪪 National   ││📋 Policy     │    │  4 category cards
│  │  Licences    ││  Address     ││  IDs         ││  Documents   │    │  (count · size)
│  │  45 · 256 MB ││  30 · 512 MB ││  12 · 64 MB  ││  60 · 340 MB │    │
│  └──────────────┘└──────────────┘└──────────────┘└──────────────┘    │
│  ┌────────────────────────────────────────┐  ┌───────────────────┐  │
│  │ Recent Files                       ↗    │  │ Document Compliance│  │
│  │ [Import][Renew][Complete]  [Search][Sort]│  │ ▓▓▓▓░░░░░░ 62%     │  │
│  │ ☐ Type    ID   Holder  Date  Exp  Status │  │ 5 Exp·23 Inc·7 Inv │  │
│  │ ☐ DL      ...  ...     ...  ...  Valid  │  │ 421 Valid·48 Pend  │  │
│  │ ☐ POA     ...  ...     ...  ...  Invalid│  │ ⚠ review banner    │  │
│  │  (6 rows)                                │  ├───────────────────┤  │
│  │                                          │  │ Storage Usage      │  │
│  │                                          │  │   (donut) 25%      │  │
│  │                                          │  │  124GB / 500GB     │  │
│  │                                          │  │ ● DL 12%·60GB      │  │
│  │                                          │  │ ● POA 7%·35GB      │  │
│  │                                          │  │ ● NatID 6%·30GB    │  │
│  └────────────────────────────────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

Responsive: category card row wraps 4→2→1 columns under `lg`/`sm`; the two-column body (table + right rail) stacks to single column under `lg`, right-rail cards keep their internal layout.

There is no new top app-bar — `SidebarLayoutComponent` doesn't render one (confirmed: it only wraps sidebar chrome, `<main>` is pure `ng-content`), and building a global topbar (search/notifications/dark-mode/avatar, as in the reference) is out of scope for this page-level spec. The page header here is just the "Documents" title + primary action button, matching how `dashboard-home.component.html` currently opens with an `<h1>`.

## Components

New components under `apps/insurance/admin/src/app/pages/documents/` (feature) and `apps/insurance/admin/src/app/pages/documents/components/` (primitives). All **standalone, `OnPush`, Angular modern idioms** (`input()`/`output()` functions, `@if`/`@for`, `inject()`), per the `angular-modern-patterns` skill — same convention as the umdzidzisi dashboard work.

| Component                       | Job                                                             | Key inputs                                | Reference pattern          |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------- | -------------------------- |
| `DocumentsComponent`            | Orchestrates page grid; holds typed mock data                   | —                                         | overall canvas             |
| `DocumentCategoryCardComponent` | Folder-style summary tile: icon, label, file count, size        | `label`, `icon`, `fileCount`, `sizeLabel` | 4 folder cards             |
| `RecentFilesTableComponent`     | Filter pills + search/sort header + file rows w/ status badge   | `files: DocumentFile[]`, `filters`        | Recent Files table         |
| `StatusBadgeComponent`          | Small pill: Valid/Invalid/Expiring, colored via semantic tokens | `status: DocumentStatus`                  | badges throughout table    |
| `ComplianceBarComponent`        | Segmented horizontal stat bar + legend counts                   | `segments: {label, pct, tone}[]`          | Document Compliance widget |
| `StorageDonutComponent`         | Hand-rolled CSS conic-gradient donut + center % + total label   | `usedPct`, `usedLabel`, `totalLabel`      | Storage Usage donut        |

**Reused as-is:** `SidebarLayoutComponent`, nav config wiring (`INSURANCE_ADMIN_NAV_CONFIG` gets a new `documents` entry) — no changes to shared `libs/ui` components. No `UserMenuComponent`/topbar changes since this page doesn't touch app chrome.

**Data:** realistic hardcoded mock data inside `DocumentsComponent`, typed with small interfaces (`DocumentFile`, `DocumentCategory`, `ComplianceSegment`), structured so a future service swap (once content-management-service exposes document-compliance endpoints) is a one-line change — no HTTP calls in this pass.

## Routing & navigation changes

- `apps/insurance/admin/src/app/app.routes.ts` — add a `documents` child route under the existing `DashboardLayoutComponent`, rendering `DocumentsComponent`.
- `apps/insurance/admin/src/app/config/navigation.config.ts` — add a new top-level `TreeNavNode` (`id: 'documents'`, route `/documents`) to `INSURANCE_ADMIN_NAV_CONFIG`, positioned after `dashboard` and before `policies` (documents are a cross-cutting concern reviewed before diving into policy-specific work).

## Testing

Per repo convention (`CLAUDE.md`): no `.spec.ts` unit tests. Coverage is via Playwright e2e under `apps/e2e/**` — a follow-up task, not part of this UI-only design pass. Manual verification: run `apps/insurance/admin` (and its `apps/shell/admin` host, since insurance-admin is a native-federation remote) and visually confirm the page against this layout in a browser.
