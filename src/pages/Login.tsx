import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import type { Role } from '../types'
import './Login.css'

const demoAccounts: {
  role: Role
  label: string
  email: string
  password: string
  initials: string
}[] = [
  {
    role: 'customer',
    label: 'Client',
    email: 'client@rubigo.ci',
    password: 'Rubigo2026!',
    initials: 'AK',
  },
  {
    role: 'merchant',
    label: 'Commerçant',
    email: 'merchant@rubigo.ci',
    password: 'Rubigo2026!',
    initials: 'PA',
  },
  {
    role: 'driver',
    label: 'Livreur',
    email: 'driver@rubigo.ci',
    password: 'Rubigo2026!',
    initials: 'KY',
  },
  {
    role: 'admin',
    label: 'Administrateur',
    email: 'admin@rubigo.ci',
    password: 'Rubigo2026!',
    initials: 'AD',
  },
]

export function Login() {
  const { login } = useApp()

  const [email, setEmail] = useState('client@rubigo.ci')
  const [password, setPassword] = useState('Rubigo2026!')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const success = login(email, password)

    if (success) {
      setError('')
    } else {
      setError('Email ou mot de passe incorrect.')
    }
  }

  const fill = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand">
          <span className="brand-dot" />
          RUBIGO
        </div>

        <div className="login-art-copy">
          <p className="eyebrow light">
            PLATEFORME LOCALE · ADZOPÉ
          </p>

          <h1>
            La ville
            <br />
            <em>à votre porte.</em>
          </h1>

          <p>
            Commandez auprès de vos commerces préférés.
            RUBIGO s’occupe du reste.
          </p>
        </div>

        <span className="login-art-stamp">
          RUBIGO
          <br />
          <b>LOCAL DELIVERY</b>
        </span>
      </section>

      <section className="login-form-wrap">
        <div className="login-form-card">
          <p className="eyebrow">
            BIENVENUE CHEZ RUBIGO
          </p>

          <h2>Connectez-vous</h2>

          <p className="login-intro">
            Utilisez un compte de démonstration pour explorer
            chaque espace.
          </p>

          <form onSubmit={submit}>
            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Mot de passe

              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                >
                  {showPassword ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </label>

            {error && (
              <p
                className="login-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
            >
              Se connecter
              <span>→</span>
            </button>
          </form>

          <div className="demo-access">
            <p className="eyebrow">
              ACCÈS RAPIDE
            </p>

            <div>
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  className="demo-account"
                  onClick={() => fill(account)}
                >
                  <span>{account.initials}</span>

                  <strong>{account.label}</strong>

                  <small>{account.email}</small>
                </button>
              ))}
            </div>
          </div>

          <p className="mock-notice">
            Authentification de démonstration uniquement.
            Aucune donnée sensible n’est stockée.
          </p>
        </div>
      </section>
    </main>
  )
}