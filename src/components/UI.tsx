import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { StarIcon } from './Icons'
import './UI.css'

/* ==========================================================================
   BUTTON COMPONENT
   ========================================================================== */

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'rubigo-btn',
    `rubigo-btn-${variant}`,
    `rubigo-btn-${size}`,
    fullWidth ? 'rubigo-btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled} {...props}>
      {icon && <span className="rubigo-btn-icon">{icon}</span>}
      <span className="rubigo-btn-label">{children}</span>
      {iconRight && <span className="rubigo-btn-icon-right">{iconRight}</span>}
    </button>
  )
}

/* ==========================================================================
   BADGE COMPONENT
   ========================================================================== */

export type BadgeVariant = 'open' | 'closed' | 'promo' | 'new' | 'neutral' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
  icon?: ReactNode
}

export function Badge({
  variant = 'neutral',
  children,
  icon,
  className = '',
  ...props
}: BadgeProps) {
  const classes = ['rubigo-badge', `rubigo-badge-${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...props}>
      {icon && <span className="rubigo-badge-icon">{icon}</span>}
      {children}
    </span>
  )
}

/* ==========================================================================
   RATING BADGE
   ========================================================================== */

export function RatingBadge({
  rating,
  reviewCount,
}: {
  rating: number
  reviewCount?: number
}) {
  return (
    <span className="rubigo-rating-badge">
      <StarIcon size={14} />
      <strong>{rating.toFixed(1)}</strong>
      {reviewCount !== undefined && <small>({reviewCount})</small>}
    </span>
  )
}

/* ==========================================================================
   CARD CONTAINER
   ========================================================================== */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  children: ReactNode
}

export function Card({
  interactive = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    'rubigo-card',
    interactive ? 'rubigo-card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
