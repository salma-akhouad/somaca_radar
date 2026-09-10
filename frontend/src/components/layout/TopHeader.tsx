import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  useLocation,
} from 'react-router-dom'

import type {
  RoleName,
} from '../../api/types'
import {
  useAuth,
} from '../../auth/AuthContext'
import {
  useOperations,
} from '../../operations/OperationsContext'
import {
  Icon,
} from '../common/Icon'
import {
  NotificationCenter,
} from '../notifications/NotificationCenter'


interface PageMeta {
  eyebrow: string
  title: string
  subtitle: string
}


const PAGE_META:
  Record<string, PageMeta> = {
    '/cartography': {
      eyebrow:
        'ATELIER MONTAGE',
      title:
        'CARTOGRAPHIE',
      subtitle:
        'Visualisation 3D et suivi en temps réel.',
    },

    '/incidents': {
      eyebrow:
        'SUIVI OPÉRATIONNEL',
      title:
        'INCIDENTS',
      subtitle:
        'Traitement et suivi des incidents.',
    },

    '/supervision': {
      eyebrow:
        'TABLEAU DE BORD',
      title:
        'ÉTAT DE L’USINE',
      subtitle:
        'Vue consolidée de la santé opérationnelle.',
    },

    '/administration': {
      eyebrow:
        'GESTION DU SYSTÈME',
      title:
        'ADMINISTRATION',
      subtitle:
        'Configuration et gouvernance du système.',
    },
  }


const REALTIME_LABELS = {
  connected:
    'TEMPS RÉEL ACTIF',
  connecting:
    'CONNEXION TEMPS RÉEL',
  fallback:
    'MODE DE SECOURS',
  unavailable:
    'CONNEXION INDISPONIBLE',
} as const


const ROLE_LABELS:
  Record<RoleName, string> = {
    operateur_de_production:
      'Opérateur de production',
    superviseur:
      'Superviseur',
    technicien:
      'Technicien',
    administrateur:
      'Administrateur',
  }


function LiveClock() {
  const [
    now,
    setNow,
  ] =
    useState(
      () =>
        new Date(),
    )

  const millisecondsRef =
    useRef<
      HTMLSpanElement | null
    >(null)

  useEffect(() => {
    const secondsTimer =
      window.setInterval(
        () =>
          setNow(
            new Date(),
          ),
        1000,
      )

    const millisecondsTimer =
      window.setInterval(
        () => {
          if (
            !millisecondsRef.current
          ) {
            return
          }

          millisecondsRef.current
            .textContent =
            `.${String(
              new Date()
                .getMilliseconds(),
            ).padStart(
              3,
              '0',
            )}`
        },
        40,
      )

    return () => {
      window.clearInterval(
        secondsTimer,
      )

      window.clearInterval(
        millisecondsTimer,
      )
    }
  }, [])


  const time =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        hour:
          '2-digit',
        minute:
          '2-digit',
        second:
          '2-digit',
        hour12:
          false,
      },
    ).format(
      now,
    )


  const date =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        weekday:
          'short',
        day:
          '2-digit',
        month:
          'short',
        year:
          'numeric',
      },
    ).format(
      now,
    )


  return (
    <div
      className="live-clock"
      aria-label="Date et heure locales"
    >
      <div className="live-clock__time">
        <span>
          {time}

          <span
            ref={
              millisecondsRef
            }
            className="live-clock__milliseconds"
          >
            .000
          </span>
        </span>
      </div>

      <div className="live-clock__date">
        {date}
      </div>
    </div>
  )
}


export function TopHeader() {
  const location =
    useLocation()

  const {
    user,
    logout,
  } =
    useAuth()

  const {
    realtimeStatus,
  } =
    useOperations()

  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false)


  const meta =
    PAGE_META[
      location.pathname
    ]
    ?? PAGE_META[
      '/cartography'
    ]


  const initials =
    (
      `${user?.prenom?.[0] ?? ''}`
      + `${user?.nom?.[0] ?? ''}`
    ).toUpperCase()
    || 'SR'


  const roleLabel =
    user
      ? ROLE_LABELS[
          user.role
        ]
      : ''


  return (
    <header className="top-header">
      <div className="page-heading">
        <span className="page-heading__eyebrow">
          {meta.eyebrow}
        </span>

        <div className="page-heading__title">
          <h1>
            {meta.title}
          </h1>

          <i
            aria-hidden="true"
          />
        </div>

        <p>
          {meta.subtitle}
        </p>
      </div>


      <div className="top-header__actions">
        <div
          className={
            `system-status system-status--${realtimeStatus}`
          }
          aria-live="polite"
        >
          <span />

          {
            REALTIME_LABELS[
              realtimeStatus
            ]
          }
        </div>


        <LiveClock />


        <NotificationCenter />


        <div className="profile-menu">
          <button
            className="profile-button"
            type="button"
            aria-label="Ouvrir le profil"
            aria-expanded={
              profileOpen
            }
            onClick={
              () =>
                setProfileOpen(
                  (value) =>
                    !value,
                )
            }
          >
            <span>
              {initials}
            </span>

            <Icon
              name="chevron"
              size={16}
            />
          </button>


          {
            profileOpen
            && (
              <div className="profile-popover">
                <strong>
                  {
                    user?.prenom
                  } {
                    user?.nom
                  }
                </strong>

                <span>
                  {
                    user?.email
                  }
                </span>

                <small>
                  {roleLabel}
                </small>

                <button
                  type="button"
                  onClick={
                    () => {
                      setProfileOpen(
                        false,
                      )

                      void logout()
                    }
                  }
                >
                  Se déconnecter
                </button>
              </div>
            )
          }
        </div>
      </div>
    </header>
  )
}