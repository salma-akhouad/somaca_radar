import {
  useState,
} from 'react'

import {
  Outlet,
  useLocation,
} from 'react-router-dom'

import {
  useAuth,
} from '../../auth/AuthContext'

import {
  SomacaHelperContextProvider,
  useSomacaHelperContext,
} from '../../helper/SomacaHelperContext'

import {
  SomacaHelperLauncher,
} from '../helper/SomacaHelperLauncher'

import {
  Sidebar,
} from '../navigation/Sidebar'

import {
  TopHeader,
} from './TopHeader'


function AppShell() {
  const location =
    useLocation()

  const {
    loading: authLoading,
  } =
    useAuth()

  const {
    displayState,
  } =
    useSomacaHelperContext()

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] =
    useState(false)

  const isCartography =
    location.pathname
    === '/cartography'

  const helperOpen =
    displayState === 'open'

  return (
    <div
      className={
        helperOpen
          ? 'app-shell app-shell--helper-open'
          : 'app-shell'
      }
    >
      <Sidebar
        collapsed={
          sidebarCollapsed
        }
        onToggle={
          () =>
            setSidebarCollapsed(
              (value) =>
                !value,
            )
        }
      />

      <div className="workspace">
        <TopHeader />

        <main
          className={
            isCartography
              ? (
                  'main-content '
                  + 'main-content--map'
                )
              : (
                  'main-content '
                  + 'main-content--page'
                )
          }
        >
          {
            authLoading
              ? (
                  <div
                    className="route-loading"
                    role="status"
                    aria-live="polite"
                  >
                    <div
                      className="app-loading__mark"
                      aria-hidden="true"
                    />

                    <span>
                      {
                        isCartography
                          ? 'CHARGEMENT DE LA CARTOGRAPHIE'
                          : 'CHARGEMENT DE L’INTERFACE'
                      }
                    </span>
                  </div>
                )
              : (
                  <Outlet />
                )
          }
        </main>
      </div>

      {
        !authLoading
        && (
          <SomacaHelperLauncher />
        )
      }
    </div>
  )
}


export function AppLayout() {
  return (
    <SomacaHelperContextProvider>
      <AppShell />
    </SomacaHelperContextProvider>
  )
}
