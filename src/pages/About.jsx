import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Home, Sparkles, ArrowRight, X, Waves, 
  Bed, Trees, ShieldCheck, Calendar, Car, Music, Tent, Utensils, CheckCircle2, ChevronRight, ChevronLeft, Maximize2 
} from "lucide-react";
import "./About.css";
import { useEcoTour } from "../context/EcoTourContext";

// Images
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import springImage from "../assets/spring.png";
import cottageImage from "../assets/water.png"; 
import overviewImage from "../assets/overview.png";
import swimming from "../assets/images/services/swimming.png";
import cottage from "../assets/images/services/cottage.png";
import room from "../assets/images/services/room.png";
import table from "../assets/images/services/table.png";
import floating from "../assets/images/services/floating.png";
import vest from "../assets/images/services/lifevest.png";
import tent from "../assets/images/services/tent.png";
import parking from "../assets/images/services/parking.png";
import videoke from "../assets/images/services/videoke.png";
import buffet from "../assets/images/services/buffet.png";
import event from "../assets/images/services/event.png";

const CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "spring", label: "Spring & Water" },
  { id: "accommodations", label: "Accommodations" },
  { id: "rentals", label: "Rentals & Safety" },
  { id: "dining", label: "Dining & Events" },
];

const SERVICES_DATA = [
  {
    id: 1,
    category: "spring",
    title: "Natural Cold Spring Pools",
    image: swimming,
    icon: "💧",
    badge: "100% Pure Spring Water",
    tagline: "Refreshingly Cool & Chemical-Free",
    description: "Immerse yourself in crystal-clear mountain spring waters continuously refreshed by natural underground aquifers, nestled under a canopy of lush forest trees.",
  },
  {
    id: 2,
    category: "accommodations",
    title: "Open & Family Cottages",
    image: cottage,
    icon: "🏡",
    badge: "Day Picnic Essential",
    tagline: "Shaded Bamboo Relaxation",
    description: "Spacious open-air cottages designed for families and large groups, providing comfortable seating, shade, and direct access to the spring pools.",
  },
  {
    id: 3,
    category: "accommodations",
    title: "Overnight Room Accommodations",
    image: room,
    icon: "🛏️",
    badge: "Overnight Stay",
    tagline: "Peaceful Forest Sleep",
    description: "Comfortable air-conditioned rooms equipped with plush bedding, private ensuite bathrooms, and serene balcony views of the resort foliage.",
  },
  {
    id: 4,
    category: "rentals",
    title: "Picnic Tables & Bench Sets",
    image: table,
    icon: "🪑",
    badge: "Casual Gathering",
    tagline: "Waterfront Dining Seats",
    description: "Heavy-duty wooden table and chair arrangements positioned along the spring banks, perfect for outdoor dining, reunions, and snacks.",
  },
  {
    id: 5,
    category: "spring",
    title: "Floating Tubes & Swim Floats",
    image: floating,
    icon: "🛟",
    badge: "Family Fun",
    tagline: "Lazy River Drift",
    description: "Clean, high-durability floating tubes in various sizes allowing children and adults to float safely and effortlessly down the gentle spring stream.",
  },
  {
    id: 6,
    category: "rentals",
    title: "Safety Life Vest Rentals",
    image: vest,
    icon: "🦺",
    badge: "Safety Certified",
    tagline: "Total Peace of Mind",
    description: "USCG-certified life jackets available for toddlers, kids, and adults, ensuring secure swimming experiences for all guests.",
  },
  {
    id: 7,
    category: "accommodations",
    title: "Outdoor Camping Tents",
    image: tent,
    icon: "⛺",
    badge: "Nature Camping",
    tagline: "Under the Stars",
    description: "Weather-resistant camping tents supplied with ground pads and lanterns for adventurers seeking a magical night under the Bohol night sky.",
  },
  {
    id: 8,
    category: "rentals",
    title: "Monitored Gated Parking",
    image: parking,
    icon: "🚗",
    badge: "24/7 Security",
    tagline: "Ample Vehicle Capacity",
    description: "Expansive parking area monitored by security personnel, equipped to accommodate private cars, motorcycles, SUVs, and large tour buses.",
  },
  {
    id: 9,
    category: "dining",
    title: "KTV Videoke Rental",
    image: videoke,
    icon: "🎤",
    badge: "Entertainment",
    tagline: "Thousands of Songs",
    description: "State-of-the-art karaoke sound systems loaded with international and local hit songs for festive sing-along sessions with family and friends.",
  },
  {
    id: 10,
    category: "dining",
    title: "Buffet & Catering Packages",
    image: buffet,
    icon: "🥘",
    badge: "Chef Prepared",
    tagline: "Authentic Boholano Cuisine",
    description: "Generous buffet spreads featuring freshly prepared Filipino delicacies, seafood, and tropical desserts tailored for celebrations and group outings.",
  },
  {
    id: 11,
    category: "dining",
    title: "Exclusive Resort Reservation",
    image: event,
    icon: "🎉",
    badge: "Private Function",
    tagline: "Unforgettable Gatherings",
    description: "Full resort ground reservations for weddings, corporate team-building, birthdays, and private seminars with dedicated service staff.",
  },
];

