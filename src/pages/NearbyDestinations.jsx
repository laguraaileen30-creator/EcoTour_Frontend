import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
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
    location: "Zamora",
    distance: "3 km",
    description: "A lush 17-hectare bamboo forest park offering scenic trails, picnic areas, and nature activities.",
    tag: "Forest Park",
  },
  {
    id: 10,
    title: "Tinugdan Spring",
    image: Tinugdan,
    location: "Campagao",
    distance: "7 km",
    description: "A refreshing natural spring with ice-cold water and an easy, scenic hiking trail.",
    tag: "Spring",
  },
  {
    id: 11,
    title: "Pangas Falls",
    image: Pangas,
    location: "Dagohoy",
    distance: "15 km",
    description: "A scenic hidden waterfall featuring crystal-clear turquoise pools surrounded by lush greenery.",
    tag: "Waterfall",
  },
  {
    id: 12,
    title: "Hanging Bridge",
    image: HangingBridge,
    location: "Dagohoy",
    distance: "15 km",
    description: "A rustic bamboo hanging bridge near Pangas Falls offering scenic, adventurous views.",
    tag: "Adventure",
  },
  {
    id: 13,
    title: "Dagas-das Falls",
    image: Dagas,
    location: "Dagohoy",
    distance: "17 km",
    description: "A serene, natural waterfall nestled in the lush, green landscape of Barangay Dagohoy.",
    tag: "Waterfall",
  },
  {
    id: 14,
    title: "Camelo Farm",
    image: Camelo,
    location: "Zamora",
    distance: "6 km",
    description: "A peaceful farm venue in Sitio Lagiwliw offering mountain views and a relaxing space for gatherings.",
    tag: "Farm",
  },
];

export default function NearbyDestinations() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef(null);

  // Smooth horizontal scroll to target card inside carousel only (no page/background movement)
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

  // Non-stop 2-second smooth infinity loop
  useEffect(() => {
    if (isHovered) return;

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
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered]);

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
      {/* Background Image Layer - Fixed background */}
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
          {/* Left Arrow - Infinite Loop */}
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
                  onClick={() => scrollToCard(i)}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: isFeatured ? 1 : 0.95,
                    width: isFeatured ? 280 : 200,
                    height: isFeatured ? 360 : 300,
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={!isFeatured ? { scale: 1.03 } : {}}
                >
                  <img src={dest.image} alt={dest.title} className="dest-card-image" />
                  <div className="dest-card-overlay" />

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

          {/* Right Arrow - Infinite Loop */}
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
    </section>
  );
}