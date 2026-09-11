import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import {
  SvgCheveronDown,
  SvgCog,
  SvgCreditCard,
  SvgReports,
  SvgStoreFront,
  SvgTag,
  SvgTuning,
  SvgWallet,
} from '@actual-app/components/icons/v1';
import { SvgCalendar3 } from '@actual-app/components/icons/v2';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';
import { useToggle } from 'usehooks-ts';

import { Link } from '#components/common/Link';
import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useNavigate } from '#hooks/useNavigate';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

// Routes that live under the "More" menu. When one is active, the
// More tab shows as selected.
const MORE_ROUTES = [
  '/reports',
  '/payees',
  '/rules',
  '/bank-sync',
  '/tags',
  '/settings',
];

const tabItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 15,
  fontWeight: 500,
  color: theme.pageTextSubdued,
  textDecoration: 'none',
  padding: '7px 12px',
  borderBottom: '2px solid transparent',
  ':hover': {
    color: theme.pageText,
  },
};

const tabItemActiveStyle = {
  color: theme.sidebarItemTextSelected,
  borderBottom: `2px solid ${theme.sidebarItemTextSelected}`,
};

export function TabBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, toggleMenuOpen, setMenuOpen] = useToggle();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const syncServerStatus = useSyncServerStatus();
  const isTestEnv = useIsTestEnv();
  const isUsingServer = syncServerStatus !== 'no-server' || isTestEnv;

  const moreActive = MORE_ROUTES.some(route =>
    location.pathname.startsWith(route),
  );

  const moreItems = [
    { name: 'reports', text: t('Reports'), icon: SvgReports },
    { name: 'payees', text: t('Payees'), icon: SvgStoreFront },
    { name: 'rules', text: t('Rules'), icon: SvgTuning },
    ...(isUsingServer
      ? [{ name: 'bank-sync', text: t('Bank Sync'), icon: SvgCreditCard }]
      : []),
    { name: 'tags', text: t('Tags'), icon: SvgTag },
    { name: 'settings', text: t('Settings'), icon: SvgCog },
  ];

  const onMoreSelect = (item: string) => {
    setMenuOpen(false);
    navigate(`/${item}`);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Link
        variant="internal"
        to="/budget"
        style={tabItemStyle}
        activeStyle={tabItemActiveStyle}
      >
        <SvgWallet width={15} height={15} />
        <Trans>Budget</Trans>
      </Link>
      <Link
        variant="internal"
        to="/schedules"
        style={tabItemStyle}
        activeStyle={tabItemActiveStyle}
      >
        <SvgCalendar3 width={15} height={15} />
        <Trans>Schedules</Trans>
      </Link>
      <button
        ref={menuButtonRef}
        onClick={toggleMenuOpen}
        className={css({
          ...tabItemStyle,
          ...(moreActive ? tabItemActiveStyle : {}),
          background: 'transparent',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          cursor: 'pointer',
          font: 'inherit',
        })}
      >
        <Trans>More</Trans>
        <SvgCheveronDown width={13} height={13} />
      </button>
      <Popover
        placement="bottom start"
        offset={8}
        triggerRef={menuButtonRef}
        isOpen={isMenuOpen}
        onOpenChange={() => setMenuOpen(false)}
      >
        <Menu onMenuSelect={onMoreSelect} items={moreItems} />
      </Popover>
    </View>
  );
}
