# Insurance Admin Documents Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new "Documents" page for the insurance admin portal (`apps/insurance/admin`) — category cards, a recent-files table, a compliance stat bar, and a storage-usage donut — styled with the existing Trust Blue (`insurance`) Tailwind theme and fed by typed mock data, reachable from a new sidebar nav entry.

**Architecture:** Six small standalone Angular components under `apps/insurance/admin/src/app/pages/documents/`. `DocumentsComponent` orchestrates a two-column grid (recent-files table + right rail) fed by typed hardcoded placeholder data from a sibling `documents.types.ts`. The donut and stat bar are hand-rolled CSS (conic-gradient / flex bars) — no charting dependency. The existing `SidebarLayoutComponent` and `DashboardLayoutComponent` are reused unchanged; only `app.routes.ts` and `navigation.config.ts` get additive edits.

**Tech Stack:** Angular 21.2.9 (standalone, `OnPush`, `input()`/`output()`, `@if`/`@for`, `inject()`), Tailwind v4 (`insurance` theme palette), `@mushaviri/ui` (`TreeNavNode`, `SidebarLayoutComponent` — reused, not modified).

## Global Constraints

- Angular 21 modern idioms only: standalone components, `ChangeDetectionStrategy.OnPush`, signal `input()` functions (NOT `@Input()` decorators), `@if`/`@for` control flow (NOT `*ngIf`/`*ngFor`), `inject()` (NOT constructor DI). Follow the `angular-modern-patterns` and `angular-class-organization` skills.
- All colors via Tailwind `theme-*` / `insurance-*` / `success`/`error`/`warning` utilities already defined in `tailwind.config.js`. NO hardcoded hex values in templates or styles. NO changes to `tailwind.config.js` or any theme token file.
- All numeric figures (counts, percentages, sizes) rendered with Tailwind `tabular-nums`.
- No new npm dependencies. No charting library — donut is CSS `conic-gradient`, stat bar is flex divs.
- No changes to `@mushaviri/ui` shared library components.
- Per repo convention (`CLAUDE.md` in `web-apps`): do NOT write `.spec.ts` files. UI is covered by Playwright e2e (a follow-up task, out of scope here). Verification is via `nx lint`, `nx build`/`serve`, and manual browser check.
- Quality floor: responsive (4-column card row collapses to 2 then 1; two-column body stacks to one column under `lg`), visible keyboard focus on interactive elements (checkboxes, buttons, search input).
- Commit after each task. Work directly on the current branch (no worktree needed — single-file-area, low-risk UI addition).

### STRICT ESLint — enforced by the husky pre-commit hook (a commit FAILS if violated)

`eslint.config.mjs` applies these as **errors** to all `**/*.ts`:

- **`@typescript-eslint/explicit-member-accessibility` (`accessibility: 'explicit'`):** EVERY class member needs an explicit `public`/`private`/`protected`. In these components: injected deps (none needed here — no services) would be `private readonly`; template-bound members `protected readonly`; `input()`s `public readonly`.
- **`@typescript-eslint/typedef`** (`memberVariableDeclaration`, `propertyDeclaration`, `parameter`, `variableDeclaration` all `true`; `arrayDestructuring`/`objectDestructuring`/`arrowParameter` `false`): class properties and `const` declarations need explicit type annotations; function parameters need types.
- **`@typescript-eslint/explicit-function-return-type`** + **`explicit-module-boundary-types`** (`allowExpressions`/`allowTypedFunctionExpressions`/`allowHigherOrderFunctions: true`): named methods need explicit return types; `input()`/`computed()` arrow initializers do not.
- **`no-console`**: only `warn`/`error` allowed — avoid `console.log` entirely (not needed in this plan).
- **`unused-imports/no-unused-imports`: error** — no unused imports.

**Consequence for this plan's code samples:** code blocks below show `readonly x = input(...)` etc. WITHOUT accessibility modifiers for brevity. Implementers MUST add `public`/`protected` to every member per the rules above. Run `pnpm nx lint insurance-admin` before each commit — the pre-commit hook re-runs `eslint --fix` on staged files, but fixing lint errors yourself first avoids a bounced commit.

