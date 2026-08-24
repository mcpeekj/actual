// @ts-strict-ignore
import { beforeEach, describe, expect, it } from 'vitest';

import * as db from '#server/db';
import { runMutator } from '#server/mutators';
import * as sheet from '#server/sheet';
import { undo } from '#server/undo';
import * as monthUtils from '#shared/months';

import { app } from './app';
import { createBudget } from './base';

beforeEach(() => {
  return global.emptyDatabase()();
});

async function setup() {
  // Budget-file migrations don't run in this test harness; create the join
  // table directly with the same shape the migrations converge on.
  await db.execQuery(`
    CREATE TABLE IF NOT EXISTS category_accounts (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      account_id TEXT,
      tombstone INTEGER NOT NULL DEFAULT 0
    )
  `);
  await db.insertCategoryGroup({ id: 'group1', name: 'group1' });
  await db.insertCategoryGroup({ id: 'group2', name: 'income', is_income: 1 });
  const catId = await db.insertCategory({ name: 'foo', cat_group: 'group1' });
  await db.insertAccount({ id: 'acct1', name: 'checking' });
  await db.insertAccount({ id: 'acct2', name: 'savings' });
  await sheet.loadSpreadsheet(db);
  await createBudget(['2016-12']);

  await db.insertTransaction({
    date: '2016-12-15',
    amount: -1000,
    account: 'acct1',
    category: catId,
  });
  await db.insertTransaction({
    date: '2016-12-20',
    amount: -2000,
    account: 'acct2',
    category: catId,
  });
  await sheet.waitOnSpreadsheet();

  return catId;
}

function sumAmount(catId: string) {
  return sheet.getCellValue(
    monthUtils.sheetForMonth('2016-12'),
    `sum-amount-${catId}`,
  );
}

describe('Category account scoping', () => {
  it('restricts spend to assigned accounts and undo reverts it', async () => {
    const catId = await setup();

    // Both accounts count before any scoping
    expect(sumAmount(catId)).toBe(-3000);

    // Scope the category to acct1 only
    await runMutator(() =>
      app.handlers['category-update-accounts']({ id: catId, accountIds: ['acct1'] }),
    );
    await sheet.waitOnSpreadsheet();

    expect(sumAmount(catId)).toBe(-1000);
    expect(await app.handlers['category-accounts']()).toEqual({
      [catId]: ['acct1'],
    });

    // Undo the scoping change -- the row reverts and the cells recompute
    await undo();
    await sheet.waitOnSpreadsheet();

    expect(sumAmount(catId)).toBe(-3000);
    expect(await app.handlers['category-accounts']()).toEqual({});
  });

  it('clearing scoping restores all-accounts behavior', async () => {
    const catId = await setup();

    await runMutator(() =>
      app.handlers['category-update-accounts']({ id: catId, accountIds: ['acct1'] }),
    );
    await sheet.waitOnSpreadsheet();
    expect(sumAmount(catId)).toBe(-1000);

    await runMutator(() =>
      app.handlers['category-update-accounts']({ id: catId, accountIds: [] }),
    );
    await sheet.waitOnSpreadsheet();

    expect(sumAmount(catId)).toBe(-3000);
    expect(await app.handlers['category-accounts']()).toEqual({});
  });
});
