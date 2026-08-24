// The original category_accounts table (1787590000000) was created with a
// composite (category_id, account_id) primary key and no id/tombstone columns.
// That shape can't participate in CRDT sync: messages address rows by a single
// `id`, and AQL auto-filters `tombstone = 0` only when the schema declares the
// column. This migration rebuilds the table into the sync-compatible shape.
// It is self-healing -- it runs correctly whether or not the earlier migration
// already created the table (and may even be a no-op on a clean fresh build).
export default async function runMigration(db) {
  const hasTable = db.runQuery(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'category_accounts'`,
    [],
    true,
  );

  // category_id/account_id are intentionally nullable: CRDT message apply
  // inserts a row one column at a time (`INSERT INTO t (id, first_col) ...`),
  // so NOT NULL on non-id columns fails.
  const CATEGORY_ACCOUNTS_TABLE = `
    CREATE TABLE category_accounts (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      account_id TEXT,
      tombstone INTEGER NOT NULL DEFAULT 0
    )
  `;

  if (hasTable.length === 0) {
    await db.execQuery(CATEGORY_ACCOUNTS_TABLE);
    return;
  }

  const columns = db
    .runQuery(`SELECT name FROM pragma_table_info('category_accounts')`, [], true)
    .map(row => row.name);

  // SQLite can't add a PRIMARY KEY column via ALTER TABLE, so rebuild the
  // table. Backfill ids (uuid-style hex) for any rows the earlier shape may
  // have created -- in practice there are none, but be safe.
  if (!columns.includes('id') || !columns.includes('tombstone')) {
    await db.execQuery(`
      ALTER TABLE category_accounts RENAME TO category_accounts_old;
      ${CATEGORY_ACCOUNTS_TABLE};
      INSERT INTO category_accounts (id, category_id, account_id)
        SELECT lower(hex(randomblob(16))), category_id, account_id
        FROM category_accounts_old;
      DROP TABLE category_accounts_old;
    `);
  }
}
