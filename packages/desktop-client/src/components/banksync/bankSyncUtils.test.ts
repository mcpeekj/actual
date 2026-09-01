import { generateAccount } from '@actual-app/core/mocks';
import type { AccountEntity } from '@actual-app/core/types/models';
import { describe, expect, it } from 'vitest';

import {
  bankWebsiteUrlKey,
  getAccountWebsiteUrl,
  getSyncSourceReadable,
  groupBankSyncAccounts,
  isSimpleFinAccount,
} from './bankSyncUtils';

describe('bankSyncUtils', () => {
  it('groups open accounts by provider and leaves unlinked last', () => {
    const goCardlessAccount = generateAccount('GoCardless', true, false);
    const pluggyAccount = {
      ...generateAccount('Pluggy', true, false),
      account_sync_source: 'pluggyai' as const,
    };
    const simpleFinAccount = {
      ...generateAccount('SimpleFIN', true, false),
      account_sync_source: 'simpleFin' as const,
    };
    const unlinkedAccount = generateAccount('Manual', false, false);
    const closedAccount = {
      ...generateAccount('Closed', true, false),
      closed: 1 as const,
    };

    const groupedAccounts = groupBankSyncAccounts([
      unlinkedAccount,
      simpleFinAccount,
      closedAccount,
      pluggyAccount,
      goCardlessAccount,
    ]);

    expect(Object.keys(groupedAccounts)).toEqual([
      'goCardless',
      'pluggyai',
      'simpleFin',
      'unlinked',
    ]);
    expect(groupedAccounts.goCardless).toEqual([goCardlessAccount]);
    expect(groupedAccounts.pluggyai).toEqual([pluggyAccount]);
    expect(groupedAccounts.simpleFin).toEqual([simpleFinAccount]);
    expect(groupedAccounts.unlinked).toEqual([unlinkedAccount]);
  });

  it('returns stable readable provider labels', () => {
    const readable = getSyncSourceReadable(
      (key: string) => `translated:${key}`,
    );

    expect(readable.goCardless).toBe('GoCardless');
    expect(readable.simpleFin).toBe('SimpleFIN');
    expect(readable.pluggyai).toBe('Pluggy.ai');
    expect(readable.unlinked).toBe('translated:Unlinked');
  });

  describe('bank website URL', () => {
    it('builds a stable pref key from the bank id', () => {
      expect(bankWebsiteUrlKey('bank-123')).toBe('bank-website-url-bank-123');
      // A missing institution id still yields a valid (but unset) key so the
      // hook can be called unconditionally.
      expect(bankWebsiteUrlKey(null)).toBe('bank-website-url-');
      expect(bankWebsiteUrlKey(undefined)).toBe('bank-website-url-');
    });

    it('prefers the bank-level URL over the account-level fallback', () => {
      const account = {
        website_url: 'https://old.example.com',
      } as Pick<AccountEntity, 'website_url'>;

      expect(getAccountWebsiteUrl(account, 'https://bank.example.com')).toBe(
        'https://bank.example.com',
      );
      expect(
        getAccountWebsiteUrl(account, '  https://bank.example.com  '),
      ).toBe('https://bank.example.com');
      expect(getAccountWebsiteUrl(account, '')).toBe('https://old.example.com');
      expect(getAccountWebsiteUrl(account, undefined)).toBe(
        'https://old.example.com',
      );
    });

    it('returns null when neither a bank URL nor account fallback exists', () => {
      expect(
        getAccountWebsiteUrl({ website_url: null }, 'https://bank.example.com'),
      ).toBe('https://bank.example.com');
      expect(getAccountWebsiteUrl({ website_url: null }, undefined)).toBeNull();
      expect(
        getAccountWebsiteUrl({ website_url: '   ' }, undefined),
      ).toBeNull();
    });
  });

  describe('isSimpleFinAccount', () => {
    it('only matches SimpleFIN-synced accounts', () => {
      const base = generateAccount('Manual', false, false) as AccountEntity;
      expect(
        isSimpleFinAccount({ ...base, account_sync_source: 'simpleFin' }),
      ).toBe(true);
      expect(
        isSimpleFinAccount({ ...base, account_sync_source: 'goCardless' }),
      ).toBe(false);
      expect(isSimpleFinAccount({ ...base, account_sync_source: null })).toBe(
        false,
      );
    });
  });
});
