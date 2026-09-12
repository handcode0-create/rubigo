import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { LoginRiderIllustration } from '../components/LoginRiderIllustration'
import './Login.css'

type Mode = 'login' | 'register'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Login() {
  const { login, register } = useApp()

  const [mode, setMode] = useState<Mode>('login')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const resetMessages = () => {
    setError('')
    setInfo('')
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    resetMessages()
    setPassword('')
    setConfirmPassword('')
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    if (!email.trim() || !password) {
      setError('Merci de renseigner votre e-mail et votre mot de passe.')
      return
    }

    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message ?? 'Adresse e-mail ou mot de passe incorrect.')
    }
  }

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    if (!fullName.trim()) {
      setError('Merci de renseigner votre nom complet.')
      return
    }
    if (!phone.trim()) {
      setError('Merci de renseigner votre numéro de téléphone.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Merci de renseigner une adresse e-mail valide.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    const result = await register(fullName.trim(), phone.trim(), email.trim(), password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message ?? 'Impossible de créer votre compte pour le moment.')
      return
    }

    if (result.needsEmailConfirmation) {
      setInfo('Compte créé. Vérifiez votre boîte e-mail pour confirmer votre adresse avant de vous connecter.')
      setMode('login')
      setPassword('')
      setConfirmPassword('')
      return
    }

    // Si la confirmation e-mail est désactivée sur le projet Supabase, la session
    // est immédiatement active : onAuthStateChange (AppContext) prend le relais.
  }

  const isLogin = mode === 'login'

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand">
          <span className="brand-dot" />
          RUBIGO
        </div>

        <div className="login-art-copy">
          <p className="eyebrow light">PLATEFORME LOCALE · ADZOPÉ</p>

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

        <LoginRiderIllustration className="login-art-illustration" aria-hidden="true" />
      </section>

      <section className="login-form-wrap">
        <div className="login-form-card">
          <p className="eyebrow">BIENVENUE CHEZ RUBIGO</p>

          <h2>{isLogin ? 'Connectez-vous' : 'Créer un compte'}</h2>

          <p className="login-intro">
            {isLogin
              ? 'Entrez vos identifiants pour accéder à votre compte.'
              : 'Renseignez vos informations pour commencer à commander.'}
          </p>

          {isLogin ? (
            <form onSubmit={submitLogin}>
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
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? 'Masquer' : 'Voir'}
                  </button>
                </div>
              </label>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}
              {info && <p className="login-info">{info}</p>}

              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? 'Connexion…' : 'Se connecter'}
                {!submitting && <span>→</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister}>
              <label>
                Nom complet
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Téléphone
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  placeholder="+225 07 08 09 10 11"
                  required
                />
              </label>

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
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? 'Masquer' : 'Voir'}
                  </button>
                </div>
              </label>

              <label>
                Confirmer le mot de passe
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}
              {info && <p className="login-info">{info}</p>}

              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? 'Création du compte…' : 'Créer mon compte'}
                {!submitting && <span>→</span>}
              </button>
            </form>
          )}

          <button
            type="button"
            className="auth-switch"
            onClick={() => switchMode(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </section>
    </main>
  )
}
