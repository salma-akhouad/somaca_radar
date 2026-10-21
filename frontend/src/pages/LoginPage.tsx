import {
  useEffect,
  useState,
} from 'react'

import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../auth/AuthContext'

import {
  preloadCartographyPage,
} from '../routes/pageLoaders'

import loginFactoryBg from '../assets/login-factory-bg.png'

import '../styles/login.css'


function EyeIcon({
  hidden,
}: {
  hidden: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hidden ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5 9 5a15.5 15.5 0 0 1-3 3.4" />
          <path d="M6.2 6.3C4.1 7.7 3 9 3 9s3.5 5 9 5c1.2 0 2.3-.2 3.3-.6" />
        </>
      ) : (
        <>
          <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
          <circle cx="12" cy="12" r="2.3" />
        </>
      )}
    </svg>
  )
}


function RadarMark() {
  return (
    <svg
      className="login-radar-mark"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path d="M32 8a24 24 0 1 0 24 24" />
      <path d="M32 17a15 15 0 1 0 15 15" />
      <path d="M32 26a6 6 0 1 0 6 6" />
      <path d="M32 32L49 17" />
    </svg>
  )
}


function RenaultGroupMark() {
  return (
    <div
      className="login-renault-group"
      aria-label="Renault Group"
    >
      <svg
        className="login-renault-group__diamond"
        viewBox="0 0 34 44"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M17 2L31 22L17 42L3 22L17 2Z"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <path
          d="M17 8L26 22L17 36L8 22L17 8Z"
          stroke="currentColor"
          strokeWidth="2.4"
        />
      </svg>

      <span>
        RENAULT
        <br />
        GROUP
      </span>
    </div>
  )
}


export function LoginPage() {
  const {
    user,
    authNotice,
    clearAuthNotice,
    login,
  } = useAuth()

  const navigate = useNavigate()

  const [email, setEmail] = useState(import.meta.env.VITE_DEMO_MODE === 'true' ? 'visiteur@demo.invalid' : '')
  const [password, setPassword] = useState(import.meta.env.VITE_DEMO_MODE === 'true' ? 'demonstration' : '')
  const [showPassword, setShowPassword] =
    useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadCartographyPage()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  if (user) {
    return (
      <Navigate
        to="/cartography"
        replace
      />
    )
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setSubmitting(true)
    setError('')
    clearAuthNotice()

    try {
      await login(
        email.trim(),
        password,
      )

      navigate(
        '/cartography',
        {
          replace: true,
        },
      )
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Connexion impossible.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      className="login-screen"
      style={{
        '--login-background':
          `url(${loginFactoryBg})`,
      } as React.CSSProperties}
    >

      <section className="login-hero">
        <div className="login-hero__content">
          <div className="login-brand">
            <RadarMark />

            <div className="login-brand__name">
              <strong>SOMACA</strong>
              <span>RADAR</span>
            </div>
          </div>

          <div className="login-hero__copy">
            <p className="login-kicker">
              ATELIER MONTAGE
            </p>

            <h1>
              Pilotez l’atelier
              <br />
              en temps réel.
            </h1>

            <p className="login-hero__description">
              Suivez l’atelier, repérez les incidents
              et intervenez au bon moment.
            </p>
          </div>

          <RenaultGroupMark />
        </div>
      </section>

      <section className="login-access">
        <div className="login-card">
          <header className="login-card__header">
            <h2>Connexion</h2>
            {import.meta.env.VITE_DEMO_MODE === 'true' && <p>Accès de démonstration : identifiants préremplis, cliquez sur Se connecter.</p>}

            <p>
              Accédez à votre espace SOMACA RADAR.
            </p>
          </header>

          {authNotice && (
            <div
              className="login-notice"
              role="status"
            >
              {authNotice}
            </div>
          )}

          <form
            onSubmit={submit}
            className="login-form"
          >
            <label>
              <span>Adresse e-mail</span>

              <input
                type="email"
                autoComplete="email"
                value={email}
                required
                placeholder="prenom.nom@somaca.local"
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>Mot de passe</span>

              <div className="login-password">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="current-password"
                  value={password}
                  required
                  placeholder=""
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                />

                <button
                  type="button"
                  className="login-password__toggle"
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  title={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                >
                  <EyeIcon
                    hidden={showPassword}
                  />
                </button>
              </div>
            </label>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              <span>
                {submitting
                  ? 'Connexion en cours'
                  : 'Se connecter'}
              </span>

              {!submitting && (
                <span
                  className="login-submit__arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </button>
          </form>

          <p className="login-card__restricted">
            {import.meta.env.VITE_DEMO_MODE === 'true' ? 'Démonstration publique · données fictives' : 'Accès réservé au personnel autorisé.'}
          </p>
        </div>
      </section>
    </main>
  )
}
