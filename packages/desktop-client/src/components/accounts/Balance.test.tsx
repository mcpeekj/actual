import React from 'react';

import { q } from '@actual-app/core/shared/query';
import type {
  AccountEntity,
  ScheduleEntity,
} from '@actual-app/core/types/models';
import { render, screen } from '@testing-library/react';

import { useCachedSchedules } from '#hooks/useCachedSchedules';
import { useSelectedItems } from '#hooks/useSelected';
import { useSheetValue } from '#hooks/useSheetValue';
import { TestProviders } from '#mocks';

import { Balances, SelectedBalance } from './Balance';

vi.mock('#hooks/useSelected', () => ({
  useSelectedItems: vi.fn(),
}));

vi.mock('#hooks/useSheetValue', () => ({
  useSheetValue: vi.fn(),
}));

vi.mock('#hooks/useCachedSchedules', () => ({
  useCachedSchedules: vi.fn(),
}));

function makeSchedule(
  id: string,
  amount: number,
  accountId: string,
): ScheduleEntity {
  return {
    id,
    rule: 'rule-1',
    next_date: '2026-03-24',
    completed: false,
    posts_transaction: false,
    tombstone: false,
    _payee: 'payee-1',
    _account: accountId,
    _amount: amount,
    _amountOp: 'is',
    _date: '2026-03-24',
    _conditions: [],
    _actions: [],
  } satisfies ScheduleEntity;
}

function mockedSchedules(schedules: ScheduleEntity[]) {
  return {
    isLoading: false,
    schedules,
    statuses: new Map(),
    statusLabels: new Map(),
  };
}

describe('SelectedBalance – normal transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCachedSchedules).mockReturnValue(mockedSchedules([]));
  });

  test('shows balance for selected normal transactions', () => {
    vi.mocked(useSheetValue)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(-5000);

    render(
      <TestProviders>
        <SelectedBalance selectedItems={new Set(['tx-123'])} />
      </TestProviders>,
    );

    expect(screen.getByText('Selected balance:')).toBeInTheDocument();
    expect(screen.getByText('-50.00')).toBeInTheDocument();
  });

  test('shows balance when balance is falsy', () => {
    vi.mocked(useSheetValue).mockReturnValueOnce(null).mockReturnValueOnce(0);

    render(
      <TestProviders>
        <SelectedBalance selectedItems={new Set(['tx-123'])} />
      </TestProviders>,
    );

    expect(screen.getByText('Selected balance:')).toBeInTheDocument();
  });
});

describe('SelectedBalance – preview (scheduled) transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSheetValue).mockReturnValue(null);
  });

  test('includes the schedule amount when a preview transaction is selected', () => {
    const scheduleId = 'schedule-abc';

    vi.mocked(useSelectedItems).mockReturnValue(
      new Set([`preview/${scheduleId}/2026-03-24`]),
    );
    vi.mocked(useCachedSchedules).mockReturnValue(
      mockedSchedules([makeSchedule(scheduleId, -5000, 'account-1')]),
    );

    render(
      <TestProviders>
        <SelectedBalance
          selectedItems={new Set([`preview/${scheduleId}/2026-03-24`])}
        />
      </TestProviders>,
    );

    expect(screen.getByText('Selected balance:')).toBeInTheDocument();
  });

  test('counts each selected occurrence of the same schedule independently', () => {
    const scheduleId = 'schedule-abc';
    const previewId1 = `preview/${scheduleId}/2026-03-24`;
    const previewId2 = `preview/${scheduleId}/2026-04-24`;
    const selectedItems = new Set([previewId1, previewId2]);

    vi.mocked(useSelectedItems).mockReturnValue(selectedItems);
    vi.mocked(useCachedSchedules).mockReturnValue(
      mockedSchedules([makeSchedule(scheduleId, -5000, 'account-1')]),
    );

    render(
      <TestProviders>
        <SelectedBalance selectedItems={selectedItems} />
      </TestProviders>,
    );

    expect(screen.getByText('-100.00')).toBeInTheDocument();
  });
});

function makeAccount(overrides: Partial<AccountEntity> = {}): AccountEntity {
  return {
    id: 'account-1',
    name: 'Checking',
    offbudget: 0,
    closed: 0,
    sort_order: 0,
    last_reconciled: null,
    tombstone: 0,
    account_id: null,
    bank: null,
    bankName: null,
    bankId: null,
    mask: null,
    official_name: null,
    balance_current: null,
    balance_available: null,
    balance_limit: null,
    balance_date: null,
    account_sync_source: null,
    last_sync: null,
    bank_sync_status: null,
    ...overrides,
  } satisfies AccountEntity;
}

function makeBalanceQuery(accountId: string) {
  return {
    name: `balance-query-${accountId}`,
    query: q('transactions').calculate({ $sum: '$amount' }),
  } as const;
}

describe('Balances – online balance match indicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCachedSchedules).mockReturnValue(mockedSchedules([]));
    vi.mocked(useSelectedItems).mockReturnValue(new Set());
  });

  function renderBalances(account: AccountEntity) {
    return render(
      <TestProviders>
        <Balances
          balanceQuery={makeBalanceQuery(account.id)}
          showExtraBalances={false}
          onToggleExtraBalances={vi.fn()}
          account={account}
          isFiltered={false}
        />
      </TestProviders>,
    );
  }

  test('shows the match indicator when the local balance equals the online balance', () => {
    vi.mocked(useSheetValue).mockReturnValue(-5000);

    renderBalances(makeAccount({ balance_current: -5000 }));

    expect(screen.getByText('Online balance:')).toBeInTheDocument();
    expect(screen.getByTestId('account-balance-match')).toBeInTheDocument();
  });

  test('hides the match indicator when the balances differ', () => {
    vi.mocked(useSheetValue).mockReturnValue(-5050);

    renderBalances(makeAccount({ balance_current: -5000 }));

    expect(
      screen.queryByTestId('account-balance-match'),
    ).not.toBeInTheDocument();
  });

  test('hides the match indicator when there is no online balance', () => {
    vi.mocked(useSheetValue).mockReturnValue(-5000);

    renderBalances(makeAccount({ balance_current: null }));

    expect(
      screen.queryByTestId('account-balance-match'),
    ).not.toBeInTheDocument();
  });
});
