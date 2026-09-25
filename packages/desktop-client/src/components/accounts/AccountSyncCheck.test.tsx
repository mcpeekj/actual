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
  retryMutateAsync: vi.fn().mockResolvedValue(true),
}));

vi.mock('react-router', () => ({
  useParams: () => ({ id: 'acct-1' }),
}));

vi.mock('#accounts', () => ({
  useSyncAccountsMutation: () => ({ mutateAsync: mocks.retryMutateAsync }),
}));

vi.mock('#hooks/useAccounts', () => ({
  useAccounts: () => ({ data: mocks.accounts }),
}));

vi.mock('#hooks/useFailedAccounts', () => ({
  useFailedAccounts: () => new Map(),
}));

describe('AccountSyncCheck', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom doesn't implement window.open.
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
    mocks.accounts[0].account_sync_source = 'simpleFin';
  });

  it('shows "Retry sync" and "Open SimpleFIN" for a needs-attention account', async () => {
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

    expect(screen.getByText('Retry sync')).toBeInTheDocument();
    expect(screen.getByText('Open SimpleFIN')).toBeInTheDocument();
    expect(screen.queryByText('Unlink account')).not.toBeInTheDocument();
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

  it('opens the SimpleFIN bridge site when "Open SimpleFIN" is pressed', async () => {
    render(
      <TestProviders>
        <AccountSyncCheck />
      </TestProviders>,
    );

    await userEvent.click(
      screen.getByText(/experiencing connection problems/i),
    );

    await userEvent.click(screen.getByText('Open SimpleFIN'));
    expect(openSpy).toHaveBeenCalledWith(
      'https://bridge.simplefin.org/',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('does not offer SimpleFIN for accounts synced elsewhere', async () => {
    mocks.accounts[0].account_sync_source = 'goCardless';

    render(
      <TestProviders>
        <AccountSyncCheck />
      </TestProviders>,
    );

    await userEvent.click(
      screen.getByText(/experiencing connection problems/i),
    );

    expect(screen.getByText('Retry sync')).toBeInTheDocument();
    expect(screen.queryByText('Open SimpleFIN')).not.toBeInTheDocument();
  });
});
