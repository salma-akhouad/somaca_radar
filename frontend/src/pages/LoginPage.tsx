import {
  useState,
} from 'react'

import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../auth/AuthContext'


function EyeIcon({
  hidden,
}: {
  hidden: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
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

          <circle
            cx="12"
            cy="12"
            r="2.3"
          />
        </>
      )}
    </svg>
  )
}


export function LoginPage() {
  const {
    user,
    login,
  } =
    useAuth()

  const navigate =
    useNavigate()


  const [
    email,
    setEmail,
  ] =
    useState('')


  const [
    password,
    setPassword,
  ] =
    useState('')


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false)


  const [
    error,
    setError,
  ] =
    useState('')


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false)


  if (user) {
    return (
      <Navigate
        to="/cartography"
        replace
      />
    )
  }


  async function submit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setSubmitting(true)
    setError('')


    try {
      await login(
        email,
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
          : 'Connexion impossible',
      )
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <main className="login-screen">
      <section className="login-brand">
        <div className="login-brand__radar">
          <span />
          <i />
        </div>

        <div className="login-brand__name">
          <strong>
            SOMACA
          </strong>

          <span>
            RADAR
          </span>
        </div>

        <p>
          Supervision opérationnelle du montage
        </p>
      </section>


      <section className="login-panel">
        <div className="login-panel__eyebrow">
          ACCÈS SÉCURISÉ
        </div>

        <h1>
          Connexion
        </h1>

        <p>
          Utilisez votre compte SOMACA RADAR.
        </p>


        <form
          onSubmit={submit}
          className="login-form"
        >
          <label>
            Adresse e-mail

            <input
              type="email"
              autoComplete="email"
              value={email}
              required
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target.value,
                )
              }
            />
          </label>


          <label>
            Mot de passe

            <div className="password-field">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                value={password}
                required
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target.value,
                  )
                }
              />

              <button
                type="button"
                className="password-field__toggle"
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
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
              >
                <EyeIcon
                  hidden={
                    showPassword
                  }
                />
              </button>
            </div>
          </label>


          {error && (
            <div className="form-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="primary-button"
            disabled={
              submitting
            }
          >
            {submitting
              ? 'CONNEXION…'
              : 'SE CONNECTER'}
          </button>
        </form>


        <small className="login-panel__security">
          Les droits sont appliqués par le backend selon votre rôle.
        </small>
      </section>
    </main>
  )
}