export default function About() {
  const [showServices, setShowServices] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);

  const filteredServices = activeCategory === "all" 
    ? SERVICES_DATA 
    : SERVICES_DATA.filter((s) => s.category === activeCategory);

  const handleOpenServices = () => {
    setShowServices(true);
    setTimeout(() => {
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCloseServices = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      setShowServices(false);
    }, 400);
  };

  const handlePrevLightbox = (e) => {
    e.stopPropagation();
    if (!selectedService) return;
    const currentIndex = SERVICES_DATA.findIndex((s) => s.id === selectedService.id);
    const prevIndex = (currentIndex - 1 + SERVICES_DATA.length) % SERVICES_DATA.length;
    setSelectedService(SERVICES_DATA[prevIndex]);
  };

  const handleNextLightbox = (e) => {
    e.stopPropagation();
    if (!selectedService) return;
    const currentIndex = SERVICES_DATA.findIndex((s) => s.id === selectedService.id);
    const nextIndex = (currentIndex + 1) % SERVICES_DATA.length;
    setSelectedService(SERVICES_DATA[nextIndex]);
  };

  const selectedIndex = selectedService 
    ? SERVICES_DATA.findIndex((s) => s.id === selectedService.id) 
    : 0;

  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;

  return (
    <>
      {/* ABOUT SECTION */}
      <section id="about" className="about-section">
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
                <div className="about-eyebrow">ABOUT US</div>
                <h2 className="about-title">
                  YOUR NATURE <br />
                  <span className="text-accent">GETAWAY</span>
                </h2>
              </div>

              <p className="about-description">
                Cold Spring Resort is your perfect getaway nestled in the heart of nature. Enjoy the cool spring water, lush greenery, and unforgettable moments with your loved ones.
              </p>

              {/* 3 FEATURE PILLS */}
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-box"><Droplets className="feature-icon" /></div>
                  <div className="feature-title">NATURAL SPRINGS</div>
                  <p className="feature-desc">Crystal clear and refreshing waters.</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-box"><Home className="feature-icon" /></div>
                  <div className="feature-title">RELAXING SPACES</div>
                  <p className="feature-desc">Comfortable cottages and amenities.</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-box"><Sparkles className="feature-icon" /></div>
                  <div className="feature-title">MEMORABLE EXPERIENCES</div>
                  <p className="feature-desc">Perfect for family, friends, and travelers.</p>
                </div>
              </div>

              {/* EXPLORE OUR SERVICES BUTTON */}
              <button onClick={handleOpenServices} className="about-cta-btn">
                <span>{showServices ? "VIEW OUR SERVICES" : "EXPLORE OUR SERVICES"}</span>
                <div className="btn-icon-wrapper"><ArrowRight className="btn-icon" /></div>
              </button>
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
                {/* Card 1: Back */}
                <div className="stack-card card-1">
                  <img src={springImage} alt="Natural Cold Spring" loading="lazy" />
                  <div className="card-overlay" />
                </div>
                
                {/* Card 2: Middle */}
                <div className="stack-card card-2">
                  <img src={cottageImage} alt="Bamboo Cottages" loading="lazy" />
                  <div className="card-overlay" />
                </div>
                
                {/* Card 3: Front */}
                <div className="stack-card card-3">
                  <img src={overviewImage} alt="Resort Overview" loading="lazy" />
                  <div className="card-overlay" />
                  
                  <div className="card-tags">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                      Peaceful Place
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Family Friendly
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 22v-9"/><path d="M12 13a5 5 0 0 1 5-5c2 0 3 1 3 3 0 1.5-1 2.5-2 3.5"/><path d="M12 13a5 5 0 0 0-5-5c-2 0-3 1-3 3 0 1.5 1 2.5 2 3.5"/></svg>
                      Nature Escape
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FLUID IMAGE LIGHTBOX OUR SERVICES GALLERY SECTION */}
      <AnimatePresence>
        {showServices && (
          <motion.section 
            id="services" 
            className="services-section-enhanced"
            initial={{ opacity: 0, height: 0, y: 50 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section__bg" style={{ backgroundImage: `url(${currentBg})` }} aria-hidden="true" />
            
            <div className="services-enhanced-container">
              <motion.div 
                className="services-enhanced-header"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="services-enhanced-eyebrow">FLUID IMAGE GALLERY & SERVICES</span>
                </div>
                <h2 className="services-enhanced-title">Everything You Need for an Unforgettable Escape</h2>
                <p className="services-enhanced-subtitle">
                  Click on any service card or image to open the full-screen fluid lightbox viewer.
                </p>

                {/* Category Filter Tabs */}
                <div className="services-category-tabs">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-tab-btn ${activeCategory === cat.id ? "is-active" : ""}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Responsive Fluid Image Grid */}
              <motion.div 
                className="services-grid-enhanced"
                layout
              >
                <AnimatePresence>
                  {filteredServices.map((service) => (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="service-card-enhanced group"
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="service-card-image-wrap">
                        <img src={service.image} alt={service.title} loading="lazy" />
                        <div className="service-card-overlay" />
                        <span className="service-badge-pill">{service.badge}</span>
                        
                        {/* Fluid Lightbox Expand Icon Button */}
                        <div className="lightbox-expand-badge" title="Open">
                          <Maximize2 size={14} />
                        </div>
                      </div>

                      <div className="service-card-body">
                        <div className="service-card-top font-serif">
                          <span className="service-card-icon">{service.icon}</span>
                          <small className="service-tagline">{service.tagline}</small>
                        </div>

                        <h3 className="service-card-title">{service.title}</h3>
                        <p className="service-card-desc">{service.description}</p>

                        <div className="service-card-footer">
                          <button 
                            type="button" 
                            className="service-learn-more-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(service);
                            }}
                          >
                            <span>Open</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Close Services / Back to About Button */}
              <div className="services-close-wrap">
                <button 
                  type="button" 
                  className="services-close-btn"
                  onClick={handleCloseServices}
                >
                  <X size={16} />
                  <span>Close Services Section</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FLUID FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedService && (
          <div className="fluid-lightbox-backdrop" onClick={() => setSelectedService(null)}>
            <motion.div 
              className="fluid-lightbox-card"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Navigation Bar inside Lightbox */}
              <div className="fluid-lightbox-topbar">
                <div className="fluid-lightbox-counter">
                  <span>Service {selectedIndex + 1} of {SERVICES_DATA.length}</span>
                </div>
                <button 
                  className="fluid-lightbox-close" 
                  onClick={() => setSelectedService(null)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Lightbox Content Layout */}
              <div className="fluid-lightbox-main">
                {/* Left Arrow */}
                <button 
                  type="button"
                  className="fluid-lightbox-arrow arrow-left" 
                  onClick={handlePrevLightbox}
                  aria-label="Previous Service"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Fluid Hero Image */}
                <div className="fluid-lightbox-image-box">
                  <motion.img 
                    key={selectedService.id}
                    src={selectedService.image} 
                    alt={selectedService.title}
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="fluid-lightbox-image-overlay" />
                  <div className="fluid-lightbox-badge">{selectedService.badge}</div>
                </div>

                {/* Right Arrow */}
                <button 
                  type="button"
                  className="fluid-lightbox-arrow arrow-right" 
                  onClick={handleNextLightbox}
                  aria-label="Next Service"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Lightbox Details Side */}
                <div className="fluid-lightbox-details">
                  <div className="lightbox-header-icon">{selectedService.icon}</div>
                  <small className="lightbox-tagline">✨ {selectedService.tagline}</small>
                  <h2 className="lightbox-title">{selectedService.title}</h2>
                  <p className="lightbox-desc">{selectedService.description}</p>
                  
                  <div className="lightbox-features-list">
                    <div className="lightbox-feature-item">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Natural & Maintained Daily</span>
                    </div>
                    <div className="highlight-item">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Ideal for Families & Groups</span>
                    </div>
                    <div className="highlight-item">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Available On-Site</span>
                    </div>
                  </div>

                  <div className="lightbox-footer-actions">
                    <button 
                      type="button" 
                      className="lightbox-close-btn"
                      onClick={() => setSelectedService(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
