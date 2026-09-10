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
  SomacaHelperLauncher,
} from '../helper/SomacaHelperLauncher'

import {
  Sidebar,
} from '../navigation/Sidebar'

import {
  TopHeader,
} from './TopHeader'


export function AppLayout() {
  const location =
    useLocation()

  const {
    loading: authLoading,
  } =
    useAuth()

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] =
    useState(false)

  const isCartography =
    location.pathname
    === '/cartography'

  return (
    <div className="app-shell">
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