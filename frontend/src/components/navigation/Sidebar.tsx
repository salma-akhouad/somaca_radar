import { NavLink } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { RadarMark } from './RadarMark'
import { SomacaCompanyMark } from './SomacaCompanyMark'

const navigation = [
  { label: 'Cartographie', icon: 'map' as const, to: '/cartography' },
  { label: 'Incidents', icon: 'warning' as const, to: '/incidents' },
  { label: 'Machines', icon: 'tools' as const, to: '/machines' },
  { label: 'Analyses', icon: 'chart' as const, to: '/analyses' },
  { label: 'Historique', icon: 'history' as const, to: '/history' },
  { label: 'Paramètres', icon: 'settings' as const, to: '/settings' },
]

interface SidebarProps { collapsed: boolean; onToggle: () => void }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}><div className="brand brand--header"><RadarMark compact /><div className="brand__wordmark"><strong>SOMACA</strong><span>RADAR</span></div></div><button className="sidebar-toggle" type="button" onClick={onToggle} aria-label={collapsed ? 'Développer la navigation' : 'Réduire la navigation'} title={collapsed ? 'Développer la navigation' : 'Réduire la navigation'}><Icon name="chevron" size={16} /></button><div className="vehicle-placeholder" aria-label="Emplacement visuel automobile approuvé à ajouter"><div className="vehicle-placeholder__car"><span /><i /><b /></div><p>Asset automobile<br />à venir</p></div><div className="group-placeholder"><span className="group-placeholder__diamond">◇</span> RENAULT GROUP</div><nav className="sidebar__nav" aria-label="Navigation principale">{navigation.map((item) => <NavLink key={item.label} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} title={collapsed ? item.label : undefined}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav><div className="somaca-company-block"><SomacaCompanyMark /></div></aside>
}
