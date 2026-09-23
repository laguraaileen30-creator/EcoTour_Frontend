import React, { useState, useEffect } from "react";
import { User, Calendar } from "lucide-react";
import EcoTourLogo from "../components/EcoTourLogo";
import ThemeToggle from "../components/ThemeToggle";
import { useEcoTour } from "../context/EcoTourContext";
import "./Navbar.css";

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = targetId;
    }
  };

  return (
    <header className={`nav ${isScrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        {/* Brand / Logo */}
        <a href="#home" onClick={(e) => handleNavClick(e, "#home")} className="nav__brand">
          <div className="nav__logo">
            <EcoTourLogo size={40} showGlow={false} />
          </div>
          <div className="nav__title">
            <span className="nav__name">ECOTOURVISTA</span>
            <small className="nav__sub">COLD SPRING RESORT</small>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="nav__links">
          <a href="#home" onClick={(e) => handleNavClick(e, "#home")} className="nav__link">Home</a>
          <a href="#about" onClick={(e) => handleNavClick(e, "#about")} className="nav__link">About Us</a>
          <a href="#packages" onClick={(e) => handleNavClick(e, "#packages")} className="nav__link font-bold text-emerald-400">Packages & Deals</a>
          <a href="#packages" onClick={(e) => handleNavClick(e, "#packages")} className="nav__link">Services</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")} className="nav__link">Contact</a>
          <a href="#nearby" onClick={(e) => handleNavClick(e, "#nearby")} className="nav__link">Nearby Destinations</a>

          {/* Pill Theme Toggle (Light/Dark Mode) */}
          <div className="flex items-center px-1">
            <ThemeToggle size="sm" />
          </div>

          {/* Book Reservation Button (only where booking is enabled) */}
          {onOpenBooking && (
          <button
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer border border-emerald-400"
          >
            <Calendar size={14} />
            <span>BOOK NOW</span>
          </button>
          )}

          {/* Single Right-Side Login Button */}
          <a href="/login" className="nav__link nav__link--login">
            <User size={15} />
            <span>Login</span>
          </a>
        </nav>
      </div>
    </header>
  );
}