# @avrig/ui

Pure presentational design system and headless component library for the `avrig-ai` ecosystem.

## Architecture & Layer Boundaries

- **Zero Domain/Business State:** Strictly contains no business logic, domain invariants, authentication state, or direct API fetch calls.
- **Primitives:** Radix UI and accessible headless patterns styled with Tailwind CSS tokens.
- **Packages:**
  - `@avrig/tokens`: Design tokens, colors, CSS theme variables (light/dark mode).
  - `@avrig/ui`: Reusable UI primitives and composite presentation widgets.

## Components Included

- **Primitives:** Button, Dialog, Sheet, DropdownMenu, Card, Badge, Tabs, Table, Avatar, ScrollArea
- **Composite Shell Widgets:** CommandPalette, DataTable
