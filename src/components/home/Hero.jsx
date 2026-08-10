import React, { useEffect, useState } from 'react'

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 5l6 7-6 7" stroke="#04210e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLocation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 10.6C20.5 16.6 12 22 12 22s-8.5-5.4-8.5-11.4A8.5 8.5 0 0 1 12 2a8.5 8.5 0 0 1 8.5 8.6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Hero({ galleryCards }) {
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setGalleryIndex((index) => (index + 1) % Math.max(1, galleryCards.length))
    }, 4200)

    return () => clearInterval(interval)
  }, [galleryCards.length])

  return (
    <header className="hero" role="banner" id="home">
      <nav className="nav" aria-label="Main navigation">
        <div className="left">
          <div className="logo" aria-hidden>
            <div className="icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M2 20h20L13 6 8 14 2 20z" opacity="0.95" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14 }}>Cold Spring</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>RESORT</div>
            </div>
          </div>

          <a href="#home" className="active" style={{ marginLeft: 28 }}>
            Home
          </a>
          <a href="#about">About Us</a>
        </div>

        <div className="right">
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <button
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            aria-label="menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="hero-content" style={{ position: 'relative' }}>
        <div className="hero-left">
          <h1>
            ESCAPE.
            <br />
            RELAX.
            <br />
            <span className="accent">REFRESH.</span>
          </h1>
          <p className="lead">Experience the natural beauty and cool serenity of Cold Spring Resort.</p>

          <div className="actions">


            <button className="btn secondary" title="Book now">
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View Services
            </button>
          </div>

          <div className="location-badge">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconLocation />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Duangon, Zamora, Bohol</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                  Natural. Refreshing. Unforgettable.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="book-now" aria-hidden>
            <div style={{ fontSize: 13, opacity: 0.95 }}>BOOK NOW</div>
            <div className="dot">+</div>
          </div>

          <div className="scroll-down" aria-hidden>
            <div style={{ fontSize: 12 }}>SCROLL DOWN</div>
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="gallery-wrap" aria-hidden>
        <div className="gallery" role="list">
          {galleryCards.slice(0, 3).map((src, i) => {
            let cls = 'card'
            if (i === galleryIndex % 3) cls += ' front'
            if (i === (galleryIndex + 2) % 3) cls += ' mid'
            if (i === (galleryIndex + 1) % 3) cls += ' badge'

            return (
              <div key={i} className={cls} style={{ zIndex: 10 + i }}>
                <img src={src} alt={`gallery-${i}`} />
                <div className="meta">
                  <div>
                    <div style={{ fontWeight: 800 }}>Peaceful Place</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>Family Friendly • Nature Escape</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ⤴
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </header>
  )
}
