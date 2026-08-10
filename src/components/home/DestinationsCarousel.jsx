import React from 'react'

export default function DestinationsCarousel({ dests, carouselIndex, prev, next }) {
  const cardWidth = 278
  const trackTranslate = Math.min(0, -carouselIndex * cardWidth)

  return (
    <div style={{ textAlign: 'center', marginTop: 56 }}>
      <div style={{ color: 'var(--muted)', fontWeight: 700 }}>EXPLORE NEARBY</div>
      <h2 style={{ marginTop: 8 }}>
        NEARBY <span style={{ color: 'var(--accent)' }}>DESTINATIONS</span>
      </h2>

      <div className="carousel-wrap">
        <div style={{ position: 'relative', maxWidth: 980, margin: '22px auto' }}>
          <div className="carousel-controls">
            <button className="car-btn" onClick={prev} aria-label="previous destination">
              ‹
            </button>
            <button className="car-btn" onClick={next} aria-label="next destination">
              ›
            </button>
          </div>

          <div className="carousel" role="list" aria-label="Nearby destinations">
            <div className="carousel-track" style={{ transform: `translateX(${trackTranslate}px)` }}>
              {dests.map((destination, idx) => (
                <article className="dest-card" key={idx}>
                  <div className="thumb" style={{ backgroundImage: `url(${destination.img})` }} />
                  <div className="info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800 }}>{destination.title}</div>
                      <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{destination.dist}</div>
                    </div>
                    <div style={{ color: 'var(--muted)', marginTop: 8, fontSize: 13 }}>{destination.tag}</div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: 10, fontSize: 12 }}>
                        Panoramic Deck
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: 10, fontSize: 12 }}>
                        Photo Spot
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
