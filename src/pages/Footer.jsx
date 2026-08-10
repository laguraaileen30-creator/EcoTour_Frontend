import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Facebook, Instagram, Twitter, MapPin, Phone, Mail, 
  ArrowUpRight, Send, Heart, TreePalm, X, FileText, CheckCircle2,
  ShieldCheck, Cookie, Map
} from "lucide-react";
import EcoTourLogo from "../components/EcoTourLogo";
import "./Footer.css";
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import { useEcoTour } from "../context/EcoTourContext";

const FOOTER_LINKS = {
  explore: [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Our Services", href: "#about" },
    { name: "Nearby Destinations", href: "#nearby" },
    { name: "Contact Us", href: "#contact" },
  ],
  experiences: [
    { name: "Man-Made Forest", href: "#nearby" },
    { name: "Tarsier Sanctuary", href: "#nearby" },
    { name: "Chocolate Hills", href: "#nearby" },
    { name: "Loboc River Cruise", href: "#nearby" },
    { name: "Bohol Biodiversity", href: "#nearby" },
  ],
  legal: [
    { name: "Privacy Policy", key: "privacy" },
    { name: "Terms of Service", key: "terms" },
    { name: "Cookie Policy", key: "cookies" },
    { name: "Sitemap", key: "sitemap" },
  ],
};

const SOCIALS = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

const LEGAL_DOCS = {
  privacy: {
    title: "Privacy Policy",
    icon: ShieldCheck,
    content: (
      <div className="legal-doc-content">
        <p>At <strong>Cold Spring Resort</strong>, we are committed to protecting your privacy and ensuring your personal information is handled with care and security.</p>
        <h4>Information Collection</h4>
        <p>We collect details such as your name, email address, phone number, and reservation preferences strictly for booking fulfillment and customer service.</p>
        <h4>Data Usage & Protection</h4>
        <p>Your data is used solely for processing accommodations and providing personalized resort services. We do not sell or rent guest information to third parties.</p>
        <h4>Contact Us</h4>
        <p>If you have questions regarding your data privacy, please reach out to info@coldspringresort.com.</p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    content: (
      <div className="legal-doc-content">
        <p>Welcome to <strong>Cold Spring Resort</strong>. By reserving or using our facilities, you agree to comply with the following terms:</p>
        <h4>Check-in & Check-out</h4>
        <p>Standard check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in or late check-out is subject to availability.</p>
        <h4>Resort Guidelines</h4>
        <p>Guests are expected to respect nature and maintain tranquility. Cleanliness and preservation of the natural spring waters must be observed at all times.</p>
        <h4>Cancellations</h4>
        <p>Cancellations made 48 hours prior to arrival are eligible for full refunds according to our reservation terms.</p>
      </div>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    icon: Cookie,
    content: (
      <div className="legal-doc-content">
        <p><strong>Cold Spring Resort</strong> uses minimal cookies to enhance your browsing and booking experience.</p>
        <h4>Essential Cookies</h4>
        <p>These cookies are required for basic navigation, booking session management, and site security.</p>
        <h4>Performance & Analytics</h4>
        <p>We use anonymous analytics cookies to analyze site traffic and improve page loading performance for all guests.</p>
      </div>
    ),
  },
  sitemap: {
    title: "Resort Sitemap",
    icon: Map,
    content: (
      <div className="legal-doc-content">
        <p>Quick navigation tree for Cold Spring Resort website:</p>
        <ul className="sitemap-list">
          <li><a href="#home">Home (Hero Section)</a></li>
          <li><a href="#about">About Us & Resort Facilities</a></li>
          <li><a href="#nearby">Nearby Destinations in Bohol</a></li>
          <li><a href="#contact">Contact & Map Location</a></li>
          <li><a href="/login">Guest & Staff Login Portal</a></li>
        </ul>
      </div>
    ),
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeLegalKey, setActiveLegalKey] = useState(null);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (href && href.startsWith("#")) {
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;

  return (
    <footer className="site-footer">
      {/* Background Image Layer */}
      <div className="section__bg" style={{ backgroundImage: `url(${currentBg})` }} aria-hidden="true" />
      
      <div className="footer-container">
        {/* Top Section: Brand & Newsletter */}
        <motion.div 
          className="footer-top"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="footer-brand">
            <a href="#home" onClick={(e) => handleNavClick(e, "#home")} className="brand-logo">
              <EcoTourLogo width={42} height={26} />
              <span>EcoTour<span className="text-accent">Vista</span></span>
            </a>
            <p className="brand-desc">
              Experience the serene beauty of Bilar, Bohol. A hidden paradise where nature's 
              tranquility meets modern comfort.
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input 
                type="email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email for exclusive offers" 
                required
              />
              <button type="submit" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
            {isSubscribed && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="newsletter-success"
              >
                <CheckCircle2 size={14} />
                <span>Thank you for subscribing!</span>
              </motion.div>
            )}
          </div>

          <div className="footer-links-grid">
            {/* Explore Column */}
            <div className="footer-col">
              <h4>Explore</h4>
              <ul>
                {FOOTER_LINKS.explore.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                      {link.name} <ArrowUpRight size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Experiences Column */}
            <div className="footer-col">
              <h4>Experiences</h4>
              <ul>
                {FOOTER_LINKS.experiences.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                      {link.name} <ArrowUpRight size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="footer-col contact-col">
              <h4>Get in Touch</h4>
              <ul className="contact-list">
                <li>
                  <MapPin size={14} />
                  <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
                    Duangon, Zamora, Bilar,<br />Bohol, Philippines 6317
                  </a>
                </li>
                <li>
                  <Phone size={14} />
                  <a href="tel:+639123456789">+63 912 345 6789</a>
                </li>
                <li>
                  <Mail size={14} />
                  <a href="mailto:info@coldspringresort.com">info@coldspringresort.com</a>
                </li>
              </ul>
              
              {/* Socials */}
              <div className="social-links">
                {SOCIALS.map((social) => (
                  <a 
                    key={social.label} 
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon" 
                    aria-label={social.label}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Cold Spring Resort. All rights reserved. Made with <Heart size={12} className="heart-icon" /> in Bohol.
          </p>
          <ul className="legal-links">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.name}>
                <button 
                  type="button"
                  className="legal-link-btn"
                  onClick={() => setActiveLegalKey(link.key)}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legal Information Modal */}
      <AnimatePresence>
        {activeLegalKey && LEGAL_DOCS[activeLegalKey] && (
          <div className="legal-modal-backdrop" onClick={() => setActiveLegalKey(null)}>
            <motion.div 
              className="legal-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="legal-modal-header">
                <div className="legal-modal-title">
                  {React.createElement(LEGAL_DOCS[activeLegalKey].icon, { size: 20, className: "legal-icon" })}
                  <h3>{LEGAL_DOCS[activeLegalKey].title}</h3>
                </div>
                <button 
                  className="legal-modal-close" 
                  onClick={() => setActiveLegalKey(null)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="legal-modal-body">
                {LEGAL_DOCS[activeLegalKey].content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}