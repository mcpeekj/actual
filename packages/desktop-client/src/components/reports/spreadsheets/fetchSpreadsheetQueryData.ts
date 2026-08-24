import type {
  balanceTypeOpType,
  CategoryEntity,
  CategoryGroupEntity,
  RuleConditionEntity,
} from '@actual-app/core/types/models';
import type { SyncedPrefs } from '@actual-app/core/types/prefs';

import type { QueryDataEntity } from '#components/reports/ReportOptions';
import { aqlQuery } from '#queries/aqlQuery';

import { getBudgetAccountScopingFilter } from './budgetAccountScoping';
import { fetchBudgetData } from './budgetDataQuery';
import { makeQuery } from './makeQuery';

export async function fetchSpreadsheetQueryData({
  balanceTypeOp,
  startDate,
  endDate,
  interval,
  categories,
  categoryGroups,
  conditions,
  conditionsOp,
  conditionsOpKey,
  filters,
  budgetType,
}: {
  balanceTypeOp: balanceTypeOpType | undefined;
  startDate: string;
  endDate: string;
  interval: string;
  categories: CategoryEntity[];
  categoryGroups: CategoryGroupEntity[];
  conditions: RuleConditionEntity[];
  conditionsOp: string;
  conditionsOpKey: string;
  filters: unknown[];
  budgetType?: SyncedPrefs['budgetType'];
}): Promise<{ assets: QueryDataEntity[]; debts: QueryDataEntity[] }> {
  if (balanceTypeOp === 'totalBudgeted') {
    return fetchBudgetData({
      startDate,
      endDate,
      interval,
      categories,
      categoryGroups,
      conditions,
      conditionsOp: conditionsOp === 'or' ? 'or' : 'and',
      budgetType,
    });
  }

  // Scoped categories must count spend only from their assigned accounts, in
  // every report. Applied as a separate AND filter so it holds regardless of
  // whether the user's conditions are combined with "and" or "or".
  const scopingFilter = await getBudgetAccountScopingFilter();

  const buildQuery = (name: 'assets' | 'debts') => {
    const query = makeQuery(
      name,
      startDate,
      endDate,
      interval,
      conditionsOpKey,
      filters,
    );
    return scopingFilter ? query.filter(scopingFilter) : query;
  };

  const [assets, debts] = await Promise.all([
    aqlQuery(buildQuery('assets')).then(({ data }) => data),
    aqlQuery(buildQuery('debts')).then(({ data }) => data),
  ]);

  return { assets, debts };
}
