import React from 'react'

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-card">
        <h3>CONTACT US</h3>
        <h2 id="contact-title">
          GET <span style={{ color: 'var(--accent)' }}>IN TOUCH</span>
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Have questions or want to make a reservation? We're here to help!
        </p>

        <div className="info-row">
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path d="M3 6v12a2 2 0 0 0 2 2h14" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div style={{ fontWeight: 800 }}>Phone Number</div>
            <div style={{ color: 'var(--muted)' }}>+63 912 345 6789 • +63 917 890 1234</div>
          </div>
        </div>

        <div className="info-row">
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path d="M3 5h18M3 12h18M3 19h18" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div style={{ fontWeight: 800 }}>Email Address</div>
            <div style={{ color: 'var(--muted)' }}>info@coldspringresort.com</div>
          </div>
        </div>

        <div className="info-row">
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path
              d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z"
              stroke="var(--accent)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(0,0,0,0.12)"
            />
          </svg>
          <div>
            <div style={{ fontWeight: 800 }}>Address</div>
            <div style={{ color: 'var(--muted)' }}>Duangon, Zamora, Bilar, Bohol, Philippines 6317</div>
          </div>
        </div>

        <button className="book-big">
          BOOK NOW <span style={{ marginLeft: 8 }}>→</span>
        </button>
      </div>

      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'var(--shadow)' }}>
        <iframe
          title="Bilar Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.508974037091!2d124.00893421532295!3d9.689019691958618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32522b5fb1a6e85b%3A0x3f8eadb1a2a2cec2!2sBilar%2C%20Bohol%2C%20Philippines!5e0!3m2!1sen!2sus!4v1690999999999"
          width="100%"
          height="420"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}
