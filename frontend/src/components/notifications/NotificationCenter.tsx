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
          - new Date(
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
        // Navigation remains available if acknowledgement fails.
      }
    }

    setOpen(
      false,
    )

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


  function openIncidents() {
    setOpen(
      false,
    )

    navigate(
      '/incidents',
    )
  }


  return (
    <div className="notification-center">
      <button
        className="header-icon-button notification-trigger"
        type="button"
        aria-label="Notifications opérationnelles"
        aria-expanded={
          open
        }
        onClick={
          () =>
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

        {
          unreadCount > 0
          && (
            <span className="notification-trigger__badge">
              {
                unreadCount > 9
                  ? '9+'
                  : unreadCount
              }
            </span>
          )
        }
      </button>


      {
        open
        && (
          <div className="notification-panel">
            <header className="notification-panel__header">
              <div className="notification-panel__heading">
                <strong>
                  Notifications
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

                  {
                    unreadCount > 0
                    && (
                      <>
                        {' · '}
                        {unreadCount}
                        {' '}
                        non lu
                        {
                          unreadCount
                            !== 1
                            ? 's'
                            : ''
                        }
                      </>
                    )
                  }
                </span>
              </div>

              {
                unreadCount > 0
                && (
                  <button
                    type="button"
                    className="notification-panel__read-all"
                    disabled={
                      acknowledging
                    }
                    onClick={
                      () =>
                        void acknowledgeAll()
                    }
                  >
                    {
                      acknowledging
                        ? 'Mise à jour…'
                        : 'Tout lire'
                    }
                  </button>
                )
              }
            </header>


            <div className="notification-panel__list">
              {
                notifications.length
                  === 0
                  ? (
                    <div className="notification-empty">
                      <span className="notification-empty__icon">
                        <Icon
                          name="bell"
                          size={19}
                        />
                      </span>

                      <strong>
                        Aucune notification
                      </strong>

                      <span>
                        Aucun incident actif à signaler.
                      </span>
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
                            notification.isUnread
                              ? (
                                'notification-item '
                                + 'notification-item--unread'
                              )
                              : 'notification-item'
                          }
                          key={
                            notification.id
                          }
                          onClick={
                            () =>
                              void openNotification(
                                notification,
                              )
                          }
                        >
                          <span
                            className={
                              `notification-item__severity notification-item__severity--${notification.severity}`
                            }
                            aria-hidden="true"
                          />

                          <span className="notification-item__content">
                            <span className="notification-item__top">
                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <small>
                                {
                                  relativeTime(
                                    notification.timestamp,
                                  )
                                }
                              </small>
                            </span>

                            <span className="notification-item__description">
                              {
                                notification.description
                              }
                            </span>
                          </span>
                        </button>
                      ),
                    )
                  )
              }
            </div>


            {
              notifications.length > 0
              && (
                <footer className="notification-panel__footer">
                  <button
                    type="button"
                    onClick={
                      openIncidents
                    }
                  >
                    Voir tous les incidents
                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                </footer>
              )
            }
          </div>
        )
      }
    </div>
  )
}