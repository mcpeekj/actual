import React, { useEffect, useEffectEvent, useRef } from 'react';
import type { ReactElement } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Route, Routes, useHref, useLocation } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as undo from '@actual-app/core/platform/client/undo';

import { getLatestAppVersion, sync } from '#app/appSlice';
import { ProtectedRoute } from '#auth/ProtectedRoute';
import { Permissions } from '#auth/types';
import { useAccounts } from '#hooks/useAccounts';
import { useMetaThemeColor } from '#hooks/useMetaThemeColor';
import { useNavigate } from '#hooks/useNavigate';
import { ScrollProvider } from '#hooks/useScrollListener';
import { useDispatch } from '#redux';

import { UserAccessPage } from './admin/UserAccess/UserAccessPage';
import { UserDirectoryPage } from './admin/UserDirectory/UserDirectoryPage';
import { BankSyncStatus } from './BankSyncStatus';
import { CommandBar } from './CommandBar';
import { ContextMenu } from './ContextMenu';
import { EnableBankingCallback } from './EnableBankingCallback';
import { FeatureErrorFallback } from './FeatureErrorFallback';
import { GlobalKeys } from './GlobalKeys';
import { MobileBankSyncAccountEditPage } from './mobile/banksync/MobileBankSyncAccountEditPage';
import { MobileNavTabs } from './mobile/MobileNavTabs';
import { TransactionEdit } from './mobile/transactions/TransactionEdit';
import { Notifications } from './Notifications';
import { MobilePageHeaderProvider, MobilePageHeaderSlot } from './Page';
import { Reports } from './reports';
import { LoadingIndicator } from './reports/LoadingIndicator';
import { NarrowAlternate, WideComponent } from './responsive';
import { useMultiuserEnabled } from './ServerContext';
import { Settings } from './settings';
import { FloatableSidebar } from './sidebar';
import { ManageTagsPage } from './tags/ManageTagsPage';
import { Titlebar } from './Titlebar';

function NarrowNotSupported({
  redirectTo = '/budget',
  children,
}: {
  redirectTo?: string;
  children: ReactElement;
}) {
  const { isNarrowWidth } = useResponsive();
  const navigate = useNavigate();
  useEffect(() => {
    if (isNarrowWidth) {
      void navigate(redirectTo);
    }
  }, [isNarrowWidth, navigate, redirectTo]);
  return isNarrowWidth ? null : children;
}

function WideNotSupported({
  children,
  redirectTo = '/budget',
}: {
  redirectTo?: string;
  children: ReactElement;
}) {
  const { isNarrowWidth } = useResponsive();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNarrowWidth) {
      void navigate(redirectTo);
    }
  }, [isNarrowWidth, navigate, redirectTo]);
  return isNarrowWidth ? children : null;
}

function RouterBehaviors() {
  const location = useLocation();
  const href = useHref(location);
  useEffect(() => {
    undo.setUndoState('url', href);
  }, [href]);

  return null;
}

