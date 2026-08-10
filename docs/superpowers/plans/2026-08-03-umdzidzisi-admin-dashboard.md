# Umdzidzisi Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the umdzidzisi admin dashboard content area into a polished, education-domain dashboard modeled on `designs/img_3.png`, reusing the existing sidebar shell and theme tokens.

**Architecture:** Eight small standalone Angular-21 components under `apps/umdzidzisi/admin/src/app/dashboard/`. `DashboardHomeComponent` (rewritten in place at its current path) orchestrates a grid of presentational components fed typed hardcoded placeholder data. Charts are hand-rolled SVG driven by two pure geometry helpers (unit-tested with Vitest). All colors come from existing `--theme-*` CSS variables / Tailwind `theme-*` utilities, so no theme tokens change and dark mode + re-theming work automatically. The sidebar (`SidebarLayoutComponent`) is reused; only `navigation.config.ts` and `dashboard-layout.component.ts` get light edits.

**Tech Stack:** Angular 21.2.9 (standalone, `OnPush`, `input()`/`output()`, `@if`/`@for`, `inject()`), Tailwind v4, Vitest + jsdom + `@analogjs/vite-plugin-angular`, Flaticon UIcons (`fi fi-rr-*`), `@mushaviri/ui-common`, `@mushaviri/util-theming`.

## Global Constraints

- Angular 21 modern idioms only: standalone components, `ChangeDetectionStrategy.OnPush`, signal `input()`/`output()` functions (NOT `@Input()`/`@Output()` decorators), `@if`/`@for` control flow (NOT `*ngIf`/`*ngFor`), `inject()` (NOT constructor DI). Follow the `angular-modern-patterns` and `angular-class-organization` skills.
- All colors via `var(--theme-*)` CSS vars or Tailwind `theme-*` / `umdzidzisi-*` utilities. NO hardcoded hex outside those tokens.
- All numeric figures rendered with `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`).
- No new npm dependencies. No charting library. Charts are hand-rolled SVG.
- No theme-token changes (`themes.scss`, `theme-config.ts`, `tailwind.config.js` untouched).
- No changes to `@mushaviri/ui-common` shared components, umtengesi, or placeholder pages.
- Quality floor: responsive to 375px, visible keyboard focus, `prefers-reduced-motion` respected on any transition.
- Tests: Vitest, `globals: true` (ambient `describe`/`it`/`expect`), files as `*.spec.ts` colocated in `src/`. Run a single project's tests with `pnpm nx test umdzidzisi-admin`.
- Commit after each task. Work on branch `feat/umdzidzisi-admin-dashboard` (already created; spec already committed there).

### STRICT ESLint — enforced by the husky pre-commit hook (a commit FAILS if violated)

`eslint.config.mjs` applies these as **errors** to all `**/*.ts` (relaxed only in `*.spec.ts`). Every non-test file MUST satisfy them or the commit is rejected and reverted:

