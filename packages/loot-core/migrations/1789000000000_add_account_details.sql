BEGIN TRANSACTION;

-- Account details (editable, user-provided). `type`/`subtype` columns already
-- exist on the accounts table (from init.sql / earlier migrations); these two
-- are new. `account_number` holds the user-entered account number (full or
-- last-4 per preference) and `website_url` the bank's site for quick links.
ALTER TABLE accounts ADD COLUMN account_number text;
ALTER TABLE accounts ADD COLUMN website_url text;

COMMIT;
