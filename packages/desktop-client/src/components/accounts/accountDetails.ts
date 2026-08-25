// Shared account-details definitions (Squirrel fork).
//
// `type`/`subtype` are surfaced from DB columns that predate the fork (they
// were reserved for bank-sync metadata). Here they're user-editable and
// manual-only. `account_number` and `website_url` are brand new, user-provided.
export const ACCOUNT_TYPES: Array<[string, string]> = [
  ['', 'No type'],
  ['checking', 'Checking'],
  ['savings', 'Savings'],
  ['credit-card', 'Credit card'],
  ['loan', 'Loan'],
  ['investment', 'Investment'],
  ['cash', 'Cash'],
  ['other', 'Other'],
];

// Human-readable label for a stored type value. Falls back to the raw value so
// a type written by something else (e.g. a bank-sync provider) still renders.
export function accountTypeLabel(type?: string | null): string | null {
  if (!type) {
    return null;
  }
  const match = ACCOUNT_TYPES.find(([value]) => value === type);
  return match ? match[1] : type;
}

// Display an account number masked to its last 4 digits (e.g. "•••• 1234").
// Returns '' for empty input so the input placeholder shows through.
export function maskAccountNumber(number?: string | null): string {
  if (!number) {
    return '';
  }
  const digits = number.replace(/\s+/g, '');
  if (digits.length <= 4) {
    return digits;
  }
  return `•••• ${digits.slice(-4)}`;
}

type TypeGroup<T> = {
  label: string;
  accounts: T[];
};

// Group accounts by their `type`, ordered the same way `ACCOUNT_TYPES`
// lists them, with accounts that have no type (or one we don't know)
// pushed to the end. Order within each group follows the input order.
export function groupAccountsByType<T extends { type?: string | null }>(
  accounts: T[],
  noTypeLabel: string,
): TypeGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const account of accounts) {
    const type = account.type ?? '';
    const list = groups.get(type);
    if (list) {
      list.push(account);
    } else {
      groups.set(type, [account]);
    }
  }

  const ordered: TypeGroup<T>[] = [];
  for (const [type, label] of ACCOUNT_TYPES) {
    if (type === '') {
      continue;
    }
    const list = groups.get(type);
    if (list && list.length > 0) {
      ordered.push({ label, accounts: list });
    }
  }
  // A type written by something else (e.g. a bank-sync provider) renders
  // after the known types, labeled by its raw value.
  for (const [type, list] of groups) {
    if (list.length > 0 && !ACCOUNT_TYPES.some(([known]) => known === type)) {
      ordered.push({ label: accountTypeLabel(type) ?? type, accounts: list });
    }
  }
  const noType = groups.get('');
  if (noType && noType.length > 0) {
    ordered.push({ label: noTypeLabel, accounts: noType });
  }
  return ordered;
}
