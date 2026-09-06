import {
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import type {
  OperationsNotification,
} from '../../api/types'

import {
  useOperations,
} from '../../operations/OperationsContext'

import {
  Icon,
} from '../common/Icon'


function relativeTime(
  value: string,
) {
  const seconds =
    Math.max(
      1,
      Math.round(
        (
          Date.now()
          -
          new Date(
            value,
          ).getTime()
        )
        / 1000,
      ),
    )

  if (
    seconds < 60
  ) {
    return 'À l’instant'
  }

  const minutes =
    Math.round(
      seconds / 60,
    )

  if (
    minutes < 60
  ) {
    return `Il y a ${minutes} min`
  }

  const hours =
    Math.round(
      minutes / 60,
    )

  if (
    hours < 24
  ) {
    return `Il y a ${hours} h`
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: '2-digit',
      month: 'short',
    },
  ).format(
    new Date(value),
  )
}


export function NotificationCenter() {
  const [
    open,
    setOpen,
  ] =
    useState(false)

  const [
    acknowledging,
    setAcknowledging,
  ] =
    useState(false)

  const navigate =
    useNavigate()

  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markNotificationsRead,
  } =
    useOperations()


  async function acknowledgeAll() {
    if (
      unreadCount === 0
      || acknowledging
    ) {
      return
    }

    setAcknowledging(
      true,
    )

    try {
      await markNotificationsRead()
    } finally {
      setAcknowledging(
        false,
      )
    }
  }


  async function openNotification(
    notification:
      OperationsNotification,
  ) {
    if (
      notification.isUnread
    ) {
      try {
        await markNotificationRead(
          notification,
        )
      } catch {
        /*
         * Navigation remains available even if acknowledgement
         * cannot be persisted. Authentication failures are already
         * handled centrally by the shared API client.
         */
      }
    }

    setOpen(false)

    navigate(
      '/cartography',
      {
        state: {
          focusPoleId:
            notification.poleId,

          incidentId:
            notification.incidentId,
        },
      },
    )
  }


  return (
    <div className="notification-center">
      <button
        className="header-icon-button notification-trigger"
        type="button"
        aria-label="Notifications opérationnelles"
        aria-expanded={open}

        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
      >
        <Icon
          name="bell"
          size={21}
        />

        {unreadCount > 0 && (
          <span className="notification-trigger__badge">
            {
              unreadCount > 9
                ? '9+'
                : unreadCount
            }
          </span>
        )}
      </button>


      {open && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <div>
              <strong>
                ALERTES EN COURS
              </strong>

              <span>
                {notifications.length}
                {' '}
                événement
                {
                  notifications.length
                    !== 1
                    ? 's'
                    : ''
                }
              </span>
            </div>


            <div className="notification-panel__actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-button"
                  disabled={
                    acknowledging
                  }

                  onClick={() =>
                    void acknowledgeAll()
                  }
                >
                  {
                    acknowledging
                      ? 'Mise à jour…'
                      : 'Tout marquer comme lu'
                  }
                </button>
              )}

              <button
                type="button"
                className="text-button"

                onClick={() => {
                  setOpen(false)

                  navigate(
                    '/incidents',
                  )
                }}
              >
                Voir les incidents
              </button>
            </div>
          </div>


          <div className="notification-panel__list">
            {
              notifications.length
                === 0
                ? (
                  <div className="notification-empty">
                    <span className="status-dot status-dot--operational" />

                    Aucun incident actif
                  </div>
                )
                : (
                  notifications.map(
                    (
                      notification,
                    ) => (
                      <button
                        type="button"

                        className={
                          `notification-item ${notification.isUnread
                            ? 'notification-item--unread'
                            : ''
                          }`
                        }

                        key={
                          notification.id
                        }

                        onClick={() =>
                          void openNotification(
                            notification,
                          )
                        }
                      >
                        <span
                          className={
                            `notification-item__severity notification-item__severity--${notification.severity}`
                          }
                        />

                        <span className="notification-item__content">
                          {
                            notification.isUnread
                            && (
                              <small className="notification-item__new">
                                NOUVEAU
                              </small>
                            )
                          }

                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <span>
                            {
                              notification.description
                            }
                          </span>

                          <small>
                            {
                              relativeTime(
                                notification.timestamp,
                              )
                            }
                          </small>
                        </span>
                      </button>
                    ),
                  )
                )
            }
          </div>
        </div>
      )}
    </div>
  )
}