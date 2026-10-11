import {
  NavLink,
} from 'react-router-dom'

import {
  useAuth,
} from '../../auth/AuthContext'
import {
  Icon,
} from '../common/Icon'
import {
  RadarMark,
} from './RadarMark'
import {
  SomacaCompanyMark,
} from './SomacaCompanyMark'
import renaultBlackCar from '../../assets/Renault Kardian noir.png'
import renaultGroupLogo from "../../assets/Black Renault Logo.png"


const operationalNavigation = [
  {
    label:
      'Cartographie',
    icon:
      'map' as const,
    to:
      '/cartography',
  },
  {
    label:
      'Incidents',
    icon:
      'warning' as const,
    to:
      '/incidents',
  },
  {
    label:
      'État de l’usine',
    icon:
      'chart' as const,
    to:
      '/supervision',
  },
]


interface SidebarProps {
  collapsed:
  boolean
  onToggle:
  () => void
}


export function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const {
    isAdmin,
  } =
    useAuth()

  const navigation =
    isAdmin
      ? [
        ...operationalNavigation,
        {
          label:
            'Administration',
          icon:
            'settings' as const,
          to:
            '/administration',
        },
      ]
      : operationalNavigation

  return (
    <aside
      className={
        `sidebar ${collapsed
          ? 'sidebar--collapsed'
          : ''
        }`
      }
    >
      <div className="brand brand--header">
        <RadarMark compact />

        <div className="brand__wordmark">
          <strong>
            SOMACA
          </strong>

          <span>
            RADAR
          </span>
        </div>
      </div>

      <button
        className="sidebar-toggle"
        type="button"
        onClick={
          onToggle
        }
        aria-label={
          collapsed
            ? 'Développer la navigation'
            : 'Réduire la navigation'
        }
        title={
          collapsed
            ? 'Développer la navigation'
            : 'Réduire la navigation'
        }
      >
        <Icon
          name="chevron"
          size={16}
        />
      </button>


      <div
        className="sidebar-automotive"
        aria-hidden="true"
      >
        <img
          className="sidebar-automotive__car"
          src={renaultBlackCar}
          alt=""
        />

        <img
          className="sidebar-automotive__renault"
          src={renaultGroupLogo}
          alt=""
        />
      </div>

      <nav
        className="sidebar__nav"
        aria-label="Navigation principale"
      >
        {
          navigation.map(
            (item) => (
              <NavLink
                key={
                  item.to
                }
                to={
                  item.to
                }
                className={
                  ({
                    isActive,
                  }) =>
                    `nav-item ${isActive
                      ? 'nav-item--active'
                      : ''
                    }`
                }
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
              >
                <Icon
                  name={
                    item.icon
                  }
                />

                <span>
                  {
                    item.label
                  }
                </span>
              </NavLink>
            ),
          )
        }
      </nav>

      <div className="somaca-company-block">
        <SomacaCompanyMark />
      </div>
    </aside>
  )
}