import React from "react";
import { motion } from "framer-motion";
import { Droplets, Home, Sparkles } from "lucide-react";
import "./About.css";
import { useEcoTour } from "../context/EcoTourContext";

// Images
import homeImage from "../assets/home2.png";
import lightImage from "../assets/home1.png";
import springImage from "../assets/spring.png";
import cottageImage from "../assets/water.png";
import overviewImage from "../assets/overview.png";

export default function About() {
  const { theme } = useEcoTour();
  const isLight = theme === "light";
  const currentBg = theme === "light" ? lightImage : homeImage;

  return (
    <>
      {/* ABOUT SECTION */}
      <section id="about" className="about-section" style={{ background: 'var(--bg-1)', color: 'var(--text)' }}>
        <div className="section__bg" style={{ backgroundImage: `url(${currentBg})` }} aria-hidden="true" />

        <div className="about-container">
          <div className="about-grid">

            {/* LEFT CONTENT */}
            <motion.div
              className="about-content"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="about-header">
                <div className="about-eyebrow" style={{ color: 'var(--accent)' }}>ABOUT US</div>
                <h2 className="about-title" style={{ color: 'var(--text)' }}>
                  YOUR NATURE <br />
                  <span className="text-accent" style={{ color: 'var(--accent)' }}>GETAWAY</span>
                </h2>
              </div>

              <p className="about-description" style={{ color: 'var(--muted)' }}>
                Cold Spring Resort is your perfect getaway nestled in the heart of nature. Enjoy the cool spring water, lush greenery, and unforgettable moments with your loved ones.
              </p>

              {/* 3 FEATURE PILLS */}
              <div className="features-grid">
                <div className="feature-card" style={{ background: isLight ? 'var(--panel)' : 'rgba(255,255,255,0.04)', borderColor: 'var(--line)' }}>
                  <div className="feature-icon-box"><Droplets className="feature-icon" style={{ color: 'var(--accent)' }} /></div>
                  <div className="feature-title" style={{ color: 'var(--text)' }}>NATURAL SPRINGS</div>
                  <p className="feature-desc" style={{ color: 'var(--muted)' }}>Crystal clear and refreshing waters.</p>
                </div>

                <div className="feature-card" style={{ background: isLight ? 'var(--panel)' : 'rgba(255,255,255,0.04)', borderColor: 'var(--line)' }}>
                  <div className="feature-icon-box"><Home className="feature-icon" style={{ color: 'var(--accent)' }} /></div>
                  <div className="feature-title" style={{ color: 'var(--text)' }}>RELAXING SPACES</div>
                  <p className="feature-desc" style={{ color: 'var(--muted)' }}>Comfortable cottages and amenities.</p>
                </div>

                <div className="feature-card" style={{ background: isLight ? 'var(--panel)' : 'rgba(255,255,255,0.04)', borderColor: 'var(--line)' }}>
                  <div className="feature-icon-box"><Sparkles className="feature-icon" style={{ color: 'var(--accent)' }} /></div>
                  <div className="feature-title" style={{ color: 'var(--text)' }}>MEMORABLE EXPERIENCES</div>
                  <p className="feature-desc" style={{ color: 'var(--muted)' }}>Perfect for family, friends, and travelers.</p>
                </div>
              </div>

            </motion.div>

            {/* RIGHT CONTENT: Stacked Cards */}
            <motion.div
              className="about-visual"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="stacked-cards">
                <div className="stack-card card-1">
                  <img src={springImage} alt="Natural Cold Spring" loading="lazy" />
                  <div className="card-overlay" />
                </div>

                <div className="stack-card card-2">
                  <img src={cottageImage} alt="Bamboo Cottages" loading="lazy" />
                  <div className="card-overlay" />
                </div>

                <div className="stack-card card-3">
                  <img src={overviewImage} alt="Resort Overview" loading="lazy" />
                  <div className="card-overlay" />

                  <div className="card-tags">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
                      Peaceful Place
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      Family Friendly
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 22v-9" /><path d="M12 13a5 5 0 0 1 5-5c2 0 3 1 3 3 0 1.5-1 2.5-2 3.5" /><path d="M12 13a5 5 0 0 0-5-5c-2 0-3 1-3 3 0 1.5 1 2.5 2 3.5" /></svg>
                      Nature Escape
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
