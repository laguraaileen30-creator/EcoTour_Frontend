import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Star, ZoomIn, X, CheckCircle2 } from "lucide-react";
import "./NearbyDestinations.css";
import { useEcoTour } from "../context/EcoTourContext";

// Import background image and attraction images
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import Manmade from "../assets/images/attractions/Manmade.png";
import Tarsier from "../assets/images/attractions/Tarsier.png";
import Guwaon from "../assets/images/attractions/Cave.png";
import Butterfly from "../assets/images/attractions/Garden.png";
import Enchanted from "../assets/images/attractions/Enchanted.png";
import Biodiversity from "../assets/images/attractions/Bio.png";
import Logarita from "../assets/images/attractions/Logarita.png";
import Rajah from "../assets/images/attractions/Rajah.png";
import Kinaiyahan from "../assets/images/attractions/Kinaiyahan.jpg";
import Tinugdan from "../assets/images/attractions/Tinugdan.png";
import Pangas from "../assets/images/attractions/Pangas.png";
import HangingBridge from "../assets/images/attractions/Bridge.png";
import Dagas from "../assets/images/attractions/Dagasdas.png";
import Camelo from "../assets/images/attractions/Camelo.png";

const destinations = [
  {
    id: 1,
    title: "Man Made Forest",
    image: Manmade,
    location: "Villa Aurora",
    distance: "8 km",
    description: "A famous 2-km stretch of towering mahogany trees offering a cool, shaded canopy.",
    tag: "Nature Drive",
  },
  {
    id: 2,
    title: "Bohol Tarsier Conservation Area",
    image: Tarsier,
    location: "Villa Aurora",
    distance: "10 km",
    description: "A protected sanctuary where visitors can view Bohol's tiny, nocturnal primates up close.",
    tag: "Wildlife Sanctuary",
  },
  {
    id: 3,
    title: "Guwaon Cave",
    image: Guwaon,
    location: "Villa Aurora",
    distance: "10 km",
    description: "A scenic cave beside the Tarsier Sanctuary featuring striking stalactite and stalagmite formations.",
    tag: "Cave Exploration",
  },
  {
    id: 4,
    title: "Butterfly Garden",
    image: Butterfly,
    location: "Villa Aurora",
    distance: "11 km",
    description: "A tropical garden and breeding center showcasing hundreds of free-flying native butterfly species.",
    tag: "Nature",
  },
  {
    id: 5,
    title: "Bohol Enchanted Zoological & Botanical Garden",
    image: Enchanted,
    location: "Roxas",
    distance: "12 km",
    description: "A 35-hectare nature park showcasing exotic plants, birds, and reptiles native to Bohol.",
    tag: "Eco Park",
    featured: true,
  },
  {
    id: 6,
    title: "Bohol Biodiversity Complex",
    image: Biodiversity,
    location: "Roxas",
    distance: "13 km",
    description: "An eco-agritourism hub featuring diverse native flora and fauna, plus local dining experiences.",
    tag: "Biodiversity",
  },
  {
    id: 7,
    title: "Logarita Spring",
    image: Logarita,
    location: "Riverside",
    distance: "4 km",
    description: "A natural, crystal-clear cold spring pool perfect for a refreshing swim.",
    tag: "Cold Spring",
  },
  {
    id: 8,
    title: "Rajah Sikatuna Protected Landscape",
    image: Rajah,
    location: "Zamora",
    distance: "5 km",
    description: "Bohol's largest protected forest sanctuary, home to rare birds, lush trails, and natural springs.",
    tag: "Protected Area",
  },
  {
    id: 9,
    title: "Kinaiyahan Forest Park",
    image: Kinaiyahan,
    location: "Campagao",
    distance: "6 km",
    description: "A peaceful forest park featuring camping grounds, scenic walking paths, and mountain air.",
    tag: "Forest Park",
  },
  {
    id: 10,
    title: "Tinugdan Spring",
    image: Tinugdan,
    location: "Poblacion",
    distance: "3 km",
    description: "A serene natural spring with cool, flowing mountain water surrounded by lush foliage.",
    tag: "Natural Spring",
  },
  {
    id: 11,
    title: "Pangas Falls",
    image: Pangas,
    location: "Dagohoy",
    distance: "7 km",
    description: "A cascading waterfall with a wide natural pool, ideal for swimming and picnics.",
    tag: "Waterfall",
  },
  {
    id: 12,
    title: "Bamboo Hanging Bridge",
    image: HangingBridge,
    location: "Sevilla",
    distance: "14 km",
    description: "A pair of woven bamboo suspension bridges crossing the emerald Sipatan River.",
    tag: "Adventure",
  },
  {
    id: 13,
    title: "Dagas-das Falls",
    image: Dagas,
    location: "Yanaya",
    distance: "9 km",
    description: "A hidden waterfall nestled deep in the forest, offering a tranquil escape off the beaten path.",
    tag: "Hidden Gem",
  },
  {
    id: 14,
    title: "Mt. Camelo Monastery",
    image: Camelo,
    location: "Poblacion",
    distance: "6 km",
    description: "A hilltop monastery offering panoramic views of Bilar's lush valleys and quiet meditation grounds.",
    tag: "Viewpoint",
  },
];

