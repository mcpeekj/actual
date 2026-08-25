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
