# $quirrel — Product Backlog

> Personal finance app forked from Actual Budget.
> **Owner:** you (product owner) · **Last updated:** 2026-08-27

## What's done

- **M1 — Register layout:** Category column before Notes; reconciled rows dimmed.
- **M2 — Memorized payees:** picking a known payee auto-fills its category from the last transaction with that payee.
- **M4 — Per-category account scoping:** restrict a category to a chosen set of accounts; budget + reports respect it.
- **M5 — Online balance:** account header shows the bank-synced balance and when it was last updated.
- **M6 — Branding:** app renamed **$quirrel** (title, manifest, PWA icons, all in-app "Actual" strings). Logo is a squirrel silhouette with the tail curling into a **$**.
- **M7 — Pending-clearing fixes:** pending transactions now clear correctly on re-sync; sidebar unread dot + account-type grouping.
- **M8 — Account details:** editable account type/number/website, account-detail modal, Bank Sync page column fix.
- **Release notes** for M1–M5 added (`upcoming-release-notes/`).
- **Milestone branches merged into `main`** (SQ-39).

## Next up

Roughly in priority order — pull from here for the next milestone:

- **Reconcile to online balance** — guided flow to match cleared transactions to the online balance, with clearer cleared/pending/reconciled states.
- **Scoping UX polish** — manage a category's accounts from the budget sidebar, show a "scoped" indicator, audit every budget view for scoped totals.
- **Extend scoping to all report types** — net worth, cash flow, age of money, custom, summary, calendar, formula (only crossover/sankey/spending are wired today).
- **Bank sync health** — per-account status + error/re-auth surfacing.
- **Batch-sync multiple accounts** at once (not just one-at-a-time or all).
- **Category targets / savings goals** — monthly rollover and target amounts.
- **First-run onboarding** — custom welcome, sample-data demo, short tour.
- **Desktop packaging as $quirrel** — bundle name, icon, auto-update feed.
- **Mobile parity audit** — online-balance visibility, scoping read-only view, budget quick-actions on the Capacitor app.
- **Rules engine UX** — match preview and more expressive conditions.
- **Schedules** — overdue/upcoming banner + per-schedule auto-enter toggle.
- **Duplicate-transaction detection** on import and sync.
- **Balance Sheet + Income Statement reports** (currently only approximable via custom reports).
- **Report presets** (This month / Last 30 days / YTD) + save named views.
- **Export any report** to CSV/PDF.
- **YNAB/Mint-style mapping helpers** and **arbitrary-CSV column-mapping UI** for imports.
- **Keyboard shortcuts** for register/budget.
- **Accessibility pass** — screen-reader labels, focus management, contrast.
- **Large-budget performance** — virtualized register, report query caching.
- **Test-coverage policy** — each new feature ships with at least one e2e/VRT.
- **Docs** — $quirrel getting-started + FAQ.

## Parked / out of scope (for now)

- Investment / portfolio tracking (Actual doesn't track investments; $quirrel inherits that gap).
- Shared household budgets (blocked on the "who's the user" decision below).
- Any paid-tier / SaaS features (local-first app; monetization undecided).
- Re-implementing upstream features from scratch (prefer tracking upstream).
- Exploratory ideas: scenario/"what-if" budgets, push notifications on mobile, offline-edit conflict handling, dashboard customization, currency/locale formatting options, theme tuning, custom first-run splash mascot.

## Open decisions

- **Platform priority** — web-only, desktop-first, or push mobile (a Capacitor iOS/Android app and a responsive web UI both already exist)?
- **Sync strategy** — keep the self-host sync server first-class, or lean into cloud convenience? Which bank-sync providers to prioritize (GoCardless, SimpleFIN, Pluggy, Enable Banking, Akahu)?
- **Who's the user** — personal vs. household (upstream already ships multi-user / user-directory)?
- **Upstream policy** — track upstream Actual closely vs. diverge? Every divergence (e.g. category scoping) is a merge cost — consider writing down a policy.
