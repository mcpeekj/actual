import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Menu } from '@actual-app/components/menu';

import { envelopeBudget } from '#spreadsheet/bindings';

import { useEnvelopeSheetValue } from './EnvelopeBudgetComponents';

type BalanceMenuProps = Omit<
  ComponentPropsWithoutRef<typeof Menu>,
  'onMenuSelect' | 'items'
> & {
  categoryId: string;
  onTransfer?: () => void;
  onCarryover?: (carryOver: boolean) => void;
  onRollover?: (rollover: boolean) => void;
  onCover?: () => void;
};

export function BalanceMenu({
  categoryId,
  onTransfer,
  onCarryover,
  onRollover,
  onCover,
  ...props
}: BalanceMenuProps) {
  const { t } = useTranslation();

  const carryover = useEnvelopeSheetValue(
    envelopeBudget.catCarryover(categoryId),
  );
  const rollover = useEnvelopeSheetValue(
    envelopeBudget.catRollover(categoryId),
  );
  const balance =
    useEnvelopeSheetValue(envelopeBudget.catBalance(categoryId)) ?? 0;

  return (
    <Menu
      {...props}
      onMenuSelect={name => {
        switch (name) {
          case 'transfer':
            onTransfer?.();
            break;
          case 'carryover':
            onCarryover?.(!carryover);
            break;
          case 'rollover':
            onRollover?.(!rollover);
            break;
          case 'cover':
            onCover?.();
            break;
          default:
            throw new Error(`Unrecognized menu option: ${name}`);
        }
      }}
      items={[
        ...(balance > 0
          ? [
              {
                name: 'transfer',
                text: t('Transfer to another category'),
              },
            ]
          : []),
        ...(balance < 0
          ? [
              {
                name: 'cover',
                text: t('Cover overspending'),
              },
            ]
          : []),
        {
          name: 'rollover',
          text: rollover
            ? t('Reset at month end')
            : t('Roll over to next month'),
        },
        // Overspending rollover only means anything for categories that
        // accumulate month to month.
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
