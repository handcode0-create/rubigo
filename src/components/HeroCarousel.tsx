import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon, StarIcon } from './Icons'

export type HeroSlide = {
  id: string
  badge: string
  title: string
  subtitle: string
  image: string
  ctaLabel: string
  meta?: string
  onSelect: () => void
}

const AUTOPLAY_MS = 4800
const SWIPE_THRESHOLD = 40

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const count = slides.length

  const goTo = (index: number) => {
    setActiveIndex(((index % count) + count) % count)
  }

  const pauseThenResume = () => {
    setIsPaused(true)
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current)
    resumeTimeout.current = setTimeout(() => setIsPaused(false), 6000)
  }

  useEffect(() => {
    if (isPaused || count <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % count)
    }, AUTOPLAY_MS)
    return () => clearInterval(interval)
  }, [isPaused, count])

  useEffect(() => () => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current)
  }, [])

  if (count === 0) return null

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
    pauseThenResume()
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    if (delta > SWIPE_THRESHOLD) goTo(activeIndex - 1)
    else if (delta < -SWIPE_THRESHOLD) goTo(activeIndex + 1)
    touchStartX.current = null
  }

  return (
    <section
      className="hero-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Sélections RUBIGO du moment"
    >
      <div
        className="hero-carousel-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article
            className="hero-slide"
            key={slide.id}
            aria-hidden={index !== activeIndex}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-slide-image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="hero-slide-scrim" />

            {slide.meta && (
              <div className="hero-slide-chip">
                <StarIcon size={13} />
                <span>{slide.meta}</span>
              </div>
            )}

            <div className="hero-slide-copy">
              <span className="hero-slide-badge">{slide.badge}</span>
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              <button
                type="button"
                className="hero-slide-cta"
                onClick={slide.onSelect}
              >
                <span>{slide.ctaLabel}</span>
                <ArrowRightIcon size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {count > 1 && (
        <div className="hero-carousel-dots" role="tablist">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Aller au slide ${index + 1}`}
              className={`hero-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                goTo(index)
                pauseThenResume()
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
