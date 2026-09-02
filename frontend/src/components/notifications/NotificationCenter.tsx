import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { useOperations } from '../../operations/OperationsContext'

function relativeTime(value: string) {
  const seconds = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / 1000),
  )

  if (seconds < 60) return 'À l’instant'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} min`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Il y a ${hours} h`

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markNotificationsRead,
  } = useOperations()

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) markNotificationsRead()
  }

  return (
    <div className="notification-center">
      <button
        className="header-icon-button notification-trigger"
        type="button"
        aria-label="Notifications opérationnelles"
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon name="bell" size={21} />

        {unreadCount > 0 && (
          <span className="notification-trigger__badge">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <div>
              <strong>ALERTES EN COURS</strong>
              <span>
                {notifications.length} événement
                {notifications.length !== 1 ? 's' : ''}
              </span>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setOpen(false)
                navigate('/incidents')
              }}
            >
              Voir les incidents
            </button>
          </div>

          <div className="notification-panel__list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="status-dot status-dot--operational" />
                Aucun incident actif
              </div>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <button
                  type="button"
                  className="notification-item"
                  key={notification.id}
                  onClick={() => {
                    setOpen(false)
                    navigate('/cartography', {
                      state: {
                        focusPoleId: notification.poleId,
                        incidentId: notification.incidentId,
                      },
                    })
                  }}
                >
                  <span
                    className={`notification-item__severity notification-item__severity--${notification.level}`}
                  />

                  <span className="notification-item__content">
                    <strong>{notification.title}</strong>
                    <span>{notification.description}</span>
                    <small>{relativeTime(notification.timestamp)}</small>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