export function FinancesApp() {
  const { isNarrowWidth } = useResponsive();
  useMetaThemeColor(theme.mobileViewTheme);

  const location = useLocation();
  const dispatch = useDispatch();

  const { data: accounts, isFetching: isAccountsFetching } = useAccounts();

  const multiuserEnabled = useMultiuserEnabled();

  const init = useEffectEvent(() => {
    // Wait a little bit to make sure the sync button will get the
    // sync start event. This can be improved later.
    setTimeout(async () => {
      await dispatch(sync());
    }, 100);
  });

  useEffect(() => init(), []);

  useEffect(() => {
    void dispatch(getLatestAppVersion());
  }, [dispatch]);

  const scrollableRef = useRef<HTMLDivElement>(null);

  return (
    <View style={{ height: '100%' }}>
      <RouterBehaviors />
      <GlobalKeys />
      <CommandBar />
      <ContextMenu />
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.pageBackground,
          flex: 1,
        }}
      >
        <FloatableSidebar />

        <View
          style={{
            color: theme.pageText,
            backgroundColor: theme.pageBackground,
            flex: 1,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <ScrollProvider
            isDisabled={!isNarrowWidth}
            scrollableRef={scrollableRef}
          >
            <MobilePageHeaderProvider>
              <View
                ref={scrollableRef}
                style={{
                  flex: 1,
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                <Titlebar
                  style={{
                    WebkitAppRegion: 'drag',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                  }}
                />
                <Notifications />
                <BankSyncStatus />
                {isNarrowWidth && <MobilePageHeaderSlot />}

                <Routes>
                  <Route
                    path="/"
                    element={
                      isAccountsFetching || !accounts ? (
                        <LoadingIndicator />
                      ) : accounts.length > 0 ? (
                        <Navigate to="/budget" replace />
                      ) : (
                        // If there are no accounts, we want to redirect the user to
                        // the All Accounts screen which will prompt them to add an account
                        <Navigate to="/accounts" replace />
                      )
                    }
                  />

                  <Route path="/reports/*" element={<Reports />} />

                  <Route
                    path="/budget"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="Budget" />
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/schedules"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="Schedules" />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/schedules/:id"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <WideNotSupported>
                          <NarrowAlternate name="ScheduleEdit" />
                        </WideNotSupported>
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/payees"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="Payees" />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/payees/:id"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <WideNotSupported>
                          <NarrowAlternate name="PayeeEdit" />
                        </WideNotSupported>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/rules"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="Rules" />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/rules/:id"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="RuleEdit" />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/bank-sync"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="BankSync" />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/bank-sync/account/:accountId/edit"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <WideNotSupported redirectTo="/bank-sync">
                          <MobileBankSyncAccountEditPage />
                        </WideNotSupported>
                      </ErrorBoundary>
                    }
                  />
                  <Route path="/tags" element={<ManageTagsPage />} />
                  <Route path="/settings" element={<Settings />} />

                  <Route
                    path="/gocardless/link"
                    element={
                      <NarrowNotSupported>
                        <WideComponent name="GoCardlessLink" />
                      </NarrowNotSupported>
                    }
                  />

                  <Route
                    path="/enablebanking/auth_callback"
                    element={<EnableBankingCallback />}
                  />

                  <Route
                    path="/accounts"
                    element={<NarrowAlternate name="Accounts" />}
                  />

                  <Route
                    path="/accounts/:id"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <NarrowAlternate name="Account" />
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/transactions/:transactionId"
                    element={
                      <ErrorBoundary
                        FallbackComponent={FeatureErrorFallback}
                        resetKeys={[location.pathname]}
                      >
                        <WideNotSupported>
                          <TransactionEdit />
                        </WideNotSupported>
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/categories/:id"
                    element={<NarrowAlternate name="Category" />}
                  />
                  {multiuserEnabled && (
                    <Route
                      path="/user-directory"
                      element={
                        <ProtectedRoute
                          permission={Permissions.ADMINISTRATOR}
                          element={<UserDirectoryPage />}
                        />
                      }
                    />
                  )}
                  {multiuserEnabled && (
                    <Route
                      path="/user-access"
                      element={
                        <ProtectedRoute
                          permission={Permissions.ADMINISTRATOR}
                          validateOwner
                          element={<UserAccessPage />}
                        />
                      }
                    />
                  )}
                  {/* redirect all other traffic to the budget page */}
                  <Route
                    path="/*"
                    element={<Navigate to="/budget" replace />}
                  />
                </Routes>
              </View>

              <Routes>
                <Route path="/budget" element={<MobileNavTabs />} />
                <Route path="/accounts" element={<MobileNavTabs />} />
                <Route path="/settings" element={<MobileNavTabs />} />
                <Route path="/reports" element={<MobileNavTabs />} />
                <Route
                  path="/reports/:dashboardId"
                  element={<MobileNavTabs />}
                />
                <Route path="/bank-sync" element={<MobileNavTabs />} />
                <Route path="/rules" element={<MobileNavTabs />} />
                <Route path="/payees" element={<MobileNavTabs />} />
                <Route path="/schedules" element={<MobileNavTabs />} />
                <Route path="*" element={null} />
              </Routes>
            </MobilePageHeaderProvider>
          </ScrollProvider>
        </View>
      </View>
    </View>
  );
}
