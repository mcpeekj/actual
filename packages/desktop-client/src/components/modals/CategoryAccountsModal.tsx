import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useUpdateCategoryAccountsMutation } from '#budget';
import { Modal, ModalCloseButton, ModalHeader } from '#components/common/Modal';
import { LabeledCheckbox } from '#components/forms/LabeledCheckbox';
import { useAccounts } from '#hooks/useAccounts';
import type { Modal as ModalType } from '#modals/modalsSlice';

type CategoryAccountsModalProps = Extract<
  ModalType,
  { name: 'category-accounts' }
>['options'];

export function CategoryAccountsModal({
  categoryId,
  categoryName,
}: CategoryAccountsModalProps) {
  const { t } = useTranslation();
  const { data: accounts = [] } = useAccounts();
  const updateCategoryAccounts = useUpdateCategoryAccountsMutation();

  // Only on-budget accounts can be scoped -- the server drops off-budget
  // (and tombstoned) accounts on save, so don't offer them here either.
  const onBudgetAccounts = accounts.filter(
    account => !account.offbudget && !account.tombstone,
  );

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const scoping: Record<
        CategoryEntity['id'],
        Array<CategoryEntity['id']>
      > = await send('category-accounts');
      if (!cancelled) {
        setSelected(new Set(scoping[categoryId] ?? []));
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  function onToggle(accountId: string, checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(accountId);
      } else {
        next.delete(accountId);
      }
      return next;
    });
  }

  async function onSave(state: { close: () => void }) {
    setSaving(true);
    try {
      await updateCategoryAccounts.mutateAsync({
        id: categoryId,
        accountIds: [...selected],
      });
      state.close();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      name="category-accounts"
      containerProps={{ style: { width: '30vw' } }}
    >
      {({ state }) => (
        <>
          <ModalHeader
            title={t('Accounts for {{name}}', { name: categoryName })}
            rightContent={<ModalCloseButton onPress={() => state.close()} />}
          />
          <View style={{ lineHeight: 1.5 }}>
            <Text>
              <Trans>
                Select the accounts whose transactions count toward this
                category's budget. With nothing selected, spend is counted from
                every on-budget account.
              </Trans>
            </Text>
            <View
              style={{
                marginTop: 12,
                marginBottom: 4,
                maxHeight: 320,
                overflowY: 'auto',
                border: `1px solid ${theme.tableBorder}`,
                borderRadius: 4,
                padding: 8,
              }}
            >
              {!loaded ? (
                <Text>{t('Loading accounts...')}</Text>
              ) : (
                onBudgetAccounts.map(account => (
                  <LabeledCheckbox
                    key={account.id}
                    id={`cat-account-${account.id}`}
                    checked={selected.has(account.id)}
                    onChange={event =>
                      onToggle(account.id, event.target.checked)
                    }
                  >
                    {account.name}
                  </LabeledCheckbox>
                ))
              )}
            </View>
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Button
                variant="primary"
                onPress={() => onSave(state)}
                isDisabled={saving || !loaded}
              >
                {t('Save')}
              </Button>
            </View>
          </View>
        </>
      )}
    </Modal>
  );
}
