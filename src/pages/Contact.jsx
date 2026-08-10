import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowRight, ExternalLink, Layers, Plus, Minus } from "lucide-react";
import "./Contact.css";
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import Manmade from "../assets/images/attractions/Manmade.png"; // Used for satellite preview
import { useEcoTour } from "../context/EcoTourContext";

const INFO = [
  { icon: Phone, label: "PHONE NUMBER", lines: ["+63 912 345 6789", "+63 917 890 1234"] },
  { icon: Mail, label: "EMAIL ADDRESS", lines: ["info@coldspringresort.com", "reservations@coldspringresort.com"] },
  { icon: MapPin, label: "ADDRESS", lines: ["Duangon, Zamora, Bilar", "Bohol, Philippines 6317"] },
  { icon: Clock, label: "BUSINESS HOURS", lines: ["Monday - Sunday", "7:00 AM - 8:00 PM"] },
];

export default function Contact() {
  const [mapType, setMapType] = useState('default');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePin, setActivePin] = useState(null);
  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;

  return (
    <section id="contact" className="contact-section">
      {/* Background Image Layer */}
      <div className="section__bg" style={{ backgroundImage: `url(${currentBg})` }} aria-hidden="true" />

      <div className="contact-container">
        {/* Left Column */}
        <motion.div
          className="contact-left"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >

          <p className="contact-eyebrow">Contact Us</p>
          <h2 className="contact-title">
            GET <span className="text-primary">IN TOUCH</span>
          </h2>
          <p className="contact-desc">
            Have questions or want to make a reservation?<br />We're here to help!
          </p>

          {/* Contact info cards */}
          <div className="contact-info-list">
            {INFO.map((item, i) => (
              <motion.div
                key={i}
                className="contact-info-card"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <div className="contact-info-icon">
                  <item.icon />
                </div>
                <div className="contact-info-content">
                  <p className="contact-info-label">{item.label}</p>
                  {item.lines.map((l, j) => (
                    <p key={j} className="contact-info-line">{l}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>


        </motion.div>

        {/* Right Column: Custom Interactive Map Container */}
        <motion.div
          className="custom-map-container"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Map Canvas Styling simulating Bohol topographic vector map */}
          <div
            className={`map-canvas ${mapType === 'satellite' ? 'satellite' : ''}`}
            style={{ transform: `scale(${1 + (zoomLevel - 1) * 0.15})` }}
          >
            {/* Map road lines / terrain SVG simulation matching Bohol map */}
            <svg className="map-svg" viewBox="0 0 800 600" preserveAspectRatio="none">
              <path d="M 100 450 Q 300 380, 450 420 T 700 200" stroke="#6bb5da" strokeWidth="24" fill="none" strokeLinecap="round" />
              <path d="M 50 100 Q 250 250, 480 320 T 750 500" stroke="#ffffff" strokeWidth="10" fill="none" />
              <path d="M 50 100 Q 250 250, 480 320 T 750 500" stroke="#C5A059" strokeWidth="6" fill="none" />
              <path d="M 480 320 L 600 150" stroke="#ffffff" strokeWidth="6" fill="none" />
              <path d="M 480 320 L 300 500" stroke="#ffffff" strokeWidth="6" fill="none" />
            </svg>

            {/* Map Pin 1: Cold Spring Resort (Main Gold Pin) */}
            <div onClick={() => setActivePin('resort')} className="map-pin map-pin-resort">
              <div className="pin-icon-wrapper">
                <div className="pin-icon-main">
                  <MapPin />
                </div>
                <span className="pin-label-main">Cold Spring Resort</span>
              </div>
            </div>

            {/* Nearby Destination Pins */}
            <div onClick={() => setActivePin('forest')} className="map-pin map-pin-dest-1">
              <div className="pin-label-dest">
                <span className="pin-dot" />
                <span>Man-Made Forest</span>
              </div>
            </div>

            <div onClick={() => setActivePin('chocolate')} className="map-pin map-pin-dest-2">
              <div className="pin-label-dest">
                <span className="pin-dot" />
                <span>Chocolate Hills</span>
              </div>
            </div>

            <div onClick={() => setActivePin('Tarsier')} className="map-pin map-pin-dest-3">
              <div className="pin-label-dest">
                <span className="pin-dot" />
                <span>Bohol Tarsier Conservation Area</span>
              </div>
            </div>
          </div>

          {/* Map Top-Left Overlay Box */}
          <div className="map-overlay-box">
            <div className="map-info-card">
              <h3>Bilar, Bohol</h3>
              <p>Bilar, Bohol, Philippines</p>
              <a href="https://maps.google.com/?q=Bilar+Bohol" target="_blank" rel="noreferrer" className="map-link">
                <span>View larger map</span>
                <ExternalLink />
              </a>
            </div>
          </div>

          {/* Active Pin Info Popover */}
          {activePin && (
            <div className="map-popover">
              <span className="popover-dot" />
              <span>
                {activePin === 'resort' && '📍 Cold Spring Resort: Duangon, Zamora, Bilar, Bohol'}
                {activePin === 'forest' && '🌲 Man-Made Forest: 22 km from Resort (25 mins)'}
                {activePin === 'chocolate' && '⛰️ Chocolate Hills Viewpoint: 18 km from Resort (22 mins)'}
                {activePin === 'loboc' && '🚤 Loboc River Cruise: 32 km from Resort (40 mins)'}
              </span>
            </div>
          )}

          {/* Map Bottom Controls */}
          <div className="map-controls">
            <button
              onClick={() => setMapType(mapType === 'default' ? 'satellite' : 'default')}
              className="map-type-btn"
              title="Toggle Satellite view"
            >
              <img src={Manmade} alt="Satellite Preview" referrerPolicy="no-referrer" />
              <div className="map-type-btn-overlay">
                <Layers />
              </div>
            </button>

            <div className="zoom-controls">
              <div className="zoom-label">Bohol Cartography</div>
              <button onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 3))} className="zoom-btn">
                <Plus />
              </button>
              <button onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 1))} className="zoom-btn">
                <Minus />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}