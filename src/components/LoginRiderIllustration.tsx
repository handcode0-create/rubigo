import type { SVGProps } from 'react'

// Illustration décorative pour le panneau gauche du login desktop : un
// livreur à scooter, style pictogramme plat (formes pleines, pas de
// silhouette anatomique détaillée), avec des lignes de vitesse.
export function LoginRiderIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 640 340" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Route */}
      <line x1="0" y1="278" x2="640" y2="278" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <line x1="30" y1="278" x2="100" y2="278" stroke="#D6E86A" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <line x1="140" y1="278" x2="190" y2="278" stroke="#D6E86A" strokeWidth="4" strokeLinecap="round" opacity="0.4" />

      {/* Lignes de vitesse */}
      <line x1="0" y1="150" x2="140" y2="150" stroke="#D6E86A" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      <line x1="0" y1="178" x2="190" y2="178" stroke="#D6E86A" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="206" x2="160" y2="206" stroke="#D6E86A" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
      <line x1="50" y1="124" x2="140" y2="124" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

      {/* Ombre au sol */}
      <ellipse cx="430" cy="284" rx="150" ry="11" fill="rgba(0,0,0,0.16)" />

      {/* Roues */}
      <circle cx="352" cy="268" r="32" fill="#0f5132" stroke="#D6E86A" strokeWidth="6" />
      <circle cx="500" cy="268" r="32" fill="#0f5132" stroke="#D6E86A" strokeWidth="6" />
      <circle cx="352" cy="268" r="7" fill="#D6E86A" />
      <circle cx="500" cy="268" r="7" fill="#D6E86A" />

      {/* Châssis (plein, capsules) */}
      <rect x="352" y="260" width="148" height="14" rx="7" fill="#ffffff" />
      <rect x="392" y="205" width="14" height="70" rx="7" fill="#ffffff" transform="rotate(-18 399 240)" />
      <rect x="470" y="255" width="14" height="60" rx="7" fill="#ffffff" transform="rotate(14 477 285)" />
      {/* Selle */}
      <rect x="410" y="228" width="46" height="16" rx="8" fill="#ffffff" />
      {/* Guidon */}
      <rect x="368" y="176" width="14" height="46" rx="7" fill="#ffffff" transform="rotate(-16 375 199)" />
      <rect x="352" y="170" width="46" height="12" rx="6" fill="#ffffff" />

      {/* Boîte de livraison */}
      <rect x="466" y="150" width="58" height="56" rx="10" fill="#FF7354" />
      <rect x="483" y="166" width="24" height="8" rx="4" fill="rgba(255,255,255,0.75)" />

      {/* Corps du livreur : masse pleine (ellipse) + membres en lignes
          épaisses ancrées à l'intérieur de la masse, pour un rendu plein et
          sans discontinuité visuelle */}
      <ellipse cx="418" cy="158" rx="24" ry="46" fill="#ffffff" transform="rotate(-24 418 158)" />
      {/* Bras vers le guidon */}
      <line x1="408" y1="150" x2="380" y2="184" stroke="#ffffff" strokeWidth="17" strokeLinecap="round" />
      {/* Jambe vers le repose-pied */}
      <line x1="432" y1="198" x2="412" y2="254" stroke="#ffffff" strokeWidth="17" strokeLinecap="round" />

      {/* Sac à dos de livraison */}
      <rect x="378" y="150" width="30" height="42" rx="9" fill="#16A34A" transform="rotate(-22 393 171)" />

      {/* Casque */}
      <circle cx="400" cy="106" r="27" fill="#D6E86A" />
      <rect x="386" y="100" width="28" height="13" rx="6.5" fill="#0f5132" opacity="0.32" />
    </svg>
  )
}
