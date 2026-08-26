import {
  useEffect,
  useState,
} from 'react'

import {
  Icon,
} from '../common/Icon'


function LiveClock() {
  const [
    now,
    setNow,
  ] = useState(
    () => new Date(),
  )


  useEffect(() => {
    const interval =
      window.setInterval(
        () =>
          setNow(
            new Date(),
          ),
        47,
      )

    return () =>
      window.clearInterval(
        interval,
      )
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
        <span>
          {time}
        </span>

        <small>
          .
          {String(
            now.getMilliseconds(),
          ).padStart(
            3,
            '0',
          )}
        </small>
      </div>

      <div className="live-clock__date">
        {date}
      </div>
    </div>
  )
}


export function TopHeader() {
  return (
    <header className="top-header">
      <div className="page-heading">
        <h1>
          MONTAGE
        </h1>

        <p>
          CARTOGRAPHIE EN TEMPS RÉEL
        </p>
      </div>


      <div className="top-header__actions">
        <div className="system-status">
          <span />

          TEMPS RÉEL ACTIF
        </div>


        <LiveClock />


        <button
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={21}
          />
        </button>


        <button
          className="profile-button"
          aria-label="Ouvrir le profil"
        >
          <span>
            SR
          </span>

          <Icon
            name="chevron"
            size={16}
          />
        </button>
      </div>
    </header>
  )
}