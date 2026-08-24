BEGIN TRANSACTION;

-- Join table scoping a category to a subset of accounts (Quicken-style
-- "budget this category only from these accounts"). A category with no rows
-- here counts spend from every on-budget account (today's behavior); once
-- rows exist, only the listed accounts contribute to its budget cells.
-- No FK constraints on purpose -- Actual uses tombstones, not foreign keys.
CREATE TABLE IF NOT EXISTS category_accounts
  (category_id TEXT NOT NULL,
   account_id TEXT NOT NULL,
   PRIMARY KEY (category_id, account_id));

COMMIT;
