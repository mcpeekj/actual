import { describe, expect, it } from 'vitest';

import { groupAccountsByType } from './accountDetails';

describe('groupAccountsByType', () => {
  it('groups accounts by type in ACCOUNT_TYPES order, no-type last', () => {
    const accounts = [
      { id: 'sav-1', type: 'savings' },
      { id: 'check-1', type: 'checking' },
      { id: 'none-1', type: null },
      { id: 'check-2', type: 'checking' },
    ];

    const groups = groupAccountsByType(accounts, 'No type');

    expect(groups.map(group => group.label)).toEqual([
      'Checking',
      'Savings',
      'No type',
    ]);
    expect(groups[0].accounts.map(account => account.id)).toEqual([
      'check-1',
      'check-2',
    ]);
    expect(groups[2].accounts.map(account => account.id)).toEqual(['none-1']);
  });

  it('keeps accounts with a missing type in the no-type group', () => {
    const accounts = [{ id: 'a', type: undefined }];
    const groups = groupAccountsByType(accounts, 'No type');
    expect(groups.map(group => group.label)).toEqual(['No type']);
  });

  it('renders an unknown type after the known ones, labeled by its raw value', () => {
    const accounts = [
      { id: 'check-1', type: 'checking' },
      { id: 'loc-1', type: 'line-of-credit' },
    ];
    const groups = groupAccountsByType(accounts, 'No type');
    expect(groups.map(group => group.label)).toEqual([
      'Checking',
      'line-of-credit',
    ]);
  });

  it('omits types with no accounts', () => {
    const accounts = [{ id: 'check-1', type: 'checking' }];
    const groups = groupAccountsByType(accounts, 'No type');
    expect(groups.map(group => group.label)).toEqual(['Checking']);
  });
});
