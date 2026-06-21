# AGENTS.md

Agent guidance for this repo. **Read [CLAUDE.md](./CLAUDE.md) first** — it is the canonical source for the project overview, commands, the design-system boundary, example data flow, persistence ownership, and gotchas. This file adds only the agent-specific rules not covered there.

## Skills

Step-by-step workflows for the most common tasks live in `skills/` (open Agent Skills format). If your tool doesn't auto-load skills, read the linked file before starting that kind of task:

| Skill | Use when | File |
|---|---|---|
| `retheme` | Re-skinning to a new brand: colors, dark mode, radii, fonts, chart palette | [skills/retheme/SKILL.md](./skills/retheme/SKILL.md) |
| `swap-data-domain` | Optional example-dashboard workflow: replacing the demo accounts/MRR data with another domain | [skills/swap-data-domain/SKILL.md](./skills/swap-data-domain/SKILL.md) |
| `add-component` | Adding or substantially modifying any UI component | [skills/add-component/SKILL.md](./skills/add-component/SKILL.md) |
| `verify-changes` | Before claiming any change is done, fixed, or passing | [skills/verify-changes/SKILL.md](./skills/verify-changes/SKILL.md) |

(Claude Code discovers these automatically via thin pointers in `.claude/skills/`.)

## Building UI

Read `src/components/catalog.ts` before adding public UI (see CLAUDE.md -> "Component catalog"). `/docs` is the primary product surface. Do not add a root-exported component without a `CATALOG` entry — `npm run build` and `src/components/catalog.test.ts` enforce it. Dashboard/account/template code is example code unless it is explicitly exported from the design-system barrels.

## DataGrid UI rules

- Header cells should show vertical separators between columns.
- Header controls are progressive disclosure: sort indicators, column-menu triggers, and resize handles stay hidden until the header is hovered or focused.
- Column menu triggers use a vertical ellipsis (`⋮`), not horizontal dots.
- Don't show a separate grab-target icon in headers. The header cell itself is the drag/sort affordance and shows a pointer cursor on hover when interactive.
- The inline per-column filter row is hidden by default; show it only via the toolbar `Filters` toggle.
- Column menus must stay inside the viewport on narrow layouts (fixed positioning with clamped coordinates) — don't revert them to absolutely positioned children of the scroll container.
- Keep row and column controls accessible by keyboard/focus, not only mouse hover.

## Verification

Use risk-scaled verification, not the full suite by default. When the user asks for a specific component or narrow UI fix, run that component's colocated test file and any directly affected catalog/barrel test only if exports or catalog metadata changed. Run `npm run lint:theme` only when styling or theme tokens changed, and run `npm run build` when TypeScript contracts, exports, catalog props, package entrypoints, or public APIs changed. Reserve `npm test`, `npm run lint`, and `npm run test:e2e` for cross-cutting behavior, shared utilities, DataGrid infrastructure, release/package work, or when the user explicitly asks for broad verification. For layout-sensitive UI changes, use a focused browser/Playwright check at the viewport where the issue was reported.
