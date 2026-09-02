import {
  useEffect,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { useAuth } from '../../auth/AuthContext'

const PAGE_META: Record<
  string,
  {
    title: string
    subtitle: string
  }
> = {
  '/cartography': {
    title: 'MONTAGE',
    subtitle: 'CARTOGRAPHIE EN TEMPS RÉEL',
  },
  '/incidents': {
    title: 'INCIDENTS',
    subtitle: 'TRAITEMENT ET SUIVI DES INCIDENTS',
  },
  '/supervision': {
    title: 'SUPERVISION',
    subtitle: 'ÉTAT DE L’INSTALLATION',
  },
  '/administration': {
    title: 'ADMINISTRATION',
    subtitle: 'CONFIGURATION DU SYSTÈME',
  },
}

function LiveClock() {
  const [now, setNow] =
    useState(() => new Date())

  useEffect(() => {
    const interval =
      window.setInterval(
        () => setNow(new Date()),
        1000,
      )

    return () =>
      window.clearInterval(interval)
  }, [])

  const time =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      },
    ).format(now)

  const date =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(now)

  return (
    <div
      className="live-clock"
      aria-label="Date et heure locales"
    >
      <div className="live-clock__time">
        <span>{time}</span>
      </div>

      <div className="live-clock__date">
        {date}
      </div>
    </div>
  )
}

export function TopHeader() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const meta = PAGE_META[location.pathname] ?? PAGE_META['/cartography']
  const initials =
    `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'SR'

  return (
    <header className="top-header">
      <div className="page-heading">
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>

      <div className="top-header__actions">
        <div className="system-status">
          <span />
          TEMPS RÉEL ACTIF
        </div>

        <LiveClock />
        <NotificationCenter />

        <div className="profile-menu">
          <button
            className="profile-button"
            type="button"
            aria-label="Ouvrir le profil"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((value) => !value)}
          >
            <span>{initials}</span>
            <Icon name="chevron" size={16} />
          </button>

          {profileOpen && (
            <div className="profile-popover">
              <strong>
                {user?.prenom} {user?.nom}
              </strong>
              <span>{user?.email}</span>
              <small>{user?.role}</small>
              <button type="button" onClick={() => {
                setProfileOpen(false)
                void logout()
              }}>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
