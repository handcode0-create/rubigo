import './SplashScreen.css'

export function SplashScreen() {
  return (
    <main className="splash-screen" aria-label="RUBIGO">
      <div className="splash-content">
        <img
          src="/logo.png"
          alt="RUBIGO"
          className="splash-logo"
        />

        <div className="splash-tagline">
          <span>Commandez.</span>
          <span>On vous livre.</span>
        </div>
      </div>

      <div className="splash-footer">
        <span>RUBIGO</span>
        <span>ADZOPÉ · CÔTE D’IVOIRE</span>
      </div>

      <div className="splash-loader" aria-hidden="true">
        <span />
      </div>
    </main>
  )
}