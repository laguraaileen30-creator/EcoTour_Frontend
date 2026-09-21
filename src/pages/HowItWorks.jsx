import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  CalendarCheck,
  CreditCard,
  PartyPopper,
} from "lucide-react";
import "./HowItWorks.css";
import { useEcoTour } from "../context/EcoTourContext";
import sectionBg from "../assets/home2.png";
import sectionBgLight from "../assets/home1.png";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Browse Services",
    desc: "Explore our wide range of resort amenities — from cold spring pools and cozy cottages to water activities, karaoke, and buffet catering.",
    color: "#10b981",
    emoji: "🔍",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Choose Your Date",
    desc: "Pick your preferred visit date and select the services you'd like. Check real-time availability so you always know what's open.",
    color: "#3b82f6",
    emoji: "📅",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Confirm & Pay",
    desc: "Submit your reservation online. Receive an instant booking confirmation with your unique reference number for a smooth check-in.",
    color: "#f59e0b",
    emoji: "💳",
  },
  {
    step: "04",
    icon: PartyPopper,
    title: "Enjoy the Resort!",
    desc: "Arrive, flash your booking ref, and dive in! Immerse yourself in nature, cold springs, and unforgettable moments with family and friends.",
    color: "#ec4899",
    emoji: "🎉",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export default function HowItWorks() {
  const { theme } = useEcoTour();
  const isLight = theme === "light";
  const currentBg = isLight ? sectionBgLight : sectionBg;

  return (
    <section
      id="how-it-works"
      className="hiw-section"
      style={{
        background: "var(--bg-0)",
        color: "var(--text)",
      }}
    >
      {/* Background image layer */}
      <div
        className="hiw-bg"
        style={{ backgroundImage: `url(${currentBg})` }}
        aria-hidden="true"
      />

      {/* Decorative blobs */}
      <div className="hiw-blob hiw-blob--1" aria-hidden="true" />
      <div className="hiw-blob hiw-blob--2" aria-hidden="true" />

      <div className="hiw-container">
        {/* Header */}
        <motion.div
          className="hiw-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="hiw-eyebrow" style={{ color: "var(--accent, #10b981)" }}>
            SIMPLE PROCESS
          </span>
          <h2 className="hiw-title" style={{ color: "var(--text)" }}>
            HOW{" "}
            <span className="hiw-title-accent" style={{ color: "var(--accent, #10b981)" }}>
              ECOTOURVISTA
            </span>{" "}
            WORKS
          </h2>
          <p className="hiw-subtitle" style={{ color: "var(--muted)" }}>
            From browsing to booking — your dream resort day is just 4 easy steps away.
          </p>
        </motion.div>

        {/* Steps row */}
        <motion.div
          className="hiw-steps"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                className="hiw-card"
                variants={cardVariants}
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.82)"
                    : "rgba(7,25,15,0.78)",
                  borderColor: isLight
                    ? "rgba(16,185,129,0.18)"
                    : "rgba(255,255,255,0.07)",
                }}
              >
                {/* Step number badge */}
                <div
                  className="hiw-step-badge"
                  style={{ background: s.color + "22", color: s.color, border: `1.5px solid ${s.color}55` }}
                >
                  {s.step}
                </div>

                {/* Icon circle */}
                <div className="hiw-icon-wrap" style={{ background: s.color + "18" }}>
                  <Icon size={28} style={{ color: s.color }} strokeWidth={2} />
                </div>

                {/* Text */}
                <h3 className="hiw-card-title" style={{ color: "var(--text)" }}>
                  {s.title}
                </h3>
                <p className="hiw-card-desc" style={{ color: "var(--muted)" }}>
                  {s.desc}
                </p>

                {/* Bottom emoji tag */}
                <div
                  className="hiw-emoji-tag"
                  style={{
                    background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                    borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <span>{s.emoji}</span>
                  <span style={{ color: "var(--muted)", fontSize: "11px" }}>Step {i + 1} of 4</span>
                </div>

                {/* Arrow connector (not for last card) */}
                {i < STEPS.length - 1 && (
                  <div className="hiw-connector" aria-hidden="true">
                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                      <path
                        d="M0 8 H32 M28 2 L38 8 L28 14"
                        stroke={s.color}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA strip */}
        <motion.div
          className="hiw-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div
            className="hiw-cta-inner"
            style={{
              background: isLight
                ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                : "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)",
              borderColor: "rgba(16,185,129,0.3)",
            }}
          >
            <span className="hiw-cta-text" style={{ color: isLight ? "#064e3b" : "#6ee7b7" }}>
              🌿 Ready to experience Cold Spring Resort?
            </span>
            <a
              href="#about"
              className="hiw-cta-btn"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ background: "var(--accent, #10b981)", color: isLight ? "#fff" : "#04170e" }}
            >

            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
