import { Outlet } from 'react-router-dom'
import { Sidebar } from '../navigation/Sidebar'
import { SomacaHelperLauncher } from '../helper/SomacaHelperLauncher'
import { TopHeader } from './TopHeader'
export function AppLayout() { return <div className="app-shell"><Sidebar /><div className="workspace"><TopHeader /><main className="main-content"><Outlet /></main></div><SomacaHelperLauncher /></div> }
