import React from 'react';

import type { AccountEntity } from '@actual-app/core/types/models';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestProviders } from '#mocks';

import { AccountSyncCheck } from './AccountSyncCheck';

// Hoisted so the vi.mock factories below can reference them.
const mocks = vi.hoisted(() => ({
  accounts: [
    {
      id: 'acct-1',
      name: 'Checking',
      bank: 'bank-1',
      account_sync_source: 'simpleFin',
      bank_sync_status: 'attention-required',
    },
    {
      id: 'acct-2',
      name: 'Savings',
      bank: 'bank-1',
      account_sync_source: 'simpleFin',
      bank_sync_status: 'attention-required',
    },
    {
      id: 'acct-3',
      name: 'Credit Card',
      bank: 'bank-2',
      account_sync_source: 'simpleFin',
      bank_sync_status: 'ok',
    },
  ] as AccountEntity[],
  unlinkMutate: vi.fn(),
  retryMutateAsync: vi.fn().mockResolvedValue(true),
}));

vi.mock('react-router', () => ({
  useParams: () => ({ id: 'acct-1' }),
}));

vi.mock('#accounts', () => ({
  useUnlinkAccountMutation: () => ({ mutate: mocks.unlinkMutate }),
  useSyncAccountsMutation: () => ({ mutateAsync: mocks.retryMutateAsync }),
}));

vi.mock('#hooks/useAccounts', () => ({
  useAccounts: () => ({ data: mocks.accounts }),
}));

vi.mock('#hooks/useFailedAccounts', () => ({
  useFailedAccounts: () => new Map(),
}));

describe('AccountSyncCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Retry sync" alongside "Unlink account" for a needs-attention account', async () => {
    render(
      <TestProviders>
        <AccountSyncCheck />
      </TestProviders>,
    );

    // The popover is closed until the trigger is pressed.
    expect(
      screen.getByText(/experiencing connection problems/i),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByText(/experiencing connection problems/i),
    );

    expect(screen.getByText('Unlink account')).toBeInTheDocument();
    expect(screen.getByText('Retry sync')).toBeInTheDocument();
  });

  it('re-syncs all flagged accounts when "Retry sync" is pressed', async () => {
    render(
      <TestProviders>
        <AccountSyncCheck />
      </TestProviders>,
    );

    await userEvent.click(
      screen.getByText(/experiencing connection problems/i),
    );

    await userEvent.click(screen.getByText('Retry sync'));

    // acct-1 (viewed) and acct-2 are flagged; acct-3 is healthy.
    expect(mocks.retryMutateAsync).toHaveBeenCalledTimes(2);
    expect(mocks.retryMutateAsync).toHaveBeenCalledWith({ id: 'acct-1' });
    expect(mocks.retryMutateAsync).toHaveBeenCalledWith({ id: 'acct-2' });
  });

  it('still lets the user unlink the account', async () => {
    render(
      <TestProviders>
        <AccountSyncCheck />
      </TestProviders>,
    );

    await userEvent.click(
      screen.getByText(/experiencing connection problems/i),
    );

    await userEvent.click(screen.getByText('Unlink account'));
    expect(mocks.unlinkMutate).toHaveBeenCalledWith({ id: 'acct-1' });
  });
});
