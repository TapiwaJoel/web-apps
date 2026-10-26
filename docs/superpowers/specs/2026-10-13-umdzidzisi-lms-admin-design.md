# Design + Plan: Umdzidzisi admin UI for the learning-management-service

## Context

The learning-management-service (LMS) API client and its 14 signal stores now exist in `libs/api`,
but the umdzidzisi admin (`apps/umdzidzisi/admin`) has no real pages for them. Every Examinations,
Subjects and Subscriptions nav item still routes to `PlaceholderPageComponent`. The goal is a full admin
UI for the LMS inside the umdzidzisi admin. It should reuse the CRUD pattern proven in the insurance
admin and fix the client bugs found while checking the backend.

Decisions confirmed with the user:

- **Navigation:** flat list page per resource, with parent columns, parent filters, and drawer links to
  child lists (no nested routes).
- **CMS fields:** real content-management pickers for images, articles and questions, not raw ID inputs.
- **Scope:** everything. That's 13 managed resources plus a read-only subscriptions list.

## Backend facts that shape the UI

- **Endpoints:** every resource has only `POST /`, `PATCH /:id` and `GET /`. There's no DELETE and no
  GET-by-id, so a "delete" is a status change in the drawer. Subscriptions are GET-only for admins; they're
  created by learners, and no cancel endpoint is exposed.
- **Pagination:** sent as `X-Page/X-Limit/X-Sort-By/X-Sort-Order` **headers**. Responses carry only parent
  IDs, so pages resolve names through other stores (the comprehensive-rates pattern).
- **Status enums differ per resource:**
  - Boards and levels: `CountryStatus` (Active/Inactive).
  - Grades, examinations, papers, grading systems and scales, profiles and plans: `EntityStatus`.
  - Subjects, topics and sub-topics: `ContentStatus` (Draft/Published/Archived, default Draft).
  - Sub-topics also have `AccessLevel` (Free/Paid).
  - Assessments: `AssessmentStatus` (DRAFT/PUBLISHED/ARCHIVED).
  - Subscriptions: `SubscriptionStatus`.
- **Validation for forms to mirror:**
  - Uniqueness:
    - board (name, country)
    - level (name, board)
    - grade name and `displayOrder` per level
    - subject name and code per (level, board)
    - topic name and `order` per (subject, grade)
    - sub-topic name per topic, and an article linked at most once per topic
    - scale symbol per system
    - plan name is global, and plan (level, currency, cycle) is also unique
  - Grading scales: 0–100, and ranges may not overlap within a system. The server doesn't check
    min ≤ max, so the UI must.
  - Profiles: Student requires level and grade. Tutor requires bio and can only edit bio.
  - The API can't unlink a sub-topic's article; `null` is ignored.
- **Assessment questions** are CMS Question references: `{questionId, marks, timeAllowed, order,
sectionLabel?, questionNumber?}`. PATCH replaces the whole array. The paper's
  `numberOfQuestions`/`marks` aren't enforced, so show a soft warning.

## Phase 0: API client fixes in `libs/api` (done by me, sequentially, first)

1. **Header pagination.** Change all 14 LMS services' `list(query, page: HeaderPaginationParams = {})` to
   send `buildPaginationHeaders(page)`, matching `insurance-service/services/vehicle-types.service.ts`.
   - Drop `extends PaginationParams` from the LMS `Get*QueryDto`s.
   - Assessments keep their own `limit/offset/sortBy/sortOrder` query params, because that's what the
     backend reads.
   - Update each store's `loadX(query?, page?)` signature and `isLoadAll` check to the insurance shape.
2. **Subscriptions list shape.** Add `SubscriptionsListResponseDto`
   `{subscriptions, totalCount, page, limit, totalPages, hasNextPage, hasPrevPage}`. Then:
   - `SubscriptionsService.list` returns it.
   - `SubscriptionsStore` reads `result.subscriptions`. The store currently reads `.docs`, which is
     undefined, so it would crash.
   - Add a `populate?: boolean` pass-through.
