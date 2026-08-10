import React from 'react'

export default function AboutSection() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="about-grid">
        <div className="about-left">
          <h3>ABOUT US</h3>
          <h2 id="about-title">
            YOUR NATURE <span style={{ color: 'var(--accent)' }}>GETAWAY</span>
          </h2>
          <p>
            Cold Spring Resort is your perfect getaway nestled in the heart of nature. Enjoy the cool
            spring water, lush greenery, and unforgettable moments with your loved ones.
          </p>

          <div style={{ display: 'flex', gap: 18, marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M12 2v20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <div style={{ fontWeight: 700 }}>Natural Springs</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Crystal clear and refreshing waters.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M3 21h18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <div style={{ fontWeight: 700 }}>Relaxing Spaces</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Comfortable cottages and amenities.</div>
              </div>
            </div>
          </div>

          <button className="btn" style={{ marginTop: 18 }}>
            Learn More <span style={{ marginLeft: 10 }}>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
