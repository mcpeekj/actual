import React from 'react';
import { useTranslation } from 'react-i18next';

import { Cell, TableHeader } from '#components/table';

type AccountsHeaderProps = {
  unlinked: boolean;
  // The bank-website URL column only appears for SimpleFIN sections.
  showUrl?: boolean;
};

export function AccountsHeader({ unlinked, showUrl }: AccountsHeaderProps) {
  const { t } = useTranslation();

  return (
    <TableHeader>
      <Cell
        value={t('Account')}
        width={!unlinked ? 250 : 'flex'}
        style={{ paddingLeft: '10px' }}
      />
      {!unlinked && (
        <>
          <Cell
            value={t('Bank')}
            width="flex"
            style={{ paddingLeft: '10px' }}
          />
          {showUrl && (
            <Cell
              value={t('URL')}
              width="flex"
              style={{ paddingLeft: '10px' }}
            />
          )}
          <Cell
            value={t('Last sync')}
            width={160}
            style={{ paddingLeft: '10px' }}
          />
          <Cell value="" width={100} style={{ paddingLeft: '10px' }} />
        </>
      )}
    </TableHeader>
  );
}
