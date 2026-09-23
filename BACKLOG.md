# $quirrel — Product Backlog

> Personal finance app forked from Actual Budget.
> **Owner:** you (product owner) · **Last updated:** 2026-08-28

## What's done

- **M1 — Register layout:** Category column before Notes; reconciled rows dimmed.
- **M2 — Memorized payees:** picking a known payee auto-fills its category from the last transaction with that payee.
- **M4 — Per-category account scoping:** restrict a category to a chosen set of accounts; budget + reports respect it.
- **M5 — Online balance:** account header shows the bank-synced balance and when it was last updated.
- **M6 — Branding:** app renamed **$quirrel** (title, manifest, PWA icons, all in-app "Actual" strings). Logo is a squirrel silhouette with the tail curling into a **$**.
- **M7 — Pending-clearing fixes:** pending transactions now clear correctly on re-sync; sidebar unread dot + account-type grouping.
- **M8 — Account details:** editable account type/number/website, account-detail modal, Bank Sync page column fix.
- **M9 — Register + sidebar polish:** Reports moved under the More menu (no longer a top-level button); $0 pending holds (card authorization holds) hidden from the register while kept in the DB so pending→posted matching still works.
- **Release notes** for M1–M5 added (`upcoming-release-notes/`).
- **Milestone branches merged into `main`** (SQ-39).

## Next up

Roughly in priority order — pull from here for the next milestone:

- **Reconcile to online balance** — guided flow to match cleared transactions to the online balance, with clearer cleared/pending/reconciled states.
- **Reconcile lock preview** — after clicking Reconcile, highlight the transactions that will be locked before you commit the lock, so you can see (and adjust) what is about to be locked instead of blindly accepting them.
- **Future-dated transactions** — transactions dated in the future stay visible in the register (italicized, with a hard separator line between current and future) but are excluded from the local balance in the account header and the account balance in the sidebar.
- **"Roll over" toggle (default: reset at month end)** — most categories start fresh each month: positive leftover returns to "To Budget", overspending forgiven (no "Overspent in <month>" carryover). Only a few, like the Escrow and Savings groups, accumulate month to month — a "Roll over" toggle (per category, or on the group) opts them in. New categories default to reset.
- **Scoping UX polish** — manage a category's accounts from the budget sidebar, show a "scoped" indicator, audit every budget view for scoped totals.
- **Extend scoping to all report types** — net worth, cash flow, age of money, custom, summary, calendar, formula (only crossover/sankey/spending are wired today).
- **Bank sync health** — per-account status + error/re-auth surfacing.
- **Batch-sync multiple accounts** at once (not just one-at-a-time or all).
- **Category targets / savings goals** — monthly rollover and target amounts.
- **Rules engine UX** — match preview and more expressive conditions.
- **Schedules** — overdue/upcoming banner + per-schedule auto-enter toggle.
- **Duplicate-transaction detection** on import and sync.
- **Report presets** (This month / Last 30 days / YTD) + save named views.
- **YNAB/Mint-style mapping helpers** and **arbitrary-CSV column-mapping UI** for imports.
- **Large-budget performance** — virtualized register, report query caching.
- **Test-coverage policy** — each new feature ships with at least one e2e/VRT.
- **Docs** — $quirrel getting-started + FAQ.

## Parked / out of scope (for now)

- Investment / portfolio tracking (Actual doesn't track investments; $quirrel inherits that gap).
- Shared household budgets / multi-user logins (user is household; separate per-person logins not yet requested — upstream ships multi-user if ever wanted).
- Desktop packaging as $quirrel (web-only decision — no Electron app; the web client is the product).
- Any paid-tier / SaaS features (local-first app; monetization undecided).
- Re-implementing upstream features from scratch (fully diverged — nothing to track).
- Exploratory ideas: scenario/"what-if" budgets, push notifications on mobile, offline-edit conflict handling, dashboard customization, currency/locale formatting options, theme tuning, custom first-run splash mascot.

## Decisions

- **Platform priority:** **Web-only** (2026-08-27) — $quirrel stays a web app served from the Asus; no Electron packaging. Desktop-packaging item parked.
- **Sync strategy:** **Self-host sync server + SimpleFin** (2026-08-27) — keep the self-host server first-class; SimpleFin is the bank-sync provider.
- **Who's the user:** **Household** (2026-08-27) — the budget covers the household's finances. Whether separate per-person logins are wanted is still open.
- **Upstream policy:** **Fully diverged** (SQ-39, 2026-08-27) — never take upstream Actual updates; every divergence is permanent.