## File Structure

```
apps/insurance/admin/src/app/
  pages/
    documents/
      documents.types.ts                    # interfaces + MOCK_DOCUMENTS_DATA
      documents.component.ts                # orchestrator page component
      documents.component.html
      components/
        document-category-card.component.ts       # folder-style summary tile
        status-badge.component.ts                  # Valid/Invalid/Expiring pill
        recent-files-table.component.ts             # filter pills + search/sort + rows
        recent-files-table.component.html
        compliance-bar.component.ts                 # segmented stat bar + legend
        storage-donut.component.ts                  # CSS conic-gradient donut + legend
  app.routes.ts                             # EDIT: add 'documents' child route
  config/
    navigation.config.ts                    # EDIT: add Documents TreeNavNode
```

Task order builds leaves first (types → badge → category card → compliance bar → storage donut → recent-files table → orchestrator page → routing/nav wiring), so every task consumes only already-built, already-typed pieces.

---

### Task 1: Types and mock data

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/documents.types.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `DocumentStatus` (union type), `DocumentFile`, `DocumentCategory`, `ComplianceSegment`, `StorageSlice`, and const `MOCK_DOCUMENTS_DATA` used by every later task.

- [ ] **Step 1: Create the types + mock data file**

```ts
// apps/insurance/admin/src/app/pages/documents/documents.types.ts

/** Validation state of a single uploaded document. */
export type DocumentStatus = 'valid' | 'invalid' | 'expiring';

/** One row in the Recent Files table. */
export interface DocumentFile {
  id: string;
  type: string;
  fileId: string;
  holderName: string;
  uploadedDate: string;
  expirationDate: string;
  source: string;
  status: DocumentStatus;
}

/** One folder-style summary tile. */
export interface DocumentCategory {
  label: string;
  icon: string;
  fileCount: number;
  sizeLabel: string;
}

/** One segment of the Document Compliance stat bar. */
export interface ComplianceSegment {
  label: string;
  count: number;
  pct: number;
  tone: DocumentStatus;
}

/** One slice of the Storage Usage breakdown legend. */
export interface StorageSlice {
  label: string;
  pct: number;
  sizeLabel: string;
}

/** All mock data backing the Documents page. Swappable for a real service later. */
export interface DocumentsPageData {
  categories: DocumentCategory[];
  recentFiles: DocumentFile[];
  complianceSegments: ComplianceSegment[];
  validCount: number;
  pendingReviewCount: number;
  storage: {
    usedPct: number;
    usedLabel: string;
    totalLabel: string;
    slices: StorageSlice[];
  };
}

export const MOCK_DOCUMENTS_DATA: DocumentsPageData = {
  categories: [
    { label: "Driver's Licences", icon: '🪪', fileCount: 45, sizeLabel: '256 MB' },
    { label: 'Proof of Address', icon: '🏠', fileCount: 30, sizeLabel: '512 MB' },
    { label: 'National IDs', icon: '📇', fileCount: 12, sizeLabel: '64 MB' },
    { label: 'Policy Documents', icon: '📋', fileCount: 60, sizeLabel: '340 MB' },
  ],
  recentFiles: [
    {
      id: 'f-35698',
      type: "Driver's Licence",
      fileId: '#35698',
      holderName: 'Michael S.',
      uploadedDate: '18-05-25',
      expirationDate: '18-05-30',
      source: 'Uploaded by Agent',
      status: 'valid',
    },
    {
      id: 'f-35697',
      type: 'Proof of Address',
      fileId: '#35697',
      holderName: 'Sam W.',
      uploadedDate: '16-05-25',
      expirationDate: '16-05-30',
      source: 'Client',
      status: 'invalid',
    },
    {
      id: 'f-35695',
      type: "Driver's Licence",
      fileId: '#35695',
      holderName: 'Liam Johnson',
      uploadedDate: '16-05-25',
      expirationDate: '16-05-30',
      source: 'Uploaded by Agent',
      status: 'valid',
    },
    {
      id: 'f-35694',
      type: 'National ID',
      fileId: '#35694',
      holderName: 'Sophia Brown',
      uploadedDate: '12-05-25',
      expirationDate: '12-05-30',
      source: 'Auto-imported',
      status: 'expiring',
    },
    {
      id: 'f-35693',
      type: 'Proof of Address',
      fileId: '#35693',
      holderName: 'Mason Smith',
      uploadedDate: '11-05-25',
      expirationDate: '11-05-30',
      source: 'Client',
      status: 'valid',
    },
    {
      id: 'f-35692',
      type: 'Policy Document',
      fileId: '#35692',
      holderName: 'Olivia Davis',
      uploadedDate: '08-05-25',
      expirationDate: '08-05-30',
      source: 'Uploaded by Agent',
      status: 'valid',
    },
  ],
  complianceSegments: [
    { label: 'Expired', count: 5, pct: 16, tone: 'expiring' },
    { label: 'Incomplete', count: 23, pct: 62, tone: 'expiring' },
    { label: 'Invalid Doc', count: 7, pct: 22, tone: 'invalid' },
  ],
  validCount: 421,
  pendingReviewCount: 48,
  storage: {
    usedPct: 25,
    usedLabel: '124 GB',
    totalLabel: '500 GB',
    slices: [
      { label: 'Policy Documents', pct: 12, sizeLabel: '60 GB' },
      { label: "Driver's Licences", pct: 7, sizeLabel: '35 GB' },
      { label: 'Proof of Address', pct: 6, sizeLabel: '30 GB' },
    ],
  },
};
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds (this file has no consumers yet, but must type-check standalone — the build compiles the whole app).

- [ ] **Step 3: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/documents.types.ts
git commit -m "feat(insurance-admin): add Documents page types and mock data"
```

