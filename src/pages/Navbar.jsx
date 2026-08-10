import React, { useState, useEffect } from "react";
import { User, Calendar, Sun, Moon } from "lucide-react";
import EcoTourLogo from "../components/EcoTourLogo";
import { useEcoTour } from "../context/EcoTourContext";
import "./Navbar.css";

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useEcoTour();

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
            <EcoTourLogo width={42} height={26} />
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
          <a href="#services" onClick={(e) => handleNavClick(e, "#services")} className="nav__link">Services</a>
          <a href="#nearby" onClick={(e) => handleNavClick(e, "#nearby")} className="nav__link">Nearby Destinations</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")} className="nav__link">Contact</a>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-emerald-500/20 border border-white/20 text-emerald-400 transition-all flex items-center justify-center cursor-pointer shadow-md"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme Mode"
          >
            {theme === "light" ? <Moon size={16} className="text-emerald-700" /> : <Sun size={16} className="text-amber-300" />}
          </button>

          {/* Book Reservation Button */}
          <button
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer border border-emerald-400"
          >
            <Calendar size={14} />
            <span>BOOK NOW</span>
          </button>

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