# Squirrel — Product Backlog

> Personal finance app forked from Actual Budget.
> **Owner:** you (product owner) · **Last updated:** 2026-08-24

The app has a name: **Squirrel**. Branding details are still open — see [Decision D1](#d1-brand-details).

This is the pool of candidate work for milestones **M6+**. Milestones M1–M5 are tracked under [Current status](#current-status). Items are written to be actionable in this repo's AI-assisted workflow: each lands as an `[AI]`-prefixed commit, tested, release-noted, and pushed to the `mine` fork.

## How to use this backlog

- **Item ID** — `SQ-##`, a stable reference. When you add an item, take the next number.
- **Priority** — P0 (pull into the next milestone), P1 (soon), P2 (later), P3 (someday / exploratory).
- **Effort** — S / M / L heuristic. Re-estimate when you pull an item in.
- **Status** — `Backlog` → `In progress` → `Done`.
- **Definition of done** for anything pulled in: passes `yarn typecheck` and relevant tests, gets an `upcoming-release-notes/` entry, has VRT/e2e coverage where it touches UI, and lands via an `[AI]` commit.
- **Priorities are provisional.** Treat this as a first pass; reorder freely. Items marked 🤔 are exploratory, not commitments.

## Product summary

Squirrel is a local-first personal finance app forked from Actual Budget. It keeps Actual's envelope budgeting, register, reports, schedules, rules, and bank sync, and layers on a personalization roadmap: an opinionated register layout, memorized payees, per-category account scoping, and a visible online-balance story.

## Current status

Milestone work lives on branches pushed to the `mine` remote (`github.com/mcpeekj/actual`); **none is merged to `main` yet** (that's SQ-39).

| Milestone | Branch | What landed | Status |
|---|---|---|---|
| M1 | `milestone-1-register` | Register: Category column before Notes, reconciled rows rendered gray | Landed on branch |
| M2 | `milestone-2-memorized-payees` | Memorized payees: auto-fill category from the last transaction with that payee | Landed on branch |
| M3 | — | (no branch in this fork) | — |
| M4 | `milestone-4-category-accounts` | Per-category account scoping: choose which on-budget accounts feed a category; budget + crossover/sankey/spending reports respect it | Landed on branch |
| M5 | `milestone-5-online-balance` | Account header: "Online balance" pill + "Updated X ago" (`components/accounts/Balance.tsx`) | In progress |
| — | — | Upstream fix: context menu on multi-account views | Landed |

## Open decisions (product owner)

These move priorities more than any single item:

**D1. Brand details.** Name chosen: **Squirrel**. You wrote it lowercase — decide the stylized mark (lowercase `squirrel`, `Squirrel`, …), logo, favicon, tagline, and desktop bundle name. Drives SQ-01–SQ-03.
**D2. Platform priority.** Web-only, desktop-first, or push mobile (a Capacitor iOS/Android app and a responsive web UI both already exist)? Drives SQ-30–SQ-32.
**D3. Sync strategy.** Keep the self-host sync server first-class, or lean into cloud convenience? Which bank-sync providers to prioritize (GoCardless, SimpleFIN, Pluggy, Enable Banking, Akahu)? Drives SQ-24.
**D4. Who's the user.** Personal vs. household (upstream already ships multi-user / user-directory)? Drives SQ-15, SQ-30.
**D5. Upstream policy.** Track upstream Actual closely vs. diverge? Every divergence (e.g. M4 scoping) is a merge cost — consider writing down a policy.

---

## Backlog by theme

### E1 — Brand & identity

The app has a name; now it needs a face. Fast, high-visibility work.

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-01 | **Brand kit**: logo + favicon, color accent, tagline; apply across web manifest, desktop bundle, and docs | P0 | M | Backlog |
| SQ-02 | **Welcome & About screens show Squirrel** — sidebar brand, app title strings, manager/welcome copy that still says "Actual" | P0 | M | Backlog |
| SQ-03 | **PWA install identity** (manifest name, icons, theme-color) so an installed app reads as Squirrel | P1 | S | Backlog |
| SQ-04 | 🤔 Custom first-run splash with a Squirrel mascot | P3 | S | Backlog |

**Top pick →** SQ-01 + SQ-02 together: rename everything visible in one `[AI]` PR.

### E2 — Accounts & register

Completes the online-balance story M5 started, and protects the M1 register work.

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-05 | **Online balance on every account row** (accounts sidebar / all-accounts view), not just the open account header | P0 | M | Backlog |
| SQ-06 | **Staleness + refresh**: show when the online balance is old, add a manual refresh, surface `last_sync` on more views; keep the header clean when no sync provider is linked | P0 | S | Backlog |
| SQ-07 | **Reconcile to online balance**: guided flow to match cleared transactions to the online balance, plus clearer cleared / pending / reconciled states and an audit trail | P1 | M | Backlog |
| SQ-08 | **Pending vs cleared visual treatment** in the register (e.g. dimmed pending rows) | P2 | M | Backlog |
| SQ-09 | **VRT/e2e coverage** for the M5 header pill and the M1 register layout so they can't silently regress | P1 | S | Backlog |
| SQ-10 | **Multi-account views**: regression coverage for the context-menu fix + bulk actions | P2 | M | Backlog |
| SQ-11 | **Register search/filters**: full-text across payee/notes, save named filters | P3 | M | Backlog |

**Where:** `components/accounts/Balance.tsx` (M5), `components/accounts/Account.tsx`, sidebar account rows, `components/transactions/TransactionsTable.tsx`.

### E3 — Budgeting

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-12 | **Scoping UX polish** (M4 follow-on): manage a category's accounts from the budget sidebar context menu, show a "scoped" indicator, and audit *every* budget view for scoped totals | P1 | M | Backlog |
| SQ-13 | **Category targets**: monthly rollover / target amounts (savings goals) | P2 | M | Backlog |
| SQ-14 | **Overspending / under-budget states** clearer (colors + warnings) | P2 | S | Backlog |
| SQ-15 | 🤔 **Scenario / "what-if" budgets** (copy a budget, tweak, compare) | P3 | L | Backlog |

**Where:** `components/budget/SidebarCategory.tsx`, `components/modals/CategoryAccountsModal.tsx`, `packages/loot-core/src/server/budget/app.ts`.

### E4 — Reports & analytics

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-16 | **Extend per-category account scoping to all report types** (net worth, cash flow, age of money, custom, summary, calendar, formula — only crossover/sankey/spending are wired today) | P1 | M | Backlog |
| SQ-17 | **Balance Sheet + Income Statement reports** (currently only approximable via custom reports) | P2 | M | Backlog |
| SQ-18 | **Promote feature-flagged reports** (Balance Forecast, Budget Analysis, Sankey) to stable, tested reports | P2 | M | Backlog |
| SQ-19 | **Report presets** (This month / Last 30 days / YTD) + save named views | P2 | M | Backlog |
| SQ-20 | **Export any report** to CSV/PDF | P2 | S | Backlog |
| SQ-21 | **Dashboard customization** (choose which cards show) | P3 | M | Backlog |

**Where:** `components/reports/reports/`, `components/reports/spreadsheets/`.

### E5 — Data accuracy & automation

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-22 | **Rules engine UX**: match preview and more expressive conditions in the editor | P2 | M | Backlog |
| SQ-23 | **Schedules**: overdue / upcoming banner + per-schedule auto-enter toggle | P2 | M | Backlog |
| SQ-24 | **Bank sync health**: per-account status + error/re-auth surfacing; keep GoCardless/SimpleFIN flows tested | P1 | M | Backlog |
| SQ-25 | **Duplicate-transaction detection** on import and sync | P2 | M | Backlog |
| SQ-26 | 🤔 **Offline-edit conflict handling** for multi-device sync (merge preview before overwrite) | P3 | L | Backlog |

**Where:** `components/rules/`, `components/schedules/`, `components/banksync/`, importers in `packages/loot-core/src/server/importers/`.

### E6 — Import & onboarding

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-27 | **Squirrel first-run**: custom welcome/onboarding, sample-data demo, short tour (register → budget → reports) | P1 | M | Backlog |
| SQ-28 | **YNAB/Mint-style mapping helpers** (category/payee mapping on import — nYNAB/YNAB4 budget import already exists) | P2 | M | Backlog |
| SQ-29 | **Arbitrary-CSV column-mapping UI** for transaction import | P2 | M | Backlog |

**Where:** `components/manager/` (welcome / file selection), `packages/loot-core/src/budgetfiles/budgetfilesSlice.ts`, `components/accounts/Account.tsx` import.

### E7 — Mobile & desktop

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-30 | **Mobile parity audit**: online-balance visibility, scoping read-only view, budget quick-actions on the Capacitor app | P2 | M | Backlog |
| SQ-31 | **Desktop packaging as Squirrel**: bundle name, icon, auto-update feed | P1 | M | Backlog |
| SQ-32 | 🤔 **Push notifications / background sync refresh** on mobile | P3 | L | Backlog |

**Where:** `packages/mobile-client/`, `packages/desktop-electron/`.

### E8 — Polish, performance & accessibility

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-33 | **Keyboard shortcuts** for register/budget (auto-categorize, quick jump) | P2 | M | Backlog |
| SQ-34 | **Accessibility pass**: screen-reader labels, focus management, contrast in register/reports | P2 | L | Backlog |
| SQ-35 | **Large-budget performance**: virtualized register, report query caching | P2 | M | Backlog |
| SQ-36 | **Currency/locale formatting** options beyond defaults | P3 | S | Backlog |
| SQ-37 | **Theme tuning**: custom accent / per-theme polish | P3 | S | Backlog |

### E9 — Process & release

Keeps the milestone workflow from accruing debt.

| ID | Item | Pri | Eff | Status |
|---|---|---|---|---|
| SQ-38 | **Release notes for M1–M5** — none exist yet; add `upcoming-release-notes/` entries for scoping, online balance, memorized payees, and the register layout | P0 | S | Backlog |
| SQ-39 | **Land milestone branches to `mine/main`** via `[AI]` PRs (or adopt a squash-merge policy) so history stays coherent | P0 | S | Backlog |
| SQ-40 | **Test-coverage policy per milestone** (each new feature ships with at least one e2e/VRT) | P1 | S | Backlog |
| SQ-41 | **Docs**: Squirrel getting-started + FAQ on the fork | P2 | M | Backlog |

---

## Suggested next milestone — M6 "Balance & identity"

A coherent shippable slice: finish the online-balance story M5 started, and give the app its name in public.

| Item | Why now |
|---|---|
| SQ-38 Release notes M1–M5 | Close the debt before it grows; cheap. |
| SQ-39 Land milestone branches | Clean base for everything after. |
| SQ-01 Brand kit + SQ-02 rename | The app is called Squirrel; make it look like it. |
| SQ-05 Online balance on account rows | M5 showed it in the header; users want it everywhere. |
| SQ-06 Staleness + refresh | "Updated X ago" is only useful if you can act on staleness. |

Deferred from M6: SQ-07 (reconciliation) is a bigger lift — a good M7 anchor.

---

## Deferred / out of scope (for now)

Kept off the table until a decision or data point lands:

- Investment / portfolio tracking (Actual doesn't track investments; Squirrel inherits that gap).
- Shared household budgets (blocked on D4).
- Any paid-tier / SaaS features (local-first app; monetization undecided).
- Re-implementing upstream features from scratch (prefer tracking upstream; see D5).
