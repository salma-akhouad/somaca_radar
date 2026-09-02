import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SomacaHelperLauncher } from '../helper/SomacaHelperLauncher'
import { Sidebar } from '../navigation/Sidebar'
import { TopHeader } from './TopHeader'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="workspace">
        <TopHeader />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <SomacaHelperLauncher />
    </div>
  )
}