export default function NearbyDestinations() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const scrollRef = useRef(null);

  const scrollToCard = (index) => {
    setActive(index);
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.children[index];
      if (card) {
        const cardOffset = card.offsetLeft - container.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
        container.scrollTo({
          left: cardOffset,
          behavior: "smooth",
        });
      }
    }
  };

  const handlePrevDestModal = (e) => {
    e.stopPropagation();
    if (!selectedDestination) return;
    const currentIndex = destinations.findIndex((d) => d.id === selectedDestination.id);
    const prevIndex = (currentIndex - 1 + destinations.length) % destinations.length;
    setSelectedDestination(destinations[prevIndex]);
  };

  const handleNextDestModal = (e) => {
    e.stopPropagation();
    if (!selectedDestination) return;
    const currentIndex = destinations.findIndex((d) => d.id === selectedDestination.id);
    const nextIndex = (currentIndex + 1) % destinations.length;
    setSelectedDestination(destinations[nextIndex]);
  };

  useEffect(() => {
    if (isHovered || selectedDestination) return;

    const interval = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % destinations.length;
        if (scrollRef.current) {
          const container = scrollRef.current;
          const card = container.children[next];
          if (card) {
            const cardOffset = card.offsetLeft - container.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
            container.scrollTo({
              left: cardOffset,
              behavior: "smooth",
            });
          }
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered, selectedDestination]);

  const scroll = (dir) => {
    const next = (active + dir + destinations.length) % destinations.length;
    scrollToCard(next);
  };

  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;

  return (
    <section
      id="nearby"
      className="nearby-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image Layer */}
      <div className="section__bg" style={{ backgroundImage: `url(${currentBg})` }} aria-hidden="true" />

      <div className="container nearby-container">
        {/* Header */}
        <motion.div
          className="nearby-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="nearby-eyebrow">Explore Nearby</p>
          <h2 className="nearby-title">
            NEARBY <span className="text-primary">DESTINATIONS</span>
          </h2>
        </motion.div>

        {/* Carousel Wrapper */}
        <div className="carousel-wrapper">
          {/* Left Arrow */}
          <motion.button
            className="carousel-arrow carousel-arrow--left"
            onClick={() => scroll(-1)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Previous destination"
          >
            <ChevronLeft size={18} />
          </motion.button>

          {/* Cards Track */}
          <div className="carousel-track" ref={scrollRef}>
            {destinations.map((dest, i) => {
              const isFeatured = i === active;
              return (
                <motion.div
                  key={dest.id}
                  className={`dest-card ${isFeatured ? "dest-card--featured" : ""}`}
                  onClick={() => {
                    scrollToCard(i);
                    setSelectedDestination(dest);
                  }}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: isFeatured ? 1 : 0.95,
                    width: isFeatured ? 280 : 200,
                    height: isFeatured ? 360 : 300,
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: isFeatured ? 1.02 : 1.04 }}
                >
                  <img src={dest.image} alt={dest.title} className="dest-card-image" />
                  <div className="dest-card-overlay" />

                  {/* Zoom Cursor Badge Overlay */}
                  <div className="dest-card-zoom-badge" title="Click to View Destination">
                    <ZoomIn size={14} />
                  </div>

                  {dest.featured && (
                    <div className="dest-card-badge">
                      <Star size={10} />
                      <span>Most Visited</span>
                    </div>
                  )}

                  <div className="dest-card-content">
                    <p className="dest-card-distance">
                      <MapPin size={10} />
                      {dest.distance} • {dest.location}
                    </p>
                    <p className="dest-card-name">{dest.title}</p>

                    {isFeatured && (
                      <motion.p
                        className="dest-card-desc"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.4 }}
                      >
                        {dest.description}
                      </motion.p>
                    )}

                    <div className="dest-card-tags">
                      <span className="dest-card-tag">{dest.tag}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <motion.button
            className="carousel-arrow carousel-arrow--right"
            onClick={() => scroll(1)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Next destination"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Dots Pagination */}
        <div className="carousel-dots">
          {destinations.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === active ? "carousel-dot--active" : ""}`}
              onClick={() => scrollToCard(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* DESTINATION GLASS LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedDestination && (
          <div className="dest-lightbox-backdrop" onClick={() => setSelectedDestination(null)}>
            <motion.div
              className="dest-lightbox-card"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Navigation Bar */}
              <div className="dest-lightbox-topbar">
                <div className="dest-lightbox-counter">
                  <span>Destination {destinations.findIndex(d => d.id === selectedDestination.id) + 1} of {destinations.length}</span>
                </div>
                <button
                  type="button"
                  className="dest-lightbox-close"
                  onClick={() => setSelectedDestination(null)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Modal Grid Layout */}
              <div className="dest-lightbox-main">
                {/* Left Arrow */}
                <button
                  type="button"
                  className="dest-lightbox-arrow arrow-left"
                  onClick={handlePrevDestModal}
                  aria-label="Previous Destination"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Large Image Box */}
                <div className="dest-lightbox-image-box">
                  <motion.img
                    key={selectedDestination.id}
                    src={selectedDestination.image}
                    alt={selectedDestination.title}
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="dest-lightbox-image-overlay" />
                  <div className="dest-lightbox-badge">{selectedDestination.tag}</div>
                </div>

                {/* Right Arrow */}
                <button
                  type="button"
                  className="dest-lightbox-arrow arrow-right"
                  onClick={handleNextDestModal}
                  aria-label="Next Destination"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Details Side */}
                <div className="dest-lightbox-details">
                  <div className="dest-lightbox-location-tag flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <MapPin size={14} />
                    <span>{selectedDestination.distance} • {selectedDestination.location}</span>
                  </div>

                  <h2 className="dest-lightbox-title">{selectedDestination.title}</h2>
                  <p className="dest-lightbox-desc">{selectedDestination.description}</p>

                  <div className="dest-lightbox-highlights">
                    <div className="dest-highlight-item">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>Top Tourist Attraction in Bohol</span>
                    </div>
                    <div className="dest-highlight-item">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>Easy Access & Guided Directions</span>
                    </div>
                    <div className="dest-highlight-item">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>Scenic Spot & Photo Opportunities</span>
                    </div>
                  </div>

                  <div className="dest-lightbox-footer-actions">
                    <button
                      type="button"
                      className="dest-lightbox-close-btn"
                      onClick={() => setSelectedDestination(null)}
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
    </section>
  );
}