3. **Content-management stores (user request).** Add
   `libs/api/src/lib/content-management-service/store/<resource>/`, built the same way as the LMS stores
   (state type, store, index, `store/index.ts` barrel, and `export * from './store'` in the service's
   index). Names follow the ngrx-signal-store skill §1:
   - **articles, questions, live-streams:** `loadX` / `createX` / `updateX`. Articles and live-streams use
     the insurance-style `(query?, page?)`. Questions keep their single-arg `list`, unless the audit in
     step 4 finds the backend reads headers.
   - **resources:** `loadResources` / `uploadResources` (↔ `upload`) / `removeResource` (↔ `remove`,
     which drops the resource from state). `getContent` stays on the service.
   - **comments:** `loadComments(query, page?)` takes a required query, so there's no load-all guard and
     results merge by `_id`. Plus `createComment` and `updateComment`.
   - **content-progress:** `loadContentProgress` / `createContentProgress` /
     `updateContentProgress(contentId, systemUserId, dto)` / `removeContentProgress`.
   - **reactions:** `loadReactions(query)` (a plain array, not paginated) / `addOrToggleReaction` /
     `removeReaction` / `loadReactionTypes` (load once, kept in state). `counts` stays on the service.

   The CMS pickers in Phase 1 then use `ArticlesStore`, `QuestionsStore` and `ResourcesStore`.
   Three subagents will write these in parallel (articles + questions + live-streams, resources +
   comments, content-progress + reactions), each owning only its own folders.

4. **DTO audit.** Diff every LMS request/response DTO against the backend
   `libs/commons-lib/src/lib/dtos/learning-management/**`, plus subscriptions and plans under
   `dtos/payment-gateway/subscriptions`. Fix field names, optionality and enums, e.g. board and level
   `status` should be `CountryStatus`, and plans need the virtual `examinationBoardId`. Do the same
   for the CMS client against `apps/content-management-service` (check pagination style and response
   shapes). One general agent runs this audit and applies the fixes in parallel with the store agents.
   It runs **before** the store agents only where a store depends on a changed signature.

## Phase 1: shared scaffolding in umdzidzisi admin (done by me, before any page agents start)

- **Routes** (`app.routes.ts`): replace the placeholders. Each resource gets `'<path>'` + `'<path>/:id'`,
  both pointing at the page component (the insurance routed-drawer pattern). Component names are fixed
  upfront so agents just create them: `pages/<resource>/<resource>.component.ts` →
  `<Pascal>Component`.
- **Navigation** (`config/navigation.config.ts`): rail, tree, and remove the hardcoded badges:
  - Dashboard
  - **Curriculum:** Examination Boards, Educational Levels, Grades, Subjects, Topics, Sub-topics
  - **Examinations:** Examinations, Papers, Assessments, Grading Systems, Grading Scales
  - **Subscriptions:** Plans, Subscriptions
  - **People:** Learner Profiles, Users, Roles
  - Profile
  - Also update the global-search scopes in `dashboard/components/search-scope.model.ts` to match.
- **Shared types and helpers** (`src/app/shared/`, one type per file, kebab-case, matching insurance's
  `shared/types/`):
  - `lms-status-tones.const.ts`, which maps every LMS status enum to `StatusTone` for
    `StatusPillComponent`. Reuse `ENTITY_STATUS_TONES` from `@mushaviri/ui` for `EntityStatus`.
  - Option-list consts for the enums, used by selects.
  - A `country-options.const.ts` for the board country select (ISO codes).
- **CMS pickers** (`src/app/shared/components/`), presentational and using CMS services from
  `@mushaviri/api` directly:
  - `cms-image-picker`: upload via `ResourcesService.upload`, or pick from `ResourcesService.list`.
    Emits a resource ID and shows a preview via `getContent`.
  - `article-picker`: searches `ArticlesService.list` and emits an `articleId`.
  - `question-picker`: searches `QuestionsService.list` (multi-select) and emits question IDs for the
    assessment question builder.
- **Placeholder page.** Keep it only for `settings`, and switch its hardcoded gray Tailwind classes to
  theme tokens.

## Phase 2: pages, built by 5 parallel subagents that each own only their page folders

Every page follows `apps/insurance/admin/src/app/pages/vehicle-types/*` (list component, create dialog,
routed detail drawer). For relationships, follow `pages/comprehensive-rates/*`: inject the parent stores,
build `Map<id,name>` computeds, use parent `<select>`s, and filter cascading selects.

