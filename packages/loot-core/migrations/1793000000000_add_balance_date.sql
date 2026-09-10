BEGIN TRANSACTION;

-- When the balance was actually captured by the bank-sync provider (e.g. the
-- SimpleFin Bridge's `balance-date`), as opposed to `last_sync` which is when
-- the sync ran. The UI shows this so a stale balance isn't presented as fresh.
ALTER TABLE accounts ADD COLUMN balance_date text;

COMMIT;