- **`@typescript-eslint/explicit-member-accessibility` (accessibility: 'explicit'):** EVERY class member — properties, methods, getters — needs an explicit `public` / `private` / `protected`. In these components: injected deps `private readonly`; template-bound members `protected readonly`; public API (`input()`s meant for parents) `readonly` is fine but still needs a modifier — use `public readonly` for inputs, `protected readonly` for internal `computed`/`signal`.
- **`@typescript-eslint/typedef` (memberVariableDeclaration, propertyDeclaration, parameter, variableDeclaration all true):** class properties and `const` declarations need explicit type annotations; function parameters need types. Relaxations: `arrowParameter: false` (so `arr.map(x => …)` is fine), `objectDestructuring`/`arrayDestructuring: false`. Note `input()`/`computed()`/`signal()` initializers ARE function expressions, so `variableDeclarationIgnoreFunction: false` still requires the property to have its accessibility modifier but the inferred type from `input.required<T>()` is accepted (it's an assignment from a typed call). When in doubt, annotate.
- **`@typescript-eslint/explicit-function-return-type` + `explicit-module-boundary-types`:** methods and exported functions need explicit return types. Relaxations: `allowExpressions: true`, `allowTypedFunctionExpressions: true`, `allowHigherOrderFunctions: true` — so `computed(() => …)` and `input()` arrow initializers do NOT need annotation, but a named method like `protected toggle(): void {}` DOES, and every exported top-level function (`sparklinePath`, `barLayout`) MUST declare its return type (already do in the plan).
- **`no-console`: allow only `warn`/`error`** (a warning, but husky treats the hook's non-zero exit as blocking on errors; avoid `console.log` entirely — use nothing or `console.warn`).
- **`unused-imports/no-unused-imports`: error** — no unused imports (e.g. don't import `CommonModule` if only `DecimalPipe` is used).

**Consequence for the plan's code samples:** the component code blocks in Tasks 3-10 show `readonly x = input(…)` etc. WITHOUT accessibility modifiers for brevity. Implementers MUST add `public`/`protected`/`private` to every member: inputs → `public readonly`, internal computed/signal → `protected readonly`, injected services → `private readonly`, named methods → explicit modifier + return type. Verify with `pnpm nx lint umdzidzisi-admin` before each commit (the hook runs `eslint --fix` on staged files; run lint yourself first so the commit doesn't bounce).

## File Structure

```
apps/umdzidzisi/admin/src/app/
  dashboard/
    dashboard.types.ts                         # shared TS interfaces + placeholder data
    chart-geometry.ts                           # pure fns: sparklinePath(), barLayout()
    chart-geometry.spec.ts                      # Vitest unit tests for the two fns
    components/
      sparkline.component.ts                    # SVG line/area sparkline
      stat-tile.component.ts                    # small KPI tile (uses sparkline)
      kpi-hero.component.ts                     # signature big-number block
      bar-chart.component.ts                    # SVG bar chart + tab switcher
      ranked-list.component.ts                  # label + value + % bar rows
      leaderboard-table.component.ts            # ranked table w/ delta arrows
      dashboard-topbar.component.ts             # search + notifications + avatar
  pages/
    dashboard-home.component.ts                 # REWRITE in place: orchestrates the grid
  config/
    navigation.config.ts                        # EDIT: add badge counts
  layouts/
    dashboard-layout.component.ts               # EDIT (light): brand chip / no structural change
```

Task order builds leaves first (types → geometry → sparkline → tiles/hero → chart/list/table → topbar → orchestrator → sidebar polish → verify), so every task consumes only already-built interfaces.

---

### Task 0: Commit the scaffolding baseline (lint-fix pre-existing files)

The umdzidzisi admin `config/`, `layouts/`, `pages/` files exist untracked and must be committed as a clean diff baseline — but they currently VIOLATE the strict ESLint rules, so the pre-commit hook rejects them. Fix them minimally, then commit.

**Files:**
- Modify: `apps/umdzidzisi/admin/src/app/pages/placeholder-page.component.ts`
- Modify: `apps/umdzidzisi/admin/src/app/layouts/dashboard-layout.component.ts`
- Modify: `apps/umdzidzisi/admin/src/app/config/navigation.config.ts`

**Interfaces:** Consumes/produces nothing new — purely making existing files lint-clean.

- [ ] **Step 1: Fix `placeholder-page.component.ts`** — switch to `inject()`, add accessibility modifiers + types:

```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
// ...@Component decorator unchanged...
export class PlaceholderPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  protected readonly pageTitle: string =
    this.route.snapshot.data['title'] || 'Page';
  protected readonly currentRoute: string = window.location.pathname;
}
```

- [ ] **Step 2: Fix `dashboard-layout.component.ts`** — add accessibility modifiers, types, and a `void` return on `logout()`. Give the config arrays explicit types (`TreeNavNode[]`). The `router` is `private readonly router: Router = inject(Router)`. `railConfig`/`railFooterConfig`/`navConfig`/`navConfig2` → `protected readonly` with explicit types (`TreeNavNode[]` / `TreeNavConfig`). `logout(): void`.

- [ ] **Step 3: Fix `navigation.config.ts`** — the `USER_MENU_CONFIG` logout `action` uses `console.log`. Replace the arrow body so it has an explicit `: void` return type and no `console.log`:

```ts
    action: (): void => {
      // Logout handled by the layout component wiring.
    },
```

- [ ] **Step 4: Lint, then commit**

```bash
pnpm nx lint umdzidzisi-admin        # expect: clean
git add apps/umdzidzisi/admin/src/app/config apps/umdzidzisi/admin/src/app/layouts apps/umdzidzisi/admin/src/app/pages
git commit -m "feat(umdzidzisi-admin): dashboard layout scaffolding baseline"
```

Expected: the pre-commit hook passes (no ESLint errors) and the commit lands. If the hook still bounces, read its output and fix the named rule before retrying.

---

### Task 1: Dashboard types + placeholder data

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/dashboard.types.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: interfaces `Delta`, `KpiSummary`, `StatMetric`, `TimeSeries`, `SubjectRank`, `BoardRow`; and const `DASHBOARD_DATA` of type `DashboardData` holding all placeholder values.

- [ ] **Step 1: Create the types + data file**

```ts
// apps/umdzidzisi/admin/src/app/dashboard/dashboard.types.ts

/** Direction + magnitude of a period-over-period change. */
export interface Delta {
  /** Signed percentage, e.g. 8.2 or -3.1. */
  pct: number;
  /** Optional absolute change, e.g. +947. */
  abs?: number;
}

/** The signature hero metric. */
export interface KpiSummary {
  label: string;
  value: number;
  delta: Delta;
  previous: number;
  period: string;
}

/** A small stat tile with an inline sparkline. */
export interface StatMetric {
  label: string;
  value: number;
  /** Optional unit/suffix, e.g. '%'. */
  suffix?: string;
  delta: Delta;
  series: number[];
}

/** A named series for the bar chart tab switcher. */
export interface TimeSeries {
  key: string;
  label: string;
  points: number[];
  categories: string[];
}

/** A ranked subject row with a percentage share. */
export interface SubjectRank {
  label: string;
  value: number;
  pct: number;
}

/** A row in the examination-boards leaderboard. */
export interface BoardRow {
  board: string;
  level: string;
  candidates: number;
  passRate: number;
  delta: Delta;
}

export interface DashboardData {
  hero: KpiSummary;
  stats: StatMetric[];
  activity: TimeSeries[];
  subjects: SubjectRank[];
  boards: BoardRow[];
}

/**
 * Hardcoded placeholder data. Structured so a future service swap replaces
 * this const with an injected data source without touching components.
 */
export const DASHBOARD_DATA: DashboardData = {
  hero: {
    label: 'Active learners',
    value: 12480,
    delta: { pct: 8.2, abs: 947 },
    previous: 11533,
    period: 'This term',
  },
  stats: [
    {
      label: 'Exams in progress',
      value: 38,
      delta: { pct: 0 },
      series: [22, 26, 24, 30, 28, 34, 38],
    },
    {
      label: 'Active subscriptions',
      value: 2914,
      delta: { pct: 4.6 },
      series: [2600, 2650, 2710, 2760, 2800, 2870, 2914],
    },
    {
      label: 'Pass rate',
      value: 74,
      suffix: '%',
      delta: { pct: 2.1 },
      series: [69, 70, 71, 70, 72, 73, 74],
    },
  ],
  activity: [
    {
      key: 'enrollments',
      label: 'Enrollments',
      points: [420, 510, 480, 640, 720, 690, 810, 940],
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    },
    {
      key: 'exams',
      label: 'Exams',
      points: [18, 24, 22, 30, 28, 34, 33, 38],
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    },
    {
      key: 'passes',
      label: 'Passes',
      points: [300, 360, 340, 470, 540, 500, 610, 700],
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    },
  ],
  subjects: [
    { label: 'Mathematics', value: 1842, pct: 38 },
    { label: 'English', value: 1357, pct: 27 },
    { label: 'Sciences', value: 918, pct: 19 },
    { label: 'History', value: 412, pct: 9 },
    { label: 'Geography', value: 331, pct: 7 },
  ],
  boards: [
    { board: 'Cambridge IGCSE', level: 'O-Level', candidates: 4210, passRate: 76, delta: { pct: 3.4 } },
    { board: 'ZIMSEC', level: 'A-Level', candidates: 3880, passRate: 71, delta: { pct: 1.9 } },
    { board: 'Edexcel', level: 'O-Level', candidates: 2140, passRate: 69, delta: { pct: -1.2 } },
    { board: 'Cambridge International AS', level: 'A-Level', candidates: 1670, passRate: 73, delta: { pct: 2.5 } },
  ],
};
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm nx build umdzidzisi-admin`
Expected: builds clean (file is not yet imported anywhere, so this just confirms no TS syntax errors). If build is slow, instead run `npx tsc --noEmit -p apps/umdzidzisi/admin/tsconfig.app.json` and expect no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/dashboard.types.ts
git commit -m "feat(umdzidzisi-admin): dashboard data types + placeholder data"
```

---

### Task 2: Chart geometry helpers (pure functions, TDD)

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/chart-geometry.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/chart-geometry.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `sparklinePath(series: number[], width: number, height: number): string` — returns an SVG `path` `d` string (polyline) mapping the series into the box, y-inverted (higher value = higher on screen). Single-point or empty series returns `''`.
  - `barLayout(points: number[], width: number, height: number, gap?: number): { x: number; y: number; w: number; h: number }[]` — returns one rect per point, bars sharing equal width with `gap` px between, heights proportional to value against the series max, anchored to the bottom. Empty series returns `[]`.

- [ ] **Step 1: Write the failing tests**

```ts
// apps/umdzidzisi/admin/src/app/dashboard/chart-geometry.spec.ts
import { sparklinePath, barLayout } from './chart-geometry';

describe('sparklinePath', () => {
  it('returns empty string for empty or single-point series', () => {
    expect(sparklinePath([], 100, 20)).toBe('');
    expect(sparklinePath([5], 100, 20)).toBe('');
  });

  it('maps first and last points to the box edges, y-inverted', () => {
    const d = sparklinePath([0, 10], 100, 20);
    // first point at x=0, min value -> bottom (y=20); last at x=100, max -> top (y=0)
    expect(d).toBe('M 0 20 L 100 0');
  });

  it('places a flat series along the vertical midline', () => {
    const d = sparklinePath([5, 5, 5], 100, 20);
    // flat -> all at mid height (10)
    expect(d).toBe('M 0 10 L 50 10 L 100 10');
  });
});

describe('barLayout', () => {
  it('returns empty array for empty series', () => {
    expect(barLayout([], 100, 40)).toEqual([]);
  });

  it('produces one full-height bar for the max value, anchored to bottom', () => {
    const bars = barLayout([10], 100, 40, 0);
    expect(bars).toEqual([{ x: 0, y: 0, w: 100, h: 40 }]);
  });

  it('scales bar heights proportionally to the series max', () => {
    const bars = barLayout([5, 10], 100, 40, 0);
    expect(bars[0]).toEqual({ x: 0, y: 20, w: 50, h: 20 }); // half height
    expect(bars[1]).toEqual({ x: 50, y: 0, w: 50, h: 40 }); // full height
  });

  it('applies the gap between bars', () => {
    const bars = barLayout([10, 10], 100, 40, 10);
    // total gap = 10 * (2-1) = 10, so each bar w = (100-10)/2 = 45
    expect(bars[0].w).toBe(45);
    expect(bars[1].x).toBe(55);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — `chart-geometry.ts` does not exist / functions undefined.

- [ ] **Step 3: Implement the helpers**

```ts
// apps/umdzidzisi/admin/src/app/dashboard/chart-geometry.ts

/**
 * Build an SVG path `d` for a sparkline polyline that fills the given box.
 * Values are y-inverted (larger value = higher on screen). A flat series
 * sits on the vertical midline. Empty/single-point series returns ''.
 */
export function sparklinePath(series: number[], width: number, height: number): string {
  if (series.length < 2) {
    return '';
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min;
  const stepX = width / (series.length - 1);
  const points = series.map((value, i) => {
    const x = i * stepX;
    const ratio = span === 0 ? 0.5 : (value - min) / span;
    const y = height - ratio * height;
    return `${x} ${y}`;
  });
  return `M ${points[0]} ${points
    .slice(1)
    .map((p) => `L ${p}`)
    .join(' ')}`;
}

export interface BarRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Lay out proportional, bottom-anchored bars across the box. Bars share equal
 * width with `gap` px between them; heights are proportional to the series max.
 * Empty series returns [].
 */
export function barLayout(points: number[], width: number, height: number, gap = 8): BarRect[] {
  if (points.length === 0) {
    return [];
  }
  const max = Math.max(...points);
  const totalGap = gap * (points.length - 1);
  const barWidth = (width - totalGap) / points.length;
  return points.map((value, i) => {
    const ratio = max === 0 ? 0 : value / max;
    const h = ratio * height;
    const x = i * (barWidth + gap);
    return { x, y: height - h, w: barWidth, h };
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS (all 7 assertions green).

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/chart-geometry.ts apps/umdzidzisi/admin/src/app/dashboard/chart-geometry.spec.ts
git commit -m "feat(umdzidzisi-admin): sparkline + bar chart geometry helpers"
```

---

### Task 3: SparklineComponent

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/sparkline.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/sparkline.component.spec.ts`

**Interfaces:**

- Consumes: `sparklinePath` from `../chart-geometry`.
- Produces: `SparklineComponent`, selector `app-sparkline`, inputs `series = input.required<number[]>()`, `tone = input<'up' | 'down' | 'neutral'>('neutral')`, `width = input(96)`, `height = input(28)`.

- [ ] **Step 1: Write the failing test**

```ts
// sparkline.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { SparklineComponent } from './sparkline.component';

describe('SparklineComponent', () => {
  it('renders an svg path for a multi-point series', async () => {
    const fixture = TestBed.createComponent(SparklineComponent);
    fixture.componentRef.setInput('series', [1, 5, 3, 8]);
    await fixture.whenStable();
    fixture.detectChanges();
    const path = fixture.nativeElement.querySelector('path');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d')?.startsWith('M ')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// sparkline.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { sparklinePath } from '../chart-geometry';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()" fill="none" aria-hidden="true" class="overflow-visible">
      <path [attr.d]="d()" [attr.stroke]="stroke()" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
})
export class SparklineComponent {
  readonly series = input.required<number[]>();
  readonly tone = input<'up' | 'down' | 'neutral'>('neutral');
  readonly width = input(96);
  readonly height = input(28);

  protected readonly d = computed(() => sparklinePath(this.series(), this.width(), this.height()));

  protected readonly stroke = computed(() => {
    switch (this.tone()) {
      case 'up':
        return 'var(--color-success, #16a34a)';
      case 'down':
        return 'var(--color-error, #dc2626)';
      default:
        return 'var(--theme-primary-color)';
    }
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/sparkline.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/sparkline.component.spec.ts
git commit -m "feat(umdzidzisi-admin): SVG sparkline component"
```

---

### Task 4: StatTileComponent

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/stat-tile.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/stat-tile.component.spec.ts`

**Interfaces:**

- Consumes: `SparklineComponent` (`app-sparkline`); `StatMetric`, `Delta` from `../dashboard.types`; Angular `DecimalPipe`.
- Produces: `StatTileComponent`, selector `app-stat-tile`, input `metric = input.required<StatMetric>()`.

- [ ] **Step 1: Write the failing test**

```ts
// stat-tile.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { StatTileComponent } from './stat-tile.component';
import { StatMetric } from '../dashboard.types';

const metric: StatMetric = {
  label: 'Pass rate',
  value: 74,
  suffix: '%',
  delta: { pct: 2.1 },
  series: [69, 70, 71, 74],
};

describe('StatTileComponent', () => {
  it('renders the label, value with suffix, and a sparkline', async () => {
    const fixture = TestBed.createComponent(StatTileComponent);
    fixture.componentRef.setInput('metric', metric);
    await fixture.whenStable();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Pass rate');
    expect(text).toContain('74');
    expect(text).toContain('%');
    expect(fixture.nativeElement.querySelector('app-sparkline')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// stat-tile.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SparklineComponent } from './sparkline.component';
import { StatMetric } from '../dashboard.types';

@Component({
  selector: 'app-stat-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SparklineComponent],
  template: `
    <div class="flex h-full flex-col justify-between rounded-xl border border-theme-border bg-white p-4">
      <div class="flex items-start justify-between gap-2">
        <span class="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
          {{ metric().label }}
        </span>
        @if (metric().delta.pct !== 0) {
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums" [class.text-success]="tone() === 'up'" [class.text-error]="tone() === 'down'"> {{ tone() === 'up' ? '▲' : '▽' }} {{ absPct() | number: '1.0-1' }}% </span>
        }
      </div>
      <div class="mt-2 flex items-end justify-between gap-2">
        <span class="text-2xl font-bold tabular-nums text-theme-text"> {{ metric().value | number }}{{ metric().suffix }} </span>
        <app-sparkline [series]="metric().series" [tone]="tone()" [width]="72" [height]="24" />
      </div>
    </div>
  `,
})
export class StatTileComponent {
  readonly metric = input.required<StatMetric>();

  protected readonly tone = computed<'up' | 'down' | 'neutral'>(() => {
    const pct = this.metric().delta.pct;
    if (pct > 0) return 'up';
    if (pct < 0) return 'down';
    return 'neutral';
  });

  protected readonly absPct = computed(() => Math.abs(this.metric().delta.pct));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/stat-tile.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/stat-tile.component.spec.ts
git commit -m "feat(umdzidzisi-admin): stat tile component"
```

---

### Task 5: KpiHeroComponent (signature element)

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/kpi-hero.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/kpi-hero.component.spec.ts`

**Interfaces:**

- Consumes: `KpiSummary` from `../dashboard.types`; Angular `DecimalPipe`.
- Produces: `KpiHeroComponent`, selector `app-kpi-hero`, input `kpi = input.required<KpiSummary>()`.

- [ ] **Step 1: Write the failing test**

```ts
// kpi-hero.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { KpiHeroComponent } from './kpi-hero.component';
import { KpiSummary } from '../dashboard.types';

const kpi: KpiSummary = {
  label: 'Active learners',
  value: 12480,
  delta: { pct: 8.2, abs: 947 },
  previous: 11533,
  period: 'This term',
};

describe('KpiHeroComponent', () => {
  it('renders the label, formatted value, delta pill and comparison line', async () => {
    const fixture = TestBed.createComponent(KpiHeroComponent);
    fixture.componentRef.setInput('kpi', kpi);
    await fixture.whenStable();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Active learners');
    expect(text).toContain('12,480');
    expect(text).toContain('8.2');
    expect(text).toContain('11,533');
    expect(text).toContain('This term');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// kpi-hero.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { KpiSummary } from '../dashboard.types';

@Component({
  selector: 'app-kpi-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="flex h-full flex-col justify-center rounded-xl border border-theme-border bg-white p-6">
      <span class="text-xs font-semibold uppercase tracking-wider text-theme-text-secondary">
        {{ kpi().label }}
      </span>
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <span class="text-5xl font-bold tabular-nums leading-none text-theme-text">
          {{ kpi().value | number }}
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-theme-primary px-2.5 py-1 text-sm font-semibold tabular-nums text-white">
          {{ up() ? '▲' : '▽' }} {{ absPct() | number: '1.0-1' }}%
          @if (kpi().delta.abs !== undefined) {
            <span class="opacity-80">+{{ kpi().delta.abs | number }}</span>
          }
        </span>
      </div>
      <p class="mt-3 text-sm tabular-nums text-theme-text-secondary">vs prev {{ kpi().previous | number }} · {{ kpi().period }}</p>
    </div>
  `,
})
export class KpiHeroComponent {
  readonly kpi = input.required<KpiSummary>();

  protected readonly up = computed(() => this.kpi().delta.pct >= 0);
  protected readonly absPct = computed(() => Math.abs(this.kpi().delta.pct));
}
```

Note: `bg-theme-primary` and `text-theme-text-secondary` are already defined in `tailwind.config.js` (`theme.extend.colors.theme.*`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/kpi-hero.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/kpi-hero.component.spec.ts
git commit -m "feat(umdzidzisi-admin): KPI hero component"
```

---

### Task 6: BarChartComponent (SVG + tab switcher)

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/bar-chart.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/bar-chart.component.spec.ts`

**Interfaces:**

- Consumes: `barLayout`, `BarRect` from `../chart-geometry`; `TimeSeries` from `../dashboard.types`.
- Produces: `BarChartComponent`, selector `app-bar-chart`, input `series = input.required<TimeSeries[]>()`; internal signal `activeKey` toggled by tab buttons; renders one `<rect>` per point of the active series.

- [ ] **Step 1: Write the failing test**

```ts
// bar-chart.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { TimeSeries } from '../dashboard.types';

const series: TimeSeries[] = [
  { key: 'a', label: 'A', points: [1, 2, 3], categories: ['x', 'y', 'z'] },
  { key: 'b', label: 'B', points: [4, 5], categories: ['p', 'q'] },
];

describe('BarChartComponent', () => {
  it('renders a rect per point of the first series and a tab per series', async () => {
    const fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('rect').length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(2);
  });

  it('switches series when a tab is clicked', async () => {
    const fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('rect').length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// bar-chart.component.ts
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { barLayout, BarRect } from '../chart-geometry';
import { TimeSeries } from '../dashboard.types';

const CHART_WIDTH = 520;
const CHART_HEIGHT = 180;

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full rounded-xl border border-theme-border bg-white p-5">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-theme-text">Enrollments over time</h3>
        <div class="flex gap-1 rounded-lg bg-theme-surface p-1">
          @for (s of series(); track s.key) {
            <button type="button" class="rounded-md px-3 py-1 text-xs font-medium transition-colors" [class.bg-theme-primary]="s.key === activeKey()" [class.text-white]="s.key === activeKey()" [class.text-theme-text-secondary]="s.key !== activeKey()" (click)="activeKey.set(s.key)">
              {{ s.label }}
            </button>
          }
        </div>
      </div>
      <svg class="mt-4 w-full" [attr.viewBox]="'0 0 ' + width + ' ' + height" [attr.height]="height" preserveAspectRatio="none" role="img" [attr.aria-label]="'Bar chart of ' + active().label">
        @for (bar of bars(); track $index) {
          <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h" rx="4" fill="var(--theme-primary-color)" [attr.opacity]="0.35 + (0.65 * ($index + 1)) / bars().length" />
        }
      </svg>
      <div class="mt-2 flex justify-between text-[10px] tabular-nums text-theme-text-secondary">
        @for (c of active().categories; track $index) {
          <span>{{ c }}</span>
        }
      </div>
    </div>
  `,
})
export class BarChartComponent {
  readonly series = input.required<TimeSeries[]>();
  protected readonly width = CHART_WIDTH;
  protected readonly height = CHART_HEIGHT;

  protected readonly activeKey = signal<string>('');

  protected readonly active = computed<TimeSeries>(() => {
    const all = this.series();
    return all.find((s) => s.key === this.activeKey()) ?? all[0];
  });

  protected readonly bars = computed<BarRect[]>(() => barLayout(this.active().points, CHART_WIDTH, CHART_HEIGHT, 10));
}
```

Note: `activeKey` defaults to `''`; `active()` falls back to the first series until a tab is clicked, so the first series renders on load. This is why the first-tab click test uses index 1 to force a change.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS (both specs).

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/bar-chart.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/bar-chart.component.spec.ts
git commit -m "feat(umdzidzisi-admin): SVG bar chart with tab switcher"
```

---

### Task 7: RankedListComponent

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/ranked-list.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/ranked-list.component.spec.ts`

**Interfaces:**

- Consumes: `SubjectRank` from `../dashboard.types`; Angular `DecimalPipe`.
- Produces: `RankedListComponent`, selector `app-ranked-list`, inputs `title = input('Top subjects')`, `items = input.required<SubjectRank[]>()`.

- [ ] **Step 1: Write the failing test**

```ts
// ranked-list.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { RankedListComponent } from './ranked-list.component';
import { SubjectRank } from '../dashboard.types';

const items: SubjectRank[] = [
  { label: 'Mathematics', value: 1842, pct: 38 },
  { label: 'English', value: 1357, pct: 27 },
];

describe('RankedListComponent', () => {
  it('renders a row per item with label, value and a percent bar', async () => {
    const fixture = TestBed.createComponent(RankedListComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Mathematics');
    expect(text).toContain('1,842');
    expect(text).toContain('38%');
    // one progress bar element per item
    expect(fixture.nativeElement.querySelectorAll('[data-bar]').length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// ranked-list.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SubjectRank } from '../dashboard.types';

@Component({
  selector: 'app-ranked-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="h-full rounded-xl border border-theme-border bg-white p-5">
      <h3 class="text-sm font-semibold text-theme-text">{{ title() }}</h3>
      <ul class="mt-4 space-y-3">
        @for (item of items(); track item.label) {
          <li>
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="flex items-center gap-2 text-theme-text">
                <span class="h-2 w-2 rounded-full bg-theme-primary" aria-hidden="true"></span>
                {{ item.label }}
              </span>
              <span class="tabular-nums text-theme-text-secondary"> {{ item.value | number }} · {{ item.pct }}% </span>
            </div>
            <div class="mt-1.5 h-1.5 w-full rounded-full bg-theme-surface">
              <div data-bar class="h-full rounded-full bg-theme-primary" [style.width.%]="item.pct"></div>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class RankedListComponent {
  readonly title = input('Top subjects');
  readonly items = input.required<SubjectRank[]>();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/ranked-list.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/ranked-list.component.spec.ts
git commit -m "feat(umdzidzisi-admin): ranked list component"
```

---

### Task 8: LeaderboardTableComponent

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/leaderboard-table.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/leaderboard-table.component.spec.ts`

**Interfaces:**

- Consumes: `BoardRow` from `../dashboard.types`; Angular `DecimalPipe`.
- Produces: `LeaderboardTableComponent`, selector `app-leaderboard-table`, input `rows = input.required<BoardRow[]>()`.

- [ ] **Step 1: Write the failing test**

```ts
// leaderboard-table.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { LeaderboardTableComponent } from './leaderboard-table.component';
import { BoardRow } from '../dashboard.types';

const rows: BoardRow[] = [
  { board: 'Cambridge IGCSE', level: 'O-Level', candidates: 4210, passRate: 76, delta: { pct: 3.4 } },
  { board: 'Edexcel', level: 'O-Level', candidates: 2140, passRate: 69, delta: { pct: -1.2 } },
];

describe('LeaderboardTableComponent', () => {
  it('renders a table row per board with candidates and pass rate', async () => {
    const fixture = TestBed.createComponent(LeaderboardTableComponent);
    fixture.componentRef.setInput('rows', rows);
    await fixture.whenStable();
    fixture.detectChanges();
    const bodyRows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(2);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Cambridge IGCSE');
    expect(text).toContain('4,210');
    expect(text).toContain('76%');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// leaderboard-table.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BoardRow } from '../dashboard.types';

@Component({
  selector: 'app-leaderboard-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="rounded-xl border border-theme-border bg-white p-5">
      <h3 class="text-sm font-semibold text-theme-text">Examination boards</h3>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-theme-text-secondary">
              <th class="pb-2 font-medium">Board</th>
              <th class="pb-2 font-medium">Level</th>
              <th class="pb-2 text-right font-medium">Candidates</th>
              <th class="pb-2 text-right font-medium">Pass rate</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.board) {
              <tr class="border-t border-theme-border">
                <td class="py-2.5 font-medium text-theme-text">{{ row.board }}</td>
                <td class="py-2.5 text-theme-text-secondary">{{ row.level }}</td>
                <td class="py-2.5 text-right tabular-nums text-theme-text">
                  {{ row.candidates | number }}
                </td>
                <td class="py-2.5 text-right tabular-nums">
                  <span class="text-theme-text">{{ row.passRate }}%</span>
                  <span class="ml-1 text-xs font-semibold" [class.text-success]="row.delta.pct >= 0" [class.text-error]="row.delta.pct < 0">
                    {{ row.delta.pct >= 0 ? '▲' : '▽' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LeaderboardTableComponent {
  readonly rows = input.required<BoardRow[]>();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/leaderboard-table.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/leaderboard-table.component.spec.ts
git commit -m "feat(umdzidzisi-admin): examination boards leaderboard table"
```

---

### Task 9: DashboardTopbarComponent

**Files:**

- Create: `apps/umdzidzisi/admin/src/app/dashboard/components/dashboard-topbar.component.ts`
- Test: `apps/umdzidzisi/admin/src/app/dashboard/components/dashboard-topbar.component.spec.ts`

**Interfaces:**

- Consumes: nothing (self-contained).
- Produces: `DashboardTopbarComponent`, selector `app-dashboard-topbar`, input `userName = input('Admin')`.

- [ ] **Step 1: Write the failing test**

```ts
// dashboard-topbar.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { DashboardTopbarComponent } from './dashboard-topbar.component';

describe('DashboardTopbarComponent', () => {
  it('renders a search input and the user name', async () => {
    const fixture = TestBed.createComponent(DashboardTopbarComponent);
    fixture.componentRef.setInput('userName', 'Tapiwa');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="search"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent as string).toContain('Tapiwa');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component**

```ts
// dashboard-topbar.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex items-center gap-3 pb-4">
      <label class="relative max-w-md flex-1">
        <span class="sr-only">Search</span>
        <i class="fi fi-rr-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary" aria-hidden="true"></i>
        <input type="search" placeholder="Search examinations, subjects, learners…" class="w-full rounded-full border border-theme-border bg-white py-2 pl-9 pr-4 text-sm text-theme-text placeholder:text-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary" />
      </label>
      <button type="button" class="grid h-9 w-9 place-items-center rounded-full border border-theme-border bg-white text-theme-text-secondary hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary" aria-label="Notifications">
        <i class="fi fi-rr-bell" aria-hidden="true"></i>
      </button>
      <div class="flex items-center gap-2">
        <span class="grid h-9 w-9 place-items-center rounded-full bg-theme-primary text-sm font-semibold text-white" aria-hidden="true">
          {{ initials() }}
        </span>
        <span class="hidden text-sm font-medium text-theme-text sm:inline">{{ userName() }}</span>
      </div>
    </header>
  `,
})
export class DashboardTopbarComponent {
  readonly userName = input('Admin');

  protected readonly initials = computed(() =>
    this.userName()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );
}
```

Note: icons use the Flaticon `fi fi-rr-*` classes already loaded via `index.html` (search + bell). In jsdom the font isn't loaded, but the classes render as empty `<i>` elements — the test only checks the search input and name.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/dashboard/components/dashboard-topbar.component.ts apps/umdzidzisi/admin/src/app/dashboard/components/dashboard-topbar.component.spec.ts
git commit -m "feat(umdzidzisi-admin): dashboard topbar with search"
```

---

### Task 10: Rewrite DashboardHomeComponent (orchestrator)

**Files:**

- Modify (full rewrite): `apps/umdzidzisi/admin/src/app/pages/dashboard-home.component.ts`
- Test (rewrite): `apps/umdzidzisi/admin/src/app/pages/dashboard-home.component.spec.ts` (create if absent)

**Interfaces:**

- Consumes: `DASHBOARD_DATA` from `../dashboard/dashboard.types`; all six presentational components + topbar from `../dashboard/components/*`.
- Produces: `DashboardHomeComponent` (selector unchanged: `app-dashboard-home`) — the route target in `app.routes.ts`, so no routing change.

- [ ] **Step 1: Write the failing test**

```ts
// dashboard-home.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { DashboardHomeComponent } from './dashboard-home.component';

describe('DashboardHomeComponent', () => {
  it('composes the hero, stat tiles, chart, ranked list, leaderboard and topbar', async () => {
    const fixture = TestBed.createComponent(DashboardHomeComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-dashboard-topbar')).toBeTruthy();
    expect(el.querySelector('app-kpi-hero')).toBeTruthy();
    expect(el.querySelectorAll('app-stat-tile').length).toBe(3);
    expect(el.querySelector('app-bar-chart')).toBeTruthy();
    expect(el.querySelector('app-ranked-list')).toBeTruthy();
    expect(el.querySelector('app-leaderboard-table')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test umdzidzisi-admin`
Expected: FAIL — new template not written; `app-kpi-hero` etc. not found.

- [ ] **Step 3: Rewrite the component**

```ts
// dashboard-home.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DASHBOARD_DATA } from '../dashboard/dashboard.types';
import { DashboardTopbarComponent } from '../dashboard/components/dashboard-topbar.component';
import { KpiHeroComponent } from '../dashboard/components/kpi-hero.component';
import { StatTileComponent } from '../dashboard/components/stat-tile.component';
import { BarChartComponent } from '../dashboard/components/bar-chart.component';
import { RankedListComponent } from '../dashboard/components/ranked-list.component';
import { LeaderboardTableComponent } from '../dashboard/components/leaderboard-table.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardTopbarComponent, KpiHeroComponent, StatTileComponent, BarChartComponent, RankedListComponent, LeaderboardTableComponent],
  template: `
    <div class="p-6">
      <app-dashboard-topbar userName="Umdzidzisi Admin" />

      <div class="mb-4 flex items-center justify-between gap-3">
        <h1 class="text-lg font-semibold text-theme-text">Overview</h1>
        <span class="rounded-full border border-theme-border bg-white px-3 py-1 text-xs text-theme-text-secondary">
          {{ data.hero.period }}
        </span>
      </div>

      <!-- Hero + KPI tiles -->
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <app-kpi-hero [kpi]="data.hero" />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          @for (stat of data.stats; track stat.label) {
            <app-stat-tile [metric]="stat" />
          }
        </div>
      </section>

      <!-- Chart + ranked list -->
      <section class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div class="lg:col-span-3">
          <app-bar-chart [series]="data.activity" />
        </div>
        <div class="lg:col-span-2">
          <app-ranked-list [items]="data.subjects" />
        </div>
      </section>

      <!-- Leaderboard -->
      <section class="mt-4">
        <app-leaderboard-table [rows]="data.boards" />
      </section>
    </div>
  `,
})
export class DashboardHomeComponent {
  protected readonly data = DASHBOARD_DATA;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test umdzidzisi-admin`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/pages/dashboard-home.component.ts apps/umdzidzisi/admin/src/app/pages/dashboard-home.component.spec.ts
git commit -m "feat(umdzidzisi-admin): compose redesigned dashboard home"
```

---

### Task 11: Sidebar polish — nav badge counts

**Files:**

- Modify: `apps/umdzidzisi/admin/src/app/config/navigation.config.ts`

**Interfaces:**

- Consumes: `TreeNavNode` (already imported) — the `badge` field already exists on the model.
- Produces: no new symbols; adds `badge` values to existing nav nodes. `navConfig2` in `dashboard-layout.component.ts` already sets `showBadges: true`, so badges render with no layout change.

- [ ] **Step 1: Add badges to nav + rail config**

In `UMDZIDZISI_ADMIN_NAV_CONFIG`, add `badge: '38'` to the `examinations` section node and `badge: '5'` to the `subscriptions` section node. Example edit for the examinations node:

```ts
  {
    id: 'examinations',
    label: 'Examinations',
    icon: 'fi fi-rr-graduation-cap',
    variant: 'section',
    expanded: true,
    badge: '38',
    children: [ /* unchanged */ ],
  },
```

And the subscriptions node:

```ts
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'fi fi-rr-credit-card',
    variant: 'section',
    badge: '5',
    children: [ /* unchanged */ ],
  },
```

- [ ] **Step 2: Verify it builds**

Run: `pnpm nx build umdzidzisi-admin`
Expected: builds clean.

- [ ] **Step 3: Commit**

```bash
git add apps/umdzidzisi/admin/src/app/config/navigation.config.ts
git commit -m "feat(umdzidzisi-admin): add nav badge counts to sidebar"
```

---

### Task 12: Full verification (build, lint, test, visual)

**Files:** none (verification only).

- [ ] **Step 1: Build, lint, and test the project**

Run:

```bash
pnpm nx build umdzidzisi-admin
pnpm nx lint umdzidzisi-admin
pnpm nx test umdzidzisi-admin
```

Expected: all three succeed. Fix any lint complaints about unused imports / modern-pattern violations inline, then re-run.

- [ ] **Step 2: Serve and drive the real app with Playwright MCP**

Run (background): `npm run umdzidzisi:admin`
Wait until `http://localhost:4200` and `http://localhost:4203/remoteEntry.json` both respond, then with Playwright MCP:

1. `mcp__playwright__browser_navigate` to `http://localhost:4200` → expect redirect to `/login?returnUrl=%2Fumdzidzisi-admin%2Fdashboard`.
2. Log in (use whatever dev credentials the login page accepts; if unknown, ask the user).
3. Confirm landing on `/umdzidzisi-admin/dashboard`.
4. `mcp__playwright__browser_snapshot` and verify present: topbar search input, KPI hero with `12,480` + delta pill, three stat tiles with sparklines, bar chart with three tab buttons, ranked subjects list with % bars, examination-boards table, and the left sidebar (rail + text tree) with badge counts on Examinations/Subscriptions.
5. Click a bar-chart tab (`Exams`) and confirm bars change.

- [ ] **Step 3: Responsive + accessibility spot-check**

Using `mcp__playwright__browser_resize`, check 375, 768, 1280 px:

- 375: KPI stacks 1-col, stat tiles stack, chart/list stack, table scrolls horizontally, sidebar off-canvas.
- 1280: two-column hero row, 3-col chart / 2-col list split.
  Tab through the topbar controls and confirm visible focus rings (they use `focus:ring-2 focus:ring-theme-primary`).

- [ ] **Step 4: Theme fidelity spot-check**

In the browser console via `mcp__playwright__browser_evaluate`, confirm the hero pill background resolves to the umdzidzisi purple:

```js
() => getComputedStyle(document.querySelector('app-kpi-hero span[class*="bg-theme-primary"]')).backgroundColor;
```

Expected: an `rgb(84, 74, 136)`-equivalent value (the `#544a88` primary). If it resolves to a fallback, the Tailwind `theme-primary` utility or CSS var wiring needs a fix.

- [ ] **Step 5: Stop the servers and commit any fixes**

```bash
npm run stop
git add -A && git commit -m "fix(umdzidzisi-admin): verification pass adjustments"   # only if fixes were needed
```

---

## Self-Review

**1. Spec coverage:**

- Hero KPI (Active learners, tabular number, delta pill, comparison line) → Task 5 ✓
- KPI stat row with sparklines → Tasks 3, 4 ✓
- Subject performance breakdown (ranked % bars) → Task 7 ✓
- Activity chart (SVG bars + tab switcher) → Tasks 2, 6 ✓
- Examinations leaderboard table → Task 8 ✓
- Topbar search → Task 9 ✓
- Orchestration + placeholder data + responsive grid → Tasks 1, 10 ✓
- Sidebar polish (badges) → Task 11 ✓
- Purple accent / no token change; tabular-nums; theme vars; no new deps → Global Constraints, enforced per component + Task 12 spot-checks ✓
- Verification (build/lint/test/visual/responsive/theme) → Task 12 ✓
- Brand chip / search "in topbar or sidebar header": realized as the topbar search (Task 9). The sidebar brand chip already exists in `SidebarLayoutComponent` and needs no change — noted, not a gap.

**2. Placeholder scan:** No TBD/TODO; every code step has full code. Task 11's "children unchanged" refers to code shown in Task-1-adjacent context and the existing file, and the exact nodes to edit are named with their surrounding fields — acceptable since it's a 2-line addition to an existing file the engineer has open.

**3. Type consistency:** `Delta`, `KpiSummary`, `StatMetric`, `TimeSeries`, `SubjectRank`, `BoardRow`, `DashboardData`, `DASHBOARD_DATA` defined in Task 1 and consumed with matching names/shapes in Tasks 4–10. `sparklinePath`/`barLayout`/`BarRect` defined in Task 2, consumed in Tasks 3 and 6. Component selectors (`app-sparkline`, `app-stat-tile`, `app-kpi-hero`, `app-bar-chart`, `app-ranked-list`, `app-leaderboard-table`, `app-dashboard-topbar`) match between definition and the orchestrator's queries/imports in Task 10. Consistent.
