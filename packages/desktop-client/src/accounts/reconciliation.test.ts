import { send } from '@actual-app/core/platform/client/connection';
import type { AccountEntity } from '@actual-app/core/types/models';
import { describe, expect, it, vi } from 'vitest';

import { lockTransactions } from './reconciliation';

vi.mock('@actual-app/core/platform/client/connection', () => ({
  send: vi.fn(),
}));

// lockTransactions loads cleared+unreconciled transactions via a query and
// persists the lock via 'transactions-batch-update'. The mock simulates the
// query's filter so only cleared, unreconciled rows are returned.
function mockQueryResult(transactions: Array<Record<string, unknown>>) {
  vi.mocked(send).mockImplementation(async (name: string) => {
    if (name === 'query') {
      return {
        data: transactions.filter(
          t => t.cleared === true && t.reconciled === false,
        ),
      };
    }
    return undefined;
  });
}

describe('reconciliation lock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the ids of the transactions it locks', async () => {
    mockQueryResult([
      { id: 'txn-1', amount: -5000, cleared: true, reconciled: false },
      { id: 'txn-2', amount: -1000, cleared: true, reconciled: false },
    ]);

    const lockedIds = await lockTransactions(
      'account-1' as AccountEntity['id'],
    );

    expect(lockedIds).toEqual(['txn-1', 'txn-2']);

    // The lock is persisted for those transactions.
    expect(send).toHaveBeenCalledWith(
      'transactions-batch-update',
      expect.objectContaining({
        updated: expect.arrayContaining([
          expect.objectContaining({ id: 'txn-1', reconciled: true }),
          expect.objectContaining({ id: 'txn-2', reconciled: true }),
        ]),
      }),
    );
  });

  it('only returns cleared, unreconciled transactions', async () => {
    // tx that is already reconciled and an uncleared (pending) tx are skipped.
    mockQueryResult([
      { id: 'txn-1', amount: -5000, cleared: true, reconciled: false },
      { id: 'txn-2', amount: -1000, cleared: true, reconciled: true },
      { id: 'txn-3', amount: -2000, cleared: false, reconciled: false },
    ]);

    const lockedIds = await lockTransactions(
      'account-1' as AccountEntity['id'],
    );

    expect(lockedIds).toEqual(['txn-1']);
  });

  it('returns an empty list when there is nothing to lock', async () => {
    mockQueryResult([]);

    const lockedIds = await lockTransactions(
      'account-1' as AccountEntity['id'],
    );

    expect(lockedIds).toEqual([]);
  });
});
