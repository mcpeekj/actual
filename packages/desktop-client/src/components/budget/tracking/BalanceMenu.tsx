import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Menu } from '@actual-app/components/menu';

import { trackingBudget } from '#spreadsheet/bindings';

import { useTrackingSheetValue } from './TrackingBudgetComponents';

type BalanceMenuProps = Omit<
  ComponentPropsWithoutRef<typeof Menu>,
  'onMenuSelect' | 'items'
> & {
  categoryId: string;
  onCarryover: (carryover: boolean) => void;
  onRollover?: (rollover: boolean) => void;
};

export function BalanceMenu({
  categoryId,
  onCarryover,
  onRollover,
  ...props
}: BalanceMenuProps) {
  const { t } = useTranslation();
  const carryover = useTrackingSheetValue(
    trackingBudget.catCarryover(categoryId),
  );
  const rollover = useTrackingSheetValue(
    trackingBudget.catRollover(categoryId),
  );
  return (
    <Menu
      {...props}
      onMenuSelect={name => {
        switch (name) {
          case 'carryover':
            onCarryover?.(!carryover);
            break;
          case 'rollover':
            onRollover?.(!rollover);
            break;
          default:
            throw new Error(`Unrecognized menu option: ${String(name)}`);
        }
      }}
      items={[
        {
          name: 'rollover',
          text: rollover
            ? t('Reset at month end')
            : t('Roll over to next month'),
        },
        ...(rollover
          ? [
              {
                name: 'carryover',
                text: carryover
                  ? t('Remove overspending rollover')
                  : t('Rollover overspending'),
              },
            ]
          : []),
      ]}
    />
  );
}
