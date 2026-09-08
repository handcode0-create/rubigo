import type { SVGProps } from 'react'

// Illustration décorative pour le bandeau hero de l'accueil : une assiette
// de poulet braisé, riz et piment, dans un style plat et chaleureux.
// Purement visuelle (aria-hidden côté appelant), aucune donnée dynamique.
export function HeroDishIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="215" cy="250" rx="185" ry="145" fill="#FFFDF6" opacity="0.97" />
      <ellipse cx="215" cy="250" rx="185" ry="145" fill="none" stroke="#EADFC2" strokeWidth="3" />
      <ellipse cx="215" cy="250" rx="150" ry="112" fill="none" stroke="#EADFC2" strokeWidth="2" opacity="0.7" />

      {/* Riz */}
      <ellipse cx="185" cy="255" rx="118" ry="82" fill="#F5C84A" />
      <ellipse cx="185" cy="255" rx="118" ry="82" fill="#F0B93A" opacity="0.35" />
      {[
        [130, 220], [160, 245], [110, 260], [150, 285], [190, 300],
        [95, 230], [220, 250], [200, 220], [140, 210], [175, 270],
      ].map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r="4" fill="#FFFFFF" opacity="0.5" />
      ))}

      {/* Poulet braisé (deux pilons) */}
      <g>
        <path
          d="M255 165c28-14 58 2 63 32 5 27-14 45-33 55-9 5-20 5-28-2-12-11-16-30-9-48 6-16 3-30 7-37z"
          fill="#C97A3C"
        />
        <path
          d="M255 165c28-14 58 2 63 32 5 27-14 45-33 55-9 5-20 5-28-2-12-11-16-30-9-48 6-16 3-30 7-37z"
          stroke="#8A4B22"
          strokeWidth="3"
        />
        <path d="M270 190q18-6 30 6M266 210q18-6 32 4M264 230q16-6 28 6" stroke="#8A4B22" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      </g>

      <g>
        <path
          d="M150 190c-30-10-58 10-59 40-1 27 20 42 40 49 10 3 20 1 27-7 10-13 12-32 3-49-8-15-3-29-11-33z"
          fill="#B9682F"
        />
        <path
          d="M150 190c-30-10-58 10-59 40-1 27 20 42 40 49 10 3 20 1 27-7 10-13 12-32 3-49-8-15-3-29-11-33z"
          stroke="#7E421D"
          strokeWidth="3"
        />
        <path d="M120 210q-18-4-28 10M118 230q-18-4-30 8M122 250q-16-4-26 8" stroke="#7E421D" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* Plantain */}
      <ellipse cx="290" cy="300" rx="34" ry="14" fill="#F3B23C" transform="rotate(-18 290 300)" />
      <ellipse cx="325" cy="290" rx="34" ry="14" fill="#F3B23C" transform="rotate(-10 325 290)" />

      {/* Piment & herbes */}
      <circle cx="150" cy="205" r="5" fill="#E24B3C" />
      <circle cx="255" cy="305" r="4" fill="#E24B3C" />
      <circle cx="205" cy="180" r="4" fill="#E24B3C" />
      <circle cx="105" cy="255" r="4" fill="#E24B3C" />
      <path d="M175 165c4 10-2 18-10 20-4-10 2-18 10-20z" fill="#3F8F52" />
      <path d="M245 155c4 10-2 18-10 20-4-10 2-18 10-20z" fill="#3F8F52" />

      {/* Vapeur */}
      <path d="M175 95q14-18 0-36q-14-18 0-36" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.35" fill="none" />
      <path d="M225 85q14-18 0-36q-14-18 0-36" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.3" fill="none" />
    </svg>
  )
}