**Common page features:**

- Signal pipeline: filter → global search → sort → paginate, using `@mushaviri/util` predicates and
  `GlobalSearchService`.
- `KpiStatCardComponent` with counts by status.
- Filter popover that includes parent filters.
- Read query params (e.g. `?subjectId=`) into the initial filters, so drawer links like "View topics →"
  land on a pre-filtered list.
- Empty, loading and error states, and `NotificationService` toasts.
- **The drawer edits all mutable fields, including a status select.** This is new compared with
  insurance, and it's how archive/deactivate works.
- Theme tokens only, no hardcoded colours, and dark-mode safe.
- SCSS only, no `.spec.ts` files.

**Agent briefs.** Each loads `frontend-design`, `angular-modern-patterns`, `angular-class-organization`
and `ngrx-signal-store`.

| Agent                   | Pages                                          | Special handling                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: Curriculum roots     | examination-boards, educational-levels, grades | Board country select; grades sorted by `displayOrder`                                                                                                                                                                                                                                                                        |
| B: Curriculum content   | subjects, topics, sub-topics                   | Subject image via `cms-image-picker`; topic cascades subject → grade (same level); sub-topic article via `article-picker`, access level, learning objectives, duration, and order                                                                                                                                            |
| C: Exams & grading      | examinations, grading-systems, grading-scales  | Examination cascades board → level; scales show a 0–100 range bar per system, with min ≤ max and overlap validation on the client                                                                                                                                                                                            |
| D: Papers & assessments | examination-papers, assessments                | Paper type enum; assessment drawer has a question builder (question-picker, marks, time, order, section label) with a total-marks vs paper-marks warning, plus a status select                                                                                                                                               |
| E: Commercial & people  | subscription-plans, subscriptions, profiles    | Plan currency, billing cycle and grace period; subscriptions are read-only, loaded with `populate=true`, with status and date filters; profiles use a type-dependent form (Student needs level + grade, Tutor needs bio), and create is limited to Admin profiles since learners self-register, but every type can be edited |

## Phase 3: e2e (Playwright, `apps/e2e/umdzidzisi/admin/src/`)

There will be one spec per area: `curriculum.spec.ts`, `examinations.spec.ts`, `assessments.spec.ts` and
`subscriptions.spec.ts`. Each reuses the `stubGateway(page)` approach from `user-management.spec.ts` to
stub the LMS and CMS endpoints. They assert that each list renders stubbed rows with resolved parent
names, that the create dialog opens, that the `:id` drawer opens, and that list requests carry
`X-Page`/`X-Limit` headers. One more case checks that a pre-filtered child link works. The specs will
be written by one subagent after Phase 2.

## Also

- Write this design to `docs/superpowers/specs/2026-10-13-umdzidzisi-lms-admin-design.md`, per the
  brainstorming skill. I won't commit unless asked.
- Out of scope:
  - The dashboard's static charts stay as they are; the backend has no analytics endpoints.
  - Unlinking an article, cancelling a subscription and reordering by drag would all need backend
    changes. I'll list them as follow-ups.

## Verification

- Phases depend on each other: Phase 0 (client fixes, the audit and the CMS stores) must pass
  `tsc`/lint before Phase 1, and Phase 1 must be in place before the Phase 2 page agents start.
- `npm exec nx lint api`, `npm exec nx lint umdzidzisi-admin`, `npm exec nx build umdzidzisi-admin`, and
  `npx tsc -p libs/api/tsconfig.lib.json --noEmit`.
- `npm exec nx e2e umdzidzisi-admin-e2e` (chromium) for the new specs plus the existing ones.
- Manual check: serve the shell in its umdzidzisi config together with umdzidzisi-admin on :4203, open
  `/umdzidzisi-admin` against the local nginx staging stack (`api.mushaviri.com:8443`), and walk through
  Board → Level → Subject → Topic → Sub-topic creation in both light and dark mode. Confirm the pagination
  headers in the network panel.
- Run a final code review (`pr-review-toolkit:code-reviewer`) over the diff.
