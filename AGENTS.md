# AGENTS.md

Agent guidance for this repo. **Read [CLAUDE.md](./CLAUDE.md) first** — it is the canonical source for the project overview, commands, the swappable-theme boundary, data flow, persistence ownership, and gotchas. This file adds only the agent-specific rules not covered there.

## Skills

Step-by-step workflows for the most common tasks live in `skills/` (open Agent Skills format). If your tool doesn't auto-load skills, read the linked file before starting that kind of task:

| Skill | Use when | File |
|---|---|---|
| `retheme` | Re-skinning to a new brand: colors, dark mode, radii, fonts, chart palette | [skills/retheme/SKILL.md](./skills/retheme/SKILL.md) |
| `swap-data-domain` | Replacing the demo accounts/MRR data with your own domain | [skills/swap-data-domain/SKILL.md](./skills/swap-data-domain/SKILL.md) |
| `add-component` | Adding or substantially modifying any UI component | [skills/add-component/SKILL.md](./skills/add-component/SKILL.md) |
| `verify-changes` | Before claiming any change is done, fixed, or passing | [skills/verify-changes/SKILL.md](./skills/verify-changes/SKILL.md) |

(Claude Code discovers these automatically via thin pointers in `.claude/skills/`.)

## Building UI

Read `src/components/catalog.ts` before adding UI (see CLAUDE.md → "Component catalog"). Don't add a component without a `CATALOG` entry — `npm run build` and `src/components/catalog.test.ts` enforce it.

## DataGrid UI rules

- Header cells should show vertical separators between columns.
- Header controls are progressive disclosure: sort indicators, column-menu triggers, and resize handles stay hidden until the header is hovered or focused.
- Column menu triggers use a vertical ellipsis (`⋮`), not horizontal dots.
- Don't show a separate grab-target icon in headers. The header cell itself is the drag/sort affordance and shows a pointer cursor on hover when interactive.
- The inline per-column filter row is hidden by default; show it only via the toolbar `Filters` toggle.
- Column menus must stay inside the viewport on narrow layouts (fixed positioning with clamped coordinates) — don't revert them to absolutely positioned children of the scroll container.
- Keep row and column controls accessible by keyboard/focus, not only mouse hover.

## Verification

Gates live in CLAUDE.md ("When changing behavior"): `npm run lint`, `npm run lint:theme`, `npm test`, `npm run build`. Run the smallest relevant test first. For frontend/UI changes, verify rendered behavior in the running app or Playwright at the viewport where the issue was reported; for layout-sensitive DataGrid changes, run focused Playwright or a browser measurement against `http://127.0.0.1:5173/`.
