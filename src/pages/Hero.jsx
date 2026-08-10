import React from "react";
import "./Hero.css";
import bgImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import gifImage from "../assets/gif.gif";
import { useEcoTour } from "../context/EcoTourContext";

export default function Hero({ onOpenBooking }) {
  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : bgImage;

  const handleScrollClick = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="hero">
      {/* Background Image: light.png in light mode, home.png in dark mode */}
      <div
        className="hero__bg"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat"
        }}
        aria-hidden
      />

      {/* Dark overlay for text contrast */}
      <div className="hero__overlay" aria-hidden />

      {/* Light Mode Skin-tone Multiple Blurred Blobs */}
      {theme === "light" && (
        <>
          <div className="background-blur blur-1" aria-hidden />
          <div className="background-blur blur-2" aria-hidden />
          <div className="background-blur blur-3" aria-hidden />
        </>
      )}

      <div className="hero__container">
        {/* Left Content Column */}
        <div className="hero__left">
          <h1 className="hero__title">
            <span className="title-white">ESCAPE.</span>
            <span className="title-white">RELAX.</span>
            <span className="title-green">REFRESH.</span>
          </h1>

          <p className="hero__subtitle">
            Experience the natural beauty and cool serenity of Cold Spring Resort.
          </p>

          <div className="hero__actions">
            <button className="btn btn--explore" onClick={onOpenBooking || handleScrollClick}>
              <span>BOOK RESERVATION</span>
              <span className="btn__arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>

          <div className="hero__location-card">
            <div className="location__pin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="location__text">
              <strong className="location__city">
                DUANGON,
                <br />
                ZAMORA, BOHOL
              </strong>
              <div className="location__tagline">
                NATURAL, REFRESHING,
                <br />
                UNFORGETTABLE.
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="hero__scroll" onClick={handleScrollClick}>
            <div className="scroll-mouse">
              <div className="scroll-wheel"></div>
            </div>
            <span className="scroll-text">SCROLL DOWN</span>
          </div>
        </div>

        {/* Right Side: gif.gif Image with Drop Shadow */}
        <div className="hero__right">
          <div className="hero__gif-shadow-container">
            <div className="hero__gif-wrapper">
              <img src={gifImage} alt="Cold Spring Waterfall GIF" className="hero__gif-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}