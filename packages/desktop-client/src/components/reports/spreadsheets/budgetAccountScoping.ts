import { send } from '@actual-app/core/platform/client/connection';

// Which accounts (if any) each category's budget is scoped to. An empty list
// means "all on-budget accounts" -- the default behavior. Only categories with
// at least one assigned account appear as keys.
export async function getCategoryAccountsScoping(): Promise<
  Record<string, string[]>
> {
  return send('category-accounts');
}

// Builds an AQL filter that restricts each account-scoped category to its
// assigned accounts, so reports agree with the budget table. Returns null when
// no category is scoped (the common case) so callers can skip the filter and
// avoid an extra query.
export async function getBudgetAccountScopingFilter(): Promise<Record<
  string,
  unknown
> | null> {
  const scoping = await getCategoryAccountsScoping();

  const scopedEntries = Object.entries(scoping).filter(
    ([, accountIds]) => accountIds.length > 0,
  );
  if (scopedEntries.length === 0) {
    return null;
  }

  const { list: categories } = await send('get-categories');
  const scopedIds = new Set(scopedEntries.map(([categoryId]) => categoryId));
  const unscopedCategoryIds = categories
    .filter(category => !scopedIds.has(category.id))
    .map(category => category.id);

  const branches: Record<string, unknown>[] = [
    // Uncategorized transactions (transfers, category-less rows) are unaffected.
    { category: null },
  ];
  if (unscopedCategoryIds.length > 0) {
    // Categories without scoping count spend from every on-budget account.
    branches.push({ category: { $oneof: unscopedCategoryIds } });
  }
  for (const [categoryId, accountIds] of scopedEntries) {
    branches.push({
      $and: [{ category: categoryId }, { account: { $oneof: accountIds } }],
    });
  }

  return { $or: branches };
}
