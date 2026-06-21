# Full Agent Prompt: Convert parts-bin Into a Design System Repo

Use this prompt when handing the repo to an implementation agent.

```text
You are working in /Users/mcnellymac/Desktop/Projects/dashboard-theme.

Objective:
Turn parts-bin into a full design-system repository and reusable React component library first.

The current repo still presents itself too much like a dashboard starter. That is the problem. The dashboard, templates, accounts/MRR data, and customer-success screens can remain, but they must be clearly separated as examples built with the design system. They must not define the public API, catalog mental model, root docs framing, or agent instructions.

Primary product:
A domain-neutral, reusable React design system and component library with strong docs, examples, theme tokens, public barrels, tests, and verification.

Secondary surfaces:
Demo dashboards, templates, sample data, MRR/account examples, and assistant demos are allowed only as examples/proof surfaces. They should be clearly labeled and structurally separated from the design-system source.

Start by reading these files:
- AGENTS.md
- CLAUDE.md
- README.md
- package.json
- src/components/index.ts
- src/components/catalog.ts
- src/components/ui/index.ts
- src/components/charts/index.ts
- src/components/DataGrid/index.ts
- src/components/shell/index.ts
- src/components/maps/index.ts
- src/components/chat/index.ts
- src/components/templates/index.ts
- skills/add-component/SKILL.md
- skills/verify-changes/SKILL.md

Before editing:
- Run `git status --short --branch`.
- Preserve any existing user changes. Do not revert unrelated dirty files.
- Inspect the current public exports before moving or renaming anything.
- Treat this as a product-boundary refactor, not a visual redesign.

Core direction:
- Design system and component library first.
- Docs/catalog first.
- Domain-neutral public API.
- Demo dashboards and template dashboards clearly separated under examples/demo boundaries.
- No SaaS/account/MRR/Ledger language in public component APIs unless it is explicitly inside example/demo code.
- No data-domain swap workflow as the default agent path.

Non-goals:
- Do not delete the dashboards just because they are demo content.
- Do not rebuild the visual style from scratch.
- Do not make a marketing landing page.
- Do not add random components before fixing public API and docs boundaries.
- Do not leave broken imports, broken docs, or hidden demo leakage in root barrels.

Required final model:
The repo should communicate this hierarchy:

1. Design system
   - Theme tokens
   - UI primitives
   - Form controls
   - Overlays
   - Feedback/loading
   - Data display
   - DataGrid
   - Charts
   - Maps
   - Chat primitives
   - Shell/layout components
   - Catalog/docs

2. Examples
   - Dashboard examples
   - Account/MRR examples
   - Customer-success example
   - Recommendation-review example
   - App composer example
   - Demo assistant adapter and demo data

3. App shell for docs/examples
   - The local Vite app exists to view docs and examples.
   - It is not the product itself.

Preferred structure:
You may choose the smallest safe implementation path, but the structure must make the boundary obvious. A good target shape is:

src/
  components/
    ui/
    shell/
    charts/
    maps/
    DataGrid/
    chat/
    catalog.ts
    index.ts
  examples/
    accounts-dashboard/
    templates/
    assistant-demo/
    demo-data/
  app/
    routes or route wiring for docs/examples, if useful

If moving everything into `src/design-system/` would create too much churn, do not force that in one pass. It is acceptable to keep `src/components/` as the design-system source if demo/dashboard code is moved out of it or clearly demoted from public exports.

Public API rules:
- `src/components/index.ts` should export reusable design-system components only.
- Public barrels should not export account/MRR/demo-dashboard code.
- Demo-only imports can exist from example paths, but not from the root component-library API.
- Public type names should be domain-neutral.
- Prefer `DataGridColumn`, `DataGridState`, and `DataGridCellContext` over `LedgerGridColumn`, `LedgerGridState`, and `LedgerCellContext`. If renaming is too large for one pass, add neutral aliases first and plan a compatibility migration.

Things that should become demo-only or be wrapped as demo examples:
- AccountFormModal
- accountGridColumns
- ACCOUNT_GRID_INITIAL_STATE
- ACCOUNT_GRID_COLUMN_ORDER
- accountGlobalFilter
- buildAccountGridColumns
- statusTone for account lifecycle statuses
- useAccounts
- seedAccounts
- MRR/account selector examples
- createDemoAdapter when it depends on accounts/MRR
- buildAssistantDashboardEvidence when it depends on revenue movement/MRR
- generateAccounts if it returns account-shaped rows
- ledgerRegions / ledgerPoints / ledgerFlows demo map data
- AppComposerPage if it is a starter/demo surface rather than design-system docs

Things that should remain public design-system components:
- Button
- IconButton
- Input
- Textarea
- Select
- Combobox
- MultiSelect
- Checkbox
- RadioGroup
- Switch
- Slider
- DatePicker
- DateRangePicker
- Field
- Modal
- Drawer
- DropdownMenu
- ContextMenu
- CommandPalette
- Tabs
- Accordion
- Tag
- StatusBadge
- Badge-style primitives
- Banner
- InlineAlert
- Toast / ToastProvider / useToast
- Spinner
- Skeleton
- Loading animations, with neutral defaults
- EmptyState
- Progress
- Pagination
- Avatar / AvatarGroup / AssigneeChip if domain-neutral
- ActivityFeed / Timeline / AuditLogItem if domain-neutral
- DetailHeader / KeyValueList / DescriptionList / PropertyGrid / MetadataPanel
- Table
- Toolbar
- AppliedFiltersBar / FacetedFilter / FilterChip
- KpiCard / Sparkline if named and documented as generic metric display, not dashboard-only
- DataGrid and its public types/helpers
- Generic chart primitives
- Map components
- Chat primitives
- AppShell, Sidebar, TopNav, Breadcrumbs, SectionHeader, SettingsPanel, FilterBar, GlobalControls

Critical fixes:

1. Rewrite repo framing
   Update AGENTS.md, CLAUDE.md, README.md, package description, and relevant docs so they say:
   - parts-bin is a design system and component library.
   - dashboards/templates are examples.
   - `/docs` is the primary product surface.
   - `/examples` or clearly named example routes contain dashboard/template demos.
   - `swap-data-domain` is optional and secondary, not the default workflow.

2. Make docs the front door
   Prefer routing `/` to docs or making `/docs` clearly primary.
   The docs page should say "Components" or "Design system", not "Components and sample dashboard".
   Example dashboards should be linked as examples, not positioned as the main thing.

3. Clean public barrels
   Remove demo-only account/MRR exports from the aggregate component barrel.
   Keep demo exports behind an explicit examples/demo import path if needed.
   Update barrel tests so they enforce the design-system public surface, not dashboard exports.

4. Fix DataGrid reuse
   `DataGrid` has a `persistenceKey` prop, but persistence currently uses hard-coded account keys.
   Make persistence honor `persistenceKey`.
   Saved views should be keyed from the same namespace, e.g. `${persistenceKey}.views`.
   The default quick filter placeholder should be neutral, e.g. "Search rows...".
   CSV export filenames should be configurable or neutral, not `ledger-accounts.csv`.
   DataGrid examples can still show accounts, but only in demo/example files.

5. Neutralize chart library exports
   Public chart exports should be generic primitives or wrappers with generic data contracts.
   MRR-specific charts should become examples or demo wrappers.
   For example:
   - Generic share/donut chart public component
   - Generic line trend chart public component
   - Generic signed movement/stacked bar chart public component
   - Account/MRR chart wrappers under examples only

6. Neutralize catalog snippets
   Search `src/components/catalog.ts` for Accounts, account, MRR, ARR, churn, customer-success, dashboard, Ledger.
   Replace public component snippets with neutral examples:
   - "Projects"
   - "Workspaces"
   - "Records"
   - "Requests"
   - "Tasks"
   - "Items"
   - "Revenue" only when chart-specific and not MRR-specific
   Demo-specific entries may mention accounts only if they are clearly categorized as examples.

7. Improve docs depth
   `/docs` should be a real component-library reference:
   - component purpose
   - import path
   - props
   - variants
   - controlled/uncontrolled notes where relevant
   - accessibility/keyboard notes where relevant
   - live examples for important components
   - state examples: default, hover/focus if practical, disabled, loading, empty, error
   - near-twin guidance
   - copy-paste snippets

8. Separate examples
   Move or clearly label:
   - Account/MRR dashboard
   - Settings/Login/AppComposer examples if they remain full-page starters
   - Demo assistant behavior that reads account data
   - Demo map data named `ledger*`

   The examples should import from the design system, not the other way around.

9. Keep theme rules intact
   Do not introduce raw colors outside `src/theme/`.
   Use token-backed utilities only.
   If a new visual primitive needs color, add/derive a token in `src/theme/`.
   Keep `npm run lint:theme` meaningful.

10. Preserve existing component quality
   The repo already has many useful components and tests. Do not flatten or simplify them unnecessarily.
   Prefer moving, renaming, aliasing, and documenting over rewriting.

Suggested implementation order:

Phase 1: repo framing and agent instructions
- Update CLAUDE.md.
- Update AGENTS.md.
- Update README.md.
- Update package description.
- Make the default workflow component-library-oriented.

Phase 2: public API boundary
- Audit public barrels.
- Remove or demote demo-only exports.
- Add explicit example/demo barrels if useful.
- Update barrel tests.
- Add neutral aliases for public DataGrid type names if needed.

Phase 3: example separation
- Move account/MRR grid columns, account form modal, account demo data, account selectors usage, demo assistant account adapter, and account dashboard wiring into an examples/demo boundary.
- Keep behavior working.
- Avoid breaking routes; if routes change, provide redirects or clear navigation.

Phase 4: DataGrid generic cleanup
- Honor `persistenceKey`.
- Namespace saved views by grid key.
- Neutralize default copy and filenames.
- Ensure multiple grids can persist independently.
- Add tests for independent persistence keys.

Phase 5: chart cleanup
- Introduce generic public chart components.
- Move MRR-specific wrappers to examples.
- Update catalog and docs to show generic chart data contracts.

Phase 6: docs/catalog productization
- Make `/docs` the primary surface.
- Rewrite catalog snippets to be neutral.
- Add live demos for major components currently represented by placeholders.
- Add docs sections for component states, accessibility, and import strategy.

Phase 7: verification
- Run targeted tests as you touch areas.
- Then run:
  - npm run lint
  - npm run lint:theme
  - npm run build
  - npm test
  - npm run test:e2e only if route/layout/browser behavior changed

Acceptance criteria:
- A new agent opening the repo understands it is a design-system/component-library repo.
- The root docs do not present "swap demo data into a dashboard" as the main path.
- The public component API is domain-neutral.
- Dashboard/template/account/MRR code exists only in examples/demo areas.
- `/docs` is the obvious product surface.
- Catalog snippets use neutral examples unless the entry is explicitly demo-only.
- DataGrid can be reused by any domain without writing to account-specific storage keys.
- Public chart exports are generic, with MRR/account charts only as examples.
- Existing demo dashboards still work as examples.
- Theme lint and build remain green.

Final response requirements:
- Summarize the structural boundary you created.
- List any intentionally retained compatibility aliases.
- List commands run and outcomes.
- Call out any remaining dashboard/demo leakage with exact files if not completed.
- Do not claim this is done unless the verification gates above pass or you clearly state what could not be run.
```