---

### Task 2: StatusBadgeComponent

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/components/status-badge.component.ts`

**Interfaces:**

- Consumes: `DocumentStatus` from `../documents.types` (Task 1).
- Produces: `StatusBadgeComponent` with `status = input.required<DocumentStatus>()`, selector `org-status-badge`.

- [ ] **Step 1: Create the component**

```ts
// apps/insurance/admin/src/app/pages/documents/components/status-badge.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DocumentStatus } from '../documents.types';

interface BadgeStyle {
  label: string;
  classes: string;
}

const BADGE_STYLES: Record<DocumentStatus, BadgeStyle> = {
  valid: { label: 'Valid', classes: 'bg-success-light text-success' },
  invalid: { label: 'Invalid', classes: 'bg-error-light text-error' },
  expiring: { label: 'Expiring', classes: 'bg-warning-light text-warning' },
};

@Component({
  selector: 'org-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" [class]="style().classes">
      <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
      {{ style().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  public readonly status = input.required<DocumentStatus>();

  protected readonly style = computed<BadgeStyle>(() => BADGE_STYLES[this.status()]);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds.

- [ ] **Step 3: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/components/status-badge.component.ts
git commit -m "feat(insurance-admin): add StatusBadgeComponent"
```

---

### Task 3: DocumentCategoryCardComponent

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/components/document-category-card.component.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks (plain primitive inputs).
- Produces: `DocumentCategoryCardComponent`, selector `org-document-category-card`, inputs `label`, `icon`, `fileCount`, `sizeLabel` (all `input.required`).

- [ ] **Step 1: Create the component**

```ts
// apps/insurance/admin/src/app/pages/documents/components/document-category-card.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'org-document-category-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 rounded-lg border border-theme-border bg-theme-surface p-6">
      <div class="flex items-center justify-between">
        <span class="text-2xl">{{ icon() }}</span>
        <span class="text-sm text-theme-text-secondary">↗</span>
      </div>
      <div>
        <h3 class="text-base font-semibold text-theme-text">{{ label() }}</h3>
        <p class="text-sm tabular-nums text-theme-text-secondary">{{ fileCount() }} files · {{ sizeLabel() }}</p>
      </div>
    </div>
  `,
})
export class DocumentCategoryCardComponent {
  public readonly label = input.required<string>();
  public readonly icon = input.required<string>();
  public readonly fileCount = input.required<number>();
  public readonly sizeLabel = input.required<string>();
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds.

- [ ] **Step 3: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/components/document-category-card.component.ts
git commit -m "feat(insurance-admin): add DocumentCategoryCardComponent"
```

---

### Task 4: ComplianceBarComponent

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/components/compliance-bar.component.ts`

**Interfaces:**

- Consumes: `ComplianceSegment`, `DocumentStatus` from `../documents.types` (Task 1).
- Produces: `ComplianceBarComponent`, selector `org-compliance-bar`, input `segments = input.required<ComplianceSegment[]>()`.

- [ ] **Step 1: Create the component**

```ts
// apps/insurance/admin/src/app/pages/documents/components/compliance-bar.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComplianceSegment, DocumentStatus } from '../documents.types';

const SEGMENT_BAR_CLASSES: Record<DocumentStatus, string> = {
  invalid: 'bg-error',
  expiring: 'bg-warning',
  valid: 'bg-accent',
};

@Component({
  selector: 'org-compliance-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex justify-between text-sm font-medium">
        @for (segment of segments(); track segment.label) {
          <span class="tabular-nums text-theme-text">{{ segment.pct }}%</span>
        }
      </div>
      <div class="flex h-2 w-full overflow-hidden rounded-full">
        @for (segment of segments(); track segment.label) {
          <div class="h-full" [class]="barClass(segment.tone)" [style.width.%]="segment.pct"></div>
        }
      </div>
      <div class="grid grid-cols-3 gap-2">
        @for (segment of segments(); track segment.label) {
          <div class="rounded-md border border-theme-border px-3 py-2 text-center">
            <p class="text-lg font-semibold tabular-nums text-theme-text">
              {{ segment.count }}
            </p>
            <p class="text-xs text-theme-text-secondary">{{ segment.label }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class ComplianceBarComponent {
  public readonly segments = input.required<ComplianceSegment[]>();

  protected barClass(tone: DocumentStatus): string {
    return SEGMENT_BAR_CLASSES[tone];
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds.

- [ ] **Step 3: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/components/compliance-bar.component.ts
git commit -m "feat(insurance-admin): add ComplianceBarComponent"
```

---

### Task 5: StorageDonutComponent

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/components/storage-donut.component.ts`

**Interfaces:**

- Consumes: `StorageSlice` from `../documents.types` (Task 1).
- Produces: `StorageDonutComponent`, selector `org-storage-donut`, inputs `usedPct = input.required<number>()`, `usedLabel = input.required<string>()`, `totalLabel = input.required<string>()`, `slices = input.required<StorageSlice[]>()`.

- [ ] **Step 1: Create the component**

The donut uses a CSS `conic-gradient` on a round div, with a smaller solid circle centered on top to punch the hole (no SVG needed). The gradient stop is computed from `usedPct()` via `computed()`.

```ts
// apps/insurance/admin/src/app/pages/documents/components/storage-donut.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StorageSlice } from '../documents.types';

@Component({
  selector: 'org-storage-donut',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 rounded-lg bg-insurance-600 p-6 text-white">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold">Storage Usage</h3>
      </div>
      <div class="flex items-center gap-6">
        <div class="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full" [style.background]="donutGradient()">
          <div class="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-insurance-600">
            <span class="text-2xl font-bold tabular-nums">{{ usedPct() }}%</span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-lg font-semibold tabular-nums">
            {{ usedLabel() }}
            <span class="text-sm font-normal text-insurance-200">out of {{ totalLabel() }}</span>
          </p>
          <ul class="flex flex-col gap-1.5">
            @for (slice of slices(); track slice.label) {
              <li class="flex items-center gap-2 text-sm">
                <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                <span class="tabular-nums">{{ slice.pct }}% · {{ slice.sizeLabel }}</span>
                <span class="text-insurance-200">{{ slice.label }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class StorageDonutComponent {
  public readonly usedPct = input.required<number>();
  public readonly usedLabel = input.required<string>();
  public readonly totalLabel = input.required<string>();
  public readonly slices = input.required<StorageSlice[]>();

  protected readonly donutGradient = computed<string>(() => {
    const degrees: number = (this.usedPct() / 100) * 360;
    return `conic-gradient(white ${degrees}deg, rgba(255,255,255,0.25) ${degrees}deg)`;
  });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds.

- [ ] **Step 3: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/components/storage-donut.component.ts
git commit -m "feat(insurance-admin): add StorageDonutComponent"
```

---

### Task 6: RecentFilesTableComponent

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/components/recent-files-table.component.ts`
- Create: `apps/insurance/admin/src/app/pages/documents/components/recent-files-table.component.html`

**Interfaces:**

- Consumes: `DocumentFile` from `../documents.types` (Task 1); `StatusBadgeComponent` (Task 2).
- Produces: `RecentFilesTableComponent`, selector `org-recent-files-table`, input `files = input.required<DocumentFile[]>()`. Internal `searchTerm = signal<string>('')` and `computed()` filtered list — search is local/client-side over the mock array (no output needed since there's no parent state to sync back to yet).

- [ ] **Step 1: Create the component class**

```ts
// apps/insurance/admin/src/app/pages/documents/components/recent-files-table.component.ts
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DocumentFile } from '../documents.types';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'org-recent-files-table',
  standalone: true,
  imports: [StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-files-table.component.html',
})
export class RecentFilesTableComponent {
  public readonly files = input.required<DocumentFile[]>();

  protected readonly searchTerm = signal<string>('');

  protected readonly visibleFiles = computed<DocumentFile[]>(() => {
    const term: string = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.files();
    }
    return this.files().filter((file: DocumentFile): boolean => file.holderName.toLowerCase().includes(term) || file.type.toLowerCase().includes(term) || file.fileId.toLowerCase().includes(term));
  });

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }
}
```

- [ ] **Step 2: Create the template**

```html
<!-- apps/insurance/admin/src/app/pages/documents/components/recent-files-table.component.html -->
<div class="bg-theme-surface border-theme-border rounded-lg border p-6">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-theme-text text-lg font-semibold">Recent Files</h3>
    <span class="text-theme-text-secondary text-sm">↗</span>
  </div>

  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div class="flex gap-2">
      <button type="button" class="bg-insurance-600 rounded-md px-3 py-1.5 text-sm font-medium text-white">Import</button>
      <button type="button" class="border-theme-border text-theme-text rounded-md border px-3 py-1.5 text-sm font-medium">Renew</button>
      <button type="button" class="border-theme-border text-theme-text rounded-md border px-3 py-1.5 text-sm font-medium">Complete</button>
    </div>
    <input type="search" placeholder="Search.." class="border-theme-border text-theme-text focus:ring-insurance-600 rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none" [value]="searchTerm()" (input)="onSearchInput($any($event.target).value)" />
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="text-theme-text-secondary border-theme-border border-b">
          <th class="py-2 pr-4 font-medium">Type</th>
          <th class="py-2 pr-4 font-medium">File ID</th>
          <th class="py-2 pr-4 font-medium">Holder</th>
          <th class="py-2 pr-4 font-medium">Date</th>
          <th class="py-2 pr-4 font-medium">Expiration</th>
          <th class="py-2 pr-4 font-medium">Source</th>
          <th class="py-2 pr-4 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        @for (file of visibleFiles(); track file.id) {
        <tr class="border-theme-border text-theme-text border-b last:border-0">
          <td class="py-3 pr-4">{{ file.type }}</td>
          <td class="text-theme-text-secondary py-3 pr-4 tabular-nums">{{ file.fileId }}</td>
          <td class="py-3 pr-4">{{ file.holderName }}</td>
          <td class="py-3 pr-4 tabular-nums">{{ file.uploadedDate }}</td>
          <td class="py-3 pr-4 tabular-nums">{{ file.expirationDate }}</td>
          <td class="text-theme-text-secondary py-3 pr-4">{{ file.source }}</td>
          <td class="py-3 pr-4">
            <org-status-badge [status]="file.status" />
          </td>
        </tr>
        } @empty {
        <tr>
          <td colspan="7" class="text-theme-text-secondary py-6 text-center">No files match your search.</td>
        </tr>
        }
      </tbody>
    </table>
  </div>
</div>
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds.

- [ ] **Step 4: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/components/recent-files-table.component.ts apps/insurance/admin/src/app/pages/documents/components/recent-files-table.component.html
git commit -m "feat(insurance-admin): add RecentFilesTableComponent"
```

---

### Task 7: DocumentsComponent (orchestrator page)

**Files:**

- Create: `apps/insurance/admin/src/app/pages/documents/documents.component.ts`
- Create: `apps/insurance/admin/src/app/pages/documents/documents.component.html`

**Interfaces:**

- Consumes: `MOCK_DOCUMENTS_DATA`, `DocumentsPageData` (Task 1); `DocumentCategoryCardComponent` (Task 3); `RecentFilesTableComponent` (Task 6); `ComplianceBarComponent` (Task 4); `StorageDonutComponent` (Task 5).
- Produces: `DocumentsComponent`, selector `org-documents`, no inputs (top-level routed page — holds the mock data directly, per the umdzidzisi precedent).

- [ ] **Step 1: Create the component class**

```ts
// apps/insurance/admin/src/app/pages/documents/documents.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocumentsPageData, MOCK_DOCUMENTS_DATA } from './documents.types';
import { DocumentCategoryCardComponent } from './components/document-category-card.component';
import { RecentFilesTableComponent } from './components/recent-files-table.component';
import { ComplianceBarComponent } from './components/compliance-bar.component';
import { StorageDonutComponent } from './components/storage-donut.component';

@Component({
  selector: 'org-documents',
  standalone: true,
  imports: [DocumentCategoryCardComponent, RecentFilesTableComponent, ComplianceBarComponent, StorageDonutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documents.component.html',
})
export class DocumentsComponent {
  protected readonly data: DocumentsPageData = MOCK_DOCUMENTS_DATA;
}
```

- [ ] **Step 2: Create the template**

```html
<!-- apps/insurance/admin/src/app/pages/documents/documents.component.html -->
<div class="flex flex-col gap-6 p-6">
  <div class="flex items-center justify-between">
    <h1 class="text-theme-text text-3xl font-bold">Documents</h1>
    <button type="button" class="bg-insurance-600 rounded-md px-4 py-2 text-sm font-medium text-white">+ New Document</button>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    @for (category of data.categories; track category.label) {
    <org-document-category-card [label]="category.label" [icon]="category.icon" [fileCount]="category.fileCount" [sizeLabel]="category.sizeLabel" />
    }
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2">
      <org-recent-files-table [files]="data.recentFiles" />
    </div>
    <div class="flex flex-col gap-6">
      <div class="bg-theme-surface border-theme-border rounded-lg border p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-theme-text text-lg font-semibold">Document Compliance</h3>
        </div>
        <org-compliance-bar [segments]="data.complianceSegments" />
        <div class="border-theme-border mt-4 flex justify-between border-t pt-4">
          <div>
            <p class="text-theme-text text-2xl font-bold tabular-nums">{{ data.validCount }}</p>
            <p class="text-theme-text-secondary text-sm">Valid Documents</p>
          </div>
          <div>
            <p class="text-theme-text text-2xl font-bold tabular-nums">{{ data.pendingReviewCount }}</p>
            <p class="text-theme-text-secondary text-sm">Pending Review</p>
          </div>
        </div>
        <div class="bg-warning-light border-warning mt-4 rounded-md border p-3 text-sm">Some are close to expiring, incomplete, or failed validation. Review now to avoid policy delays.</div>
      </div>
      <org-storage-donut [usedPct]="data.storage.usedPct" [usedLabel]="data.storage.usedLabel" [totalLabel]="data.storage.totalLabel" [slices]="data.storage.slices" />
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm nx build insurance-admin`
Expected: build succeeds.

- [ ] **Step 4: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/pages/documents/documents.component.ts apps/insurance/admin/src/app/pages/documents/documents.component.html
git commit -m "feat(insurance-admin): add DocumentsComponent orchestrator page"
```

---

### Task 8: Wire routing and sidebar navigation

**Files:**

- Modify: `apps/insurance/admin/src/app/app.routes.ts`
- Modify: `apps/insurance/admin/src/app/config/navigation.config.ts`

**Interfaces:**

- Consumes: `DocumentsComponent` (Task 7).
- Produces: route path `/documents` reachable from the sidebar; no new exports.

- [ ] **Step 1: Add the route**

Edit `apps/insurance/admin/src/app/app.routes.ts` to import and register `DocumentsComponent` as a sibling of the existing `dashboard` route:

```ts
import { Route } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard-home.component';
import { DocumentsComponent } from './pages/documents/documents.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
      },
      {
        path: 'documents',
        component: DocumentsComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
```

- [ ] **Step 2: Add the sidebar nav entry**

Edit `apps/insurance/admin/src/app/config/navigation.config.ts` — insert a new node into `INSURANCE_ADMIN_NAV_CONFIG`, positioned right after the `dashboard` node and before `policies`:

```ts
export const INSURANCE_ADMIN_NAV_CONFIG: TreeNavNode[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    route: '/dashboard',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: '📄',
    iconBg: '#00a19a',
    iconColor: '#FFFFFF',
    route: '/documents',
  },
  {
    id: 'policies',
    // ...unchanged, rest of the existing array stays as-is
```

(Only the new `documents` node is inserted; the `policies`, `claims`, `customers`, `quotes`, `reports`, `settings` nodes and `USER_MENU_CONFIG` below them are untouched.)

- [ ] **Step 3: Verify the route renders**

Run: `pnpm nx serve insurance-admin` (serves standalone on port 4208 per `project.json`), then open `http://localhost:4208/documents` directly in a browser.
Expected: the Documents page renders inside the sidebar shell — category cards, recent files table with colored status badges, compliance bar with 3 counts, storage donut. Also click "Documents" in the sidebar from `/dashboard` and confirm navigation works and the item highlights as active.

If the shell host (`apps/shell/admin`) is used instead to view it federated, run `pnpm nx serve shell-admin` (or the equivalent project name — confirm via `pnpm nx show projects | grep shell`) and navigate to `/insurance-admin/documents` after logging in, since the remote is gated by `requiredAuthGuard`.

- [ ] **Step 4: Lint and commit**

```bash
pnpm nx lint insurance-admin
git add apps/insurance/admin/src/app/app.routes.ts apps/insurance/admin/src/app/config/navigation.config.ts
git commit -m "feat(insurance-admin): wire Documents route and sidebar nav entry"
```

---

## Final Verification

- [ ] Run `pnpm nx lint insurance-admin` — zero errors.
- [ ] Run `pnpm nx build insurance-admin` — build succeeds.
- [ ] Run `pnpm nx serve insurance-admin`, open `/documents` in a browser:
  - 4 category cards render with correct counts/sizes.
  - Recent Files table shows 6 rows with color-coded status badges (green=valid, red=invalid, amber=expiring).
  - Typing in the search box filters rows by holder name/type/file ID.
  - Document Compliance bar shows 3 segments summing to 100% with matching counts below.
  - Storage Usage donut renders a blue/white ring at 25%, with 124 GB / 500 GB and 3 legend rows.
  - Resize the browser to ~375px width — category cards stack to 1 column, table + right rail stack vertically, nothing overflows horizontally.
  - Click into the search input and tab through the Import/Renew/Complete buttons — focus rings are visible.
- [ ] Click "Documents" in the left sidebar from another page — confirms nav wiring and active-state highlighting.
