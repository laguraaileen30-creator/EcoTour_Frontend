import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, Home, Sparkles, ArrowRight, X, Waves,
  Bed, Trees, ShieldCheck, Calendar, Car, Music, Tent, Utensils, CheckCircle2, ChevronRight, ChevronLeft, Maximize2, Users, AlertCircle, Clock
} from "lucide-react";
import "./About.css";
import { useEcoTour } from "../context/EcoTourContext";
import { getStageIndex } from "../components/VerticalReservationTimeline";

// Images
import homeImage from "../assets/home2.png";
import lightImage from "../assets/home1.png";
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
  { id: "all", label: "All" },
  { id: "cottages", label: "Cottages" },
  { id: "accommodations", label: "Accommodations" },
  { id: "water", label: "Water Activities" },
  { id: "tables", label: "Tables" },
  { id: "entertainment", label: "Entertainment" },
  { id: "dining", label: "Dining & Events" },
  { id: "safety", label: "Safety & Parking" },
];

const SERVICES_CATALOG_DATA = [
  {
    id: "DSVC-001",
    service_code: "DSVC-001",
    title: "Cold Spring Pool Entrance Ticket",
    category: "water",
    categoryLabel: "Entrance",
    price: 100,
    unit: "head",
    total_capacity: 300,
    image: swimming,
    icon: "💧",
    badge: "100% Pure Spring Water",
    tagline: "Day pass access to natural cold spring pool",
    description: "Immerse yourself in crystal-clear mountain spring waters continuously refreshed by natural underground aquifers, nestled under a canopy of lush forest trees.",
  },
  {
    id: "DSVC-002",
    service_code: "DSVC-002",
    title: "Standard Open Cottage",
    category: "cottages",
    categoryLabel: "Cottage",
    price: 600,
    unit: "day",
    total_capacity: 10,
    image: cottage,
    icon: "🏡",
    badge: "Day Picnic Essential",
    tagline: "Shaded native open cottage near pool",
    description: "Spacious traditional bamboo cottage shaded under tropical mahogany trees right beside the crystal clear cold spring water pool.",
  },
  {
    id: "DSVC-003",
    service_code: "DSVC-003",
    title: "Resort Table & Chairs Set",
    category: "tables",
    categoryLabel: "Rental",
    price: 250,
    unit: "day",
    total_capacity: 15,
    image: table,
    icon: "🪑",
    badge: "Casual Gathering",
    tagline: "1 Table + 4 monoblock chairs",
    description: "Heavy-duty wooden table and chair arrangements positioned along the spring banks, perfect for outdoor dining, reunions, and snacks.",
  },
  {
    id: "DSVC-004",
    service_code: "DSVC-004",
    title: "Life Vest / Safety Gear",
    category: "safety",
    categoryLabel: "Safety",
    price: 50,
    unit: "head",
    total_capacity: 30,
    image: vest,
    icon: "🦺",
    badge: "Safety Certified",
    tagline: "Adult & Kid safety flotation vest",
    description: "USCG-certified life jackets available for toddlers, kids, and adults, ensuring secure swimming experiences for all guests.",
  },
  {
    id: "DSVC-005",
    service_code: "DSVC-005",
    title: "Videoke Karaoke System",
    category: "entertainment",
    categoryLabel: "Entertainment",
    price: 500,
    unit: "day",
    total_capacity: 4,
    image: videoke,
    icon: "🎤",
    badge: "Entertainment",
    tagline: "Heavy-duty Videoke sound system",
    description: "State-of-the-art karaoke sound systems loaded with international and local hit songs for festive sing-along sessions with family and friends.",
  },
  {
    id: "DSVC-006",
    service_code: "DSVC-006",
    title: "Kayak / Floating Pad Rental",
    category: "water",
    categoryLabel: "Water Activity",
    price: 300,
    unit: "hour",
    total_capacity: 5,
    image: floating,
    icon: "🛟",
    badge: "Water Adventure",
    tagline: "1-hour kayak & water pad rental",
    description: "Clean, high-durability floating tubes & kayaks in various sizes allowing children and adults to float safely down the gentle spring stream.",
  },
  {
    id: "DSVC-007",
    service_code: "DSVC-007",
    title: "Camping Pitch & Tent",
    category: "accommodations",
    categoryLabel: "Accommodation",
    price: 450,
    unit: "night",
    total_capacity: 8,
    image: tent,
    icon: "⛺",
    badge: "Nature Camping",
    tagline: "Overnight camping slot & tent",
    description: "Weather-resistant camping tents supplied with ground pads and lanterns for adventurers seeking a magical night under the Bohol night sky.",
  },
  {
    id: "DSVC-008",
    service_code: "DSVC-008",
    title: "Aircon Kubo Guest Room",
    category: "accommodations",
    categoryLabel: "Accommodation",
    price: 1500,
    unit: "night",
    total_capacity: 4,
    image: room,
    icon: "🛏️",
    badge: "Overnight Stay",
    tagline: "Private aircon room with bed & bath",
    description: "Comfortable air-conditioned rooms equipped with plush bedding, private ensuite bathrooms, and serene balcony views of the resort foliage.",
  },
  {
    id: "DSVC-009",
    service_code: "DSVC-009",
    title: "Private Event Pavilion",
    category: "dining",
    categoryLabel: "Event",
    price: 3500,
    unit: "event",
    total_capacity: 2,
    image: event,
    icon: "🎉",
    badge: "Private Function",
    tagline: "Private pavilion for family gatherings & events",
    description: "Full private pavilion ground reservations for weddings, corporate team-building, birthdays, and private seminars with dedicated service staff.",
  },
  {
    id: "DSVC-010",
    service_code: "DSVC-010",
    title: "Buffet & Catering Station",
    category: "dining",
    categoryLabel: "Food",
    price: 450,
    unit: "head",
    total_capacity: 50,
    image: buffet,
    icon: "🥘",
    badge: "Chef Prepared",
    tagline: "Native buffet catering package",
    description: "Generous buffet spreads featuring freshly prepared Filipino delicacies, seafood, and tropical desserts tailored for celebrations and group outings.",
  },
  {
    id: "DSVC-011",
    service_code: "DSVC-011",
    title: "Secured Resort Parking Slot",
    category: "safety",
    categoryLabel: "Parking",
    price: 50,
    unit: "vehicle",
    total_capacity: 40,
    image: parking,
    icon: "🚗",
    badge: "24/7 Security",
    tagline: "Safe vehicle parking for cars & vans",
    description: "Expansive parking area monitored by security personnel, equipped to accommodate private cars, motorcycles, SUVs, and large tour buses.",
  },
];

export default function About({ onOpenBooking }) {
  const { resortServices, resortBookings, reservations, walkIns = [], theme } = useEcoTour();
  const [showServices, setShowServices] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const isLight = theme === "light";

  // Active bookings and walk-ins
  const allBookings = resortBookings?.length ? resortBookings : (reservations || []);

  const getInUseForService = (title, code) => {
    const sTitle = (title || '').toLowerCase().trim();
    const sCode = (code || '').toLowerCase().trim();
    let count = 0;

    // 1. In-service / Active Reservations
    allBookings.forEach(b => {
      const status = (b.status || '').toLowerCase();
      const isConcluded = status.includes('completed') || status.includes('cancel') || status.includes('void') || status.includes('checkout') || status.includes('checked out') || status.includes('done');
      const isPaidOrInService = (
        status.includes('paid') ||
        status.includes('using') ||
        status.includes('in resort') ||
        status.includes('checked in') ||
        status.includes('active') ||
        status.includes('confirmed')
      );

      if (isPaidOrInService && !isConcluded) {
        if (Array.isArray(b.items) && b.items.length > 0) {
          b.items.forEach(it => {
            const itName = (it.name || it.serviceName || '').toLowerCase();
            if (itName.includes(sTitle) || sTitle.includes(itName) || (it.service_code && it.service_code.toLowerCase() === sCode)) {
              count += parseInt(it.quantity || 1, 10);
            }
          });
        } else {
          const bSvc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
          if (bSvc.includes(sTitle) || sTitle.includes(bSvc)) {
            count += 1;
          }
        }
      }
    });

    // 2. Active Walk-Ins
    (walkIns || []).forEach(w => {
      const isConcluded = w.walk_in_status === 'COMPLETED' || (w.status || '').toLowerCase().includes('completed') || (w.payment_status || '').toLowerCase().includes('cancel');
      const isWalkInActive = (w.walk_in_status === 'ACTIVE' || w.payment_status === 'PAID') && !isConcluded;

      if (isWalkInActive && Array.isArray(w.items) && w.items.length > 0) {
        w.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          if (itName.includes(sTitle) || sTitle.includes(itName) || (it.service_code && it.service_code.toLowerCase() === sCode)) {
            count += parseInt(it.quantity || 1, 10);
          }
        });
      }
    });

    return count;
  };

  const totalOccupiedUnits = SERVICES_CATALOG_DATA.reduce((sum, s) => sum + getInUseForService(s.title, s.service_code), 0);
  const totalActiveGuests = allBookings.filter(b => {
    const status = (b.status || '').toLowerCase();
    const isConcluded = status.includes('completed') || status.includes('cancel') || status.includes('void') || status.includes('checkout') || status.includes('checked out') || status.includes('done');
    const isPaidOrInService = status.includes('paid') || status.includes('using') || status.includes('in resort') || status.includes('checked in') || status.includes('active') || status.includes('confirmed');
    return isPaidOrInService && !isConcluded;
  }).length + (walkIns || []).filter(w => (w.walk_in_status === 'ACTIVE' || w.payment_status === 'PAID') && w.walk_in_status !== 'COMPLETED').length;

  const filteredServices = activeCategory === "all"
    ? SERVICES_CATALOG_DATA
    : SERVICES_CATALOG_DATA.filter((s) => s.category === activeCategory);

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
    const currentIndex = SERVICES_CATALOG_DATA.findIndex((s) => s.id === selectedService.id);
    const prevIndex = (currentIndex - 1 + SERVICES_CATALOG_DATA.length) % SERVICES_CATALOG_DATA.length;
    setSelectedService(SERVICES_CATALOG_DATA[prevIndex]);
  };

  const handleNextLightbox = (e) => {
    e.stopPropagation();
    if (!selectedService) return;
    const currentIndex = SERVICES_CATALOG_DATA.findIndex((s) => s.id === selectedService.id);
    const nextIndex = (currentIndex + 1) % SERVICES_CATALOG_DATA.length;
    setSelectedService(SERVICES_CATALOG_DATA[nextIndex]);
  };

  const selectedIndex = selectedService
    ? SERVICES_CATALOG_DATA.findIndex((s) => s.id === selectedService.id)
    : 0;

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

              {/* EXPLORE OUR SERVICES BUTTON */}
              <button
                onClick={handleOpenServices}
                className="about-cta-btn"
                style={{
                  background: 'var(--accent, #10b981)',
                  color: isLight ? '#fff' : '#04170e',
                  fontWeight: 800
                }}
              >
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

      {/* REAL-TIME EXPLORE OUR SERVICES SECTION */}
      <AnimatePresence>
        {showServices && (
          <motion.section
            id="services"
            className="services-section-enhanced"
            initial={{ opacity: 0, height: 0, y: 50 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-0)',
              color: 'var(--text)',
            }}
          >
            <div className="section__bg" style={{ backgroundImage: `url(${currentBg})` }} aria-hidden="true" />

            <div className="services-enhanced-container max-w-[1400px] mx-auto px-4 sm:px-6 py-12 space-y-8">
              <motion.div
                className="services-enhanced-header text-center space-y-4 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Facility &amp; Cottage Availability</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                  Live Resort Amenities &amp; Status
                </h2>

                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Track live cottage vacancies, guest rooms, and activity equipment in real time. When guests check in, availability updates automatically.
                </p>

                {/* REAL-TIME STATS PILLS */}
                <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                  <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2" style={{ background: isLight ? 'var(--panel)' : 'rgba(6,40,25,0.7)', border: '1px solid var(--line)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                    <span style={{ color: 'var(--text)' }}>{totalOccupiedUnits} Units Currently In Use</span>
                  </div>

                  <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2" style={{ background: isLight ? 'var(--panel)' : 'rgba(6,40,25,0.7)', border: '1px solid var(--line)' }}>
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span style={{ color: 'var(--text)' }}>{totalActiveGuests} Active Checked-In Guests</span>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 pb-2 scrollbar-none flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      style={
                        activeCategory === cat.id
                          ? {
                              background: 'var(--accent, #10b981)',
                              color: isLight ? '#fff' : '#04170e',
                              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                              fontWeight: 800,
                            }
                          : {
                              background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                              color: 'var(--muted)',
                              border: '1px solid var(--line)',
                            }
                      }
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Real-Time Cards Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4"
                layout
              >
                <AnimatePresence>
                  {filteredServices.map((service) => {
                    const inUseCount = getInUseForService(service.title, service.service_code);
                    const availQty = Math.max(0, service.total_capacity - inUseCount);
                    const isFullyOccupied = availQty === 0 && inUseCount > 0;
                    const isInUse = inUseCount > 0;
                    const occPct = Math.round((inUseCount / service.total_capacity) * 100);

                    return (
                      <motion.div
                        key={service.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-3xl border overflow-hidden flex flex-col justify-between shadow-2xl transition-all hover:scale-[1.02] duration-300 group"
                        style={{
                          background: isLight ? 'var(--bg-1, #fff)' : '#071f14',
                          borderColor: isFullyOccupied ? 'rgba(244,63,94,0.4)' : isInUse ? 'rgba(56,189,248,0.4)' : 'rgba(74,222,128,0.25)',
                          color: 'var(--text)',
                        }}
                      >
                        {/* Image Section */}
                        <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => setSelectedService(service)}>
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#020e07] via-transparent to-black/30" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                            <span className="bg-slate-950/85 backdrop-blur-md text-emerald-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/40">
                              {service.service_code}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${
                                isFullyOccupied
                                  ? 'bg-rose-500/90 text-white border border-rose-300/40'
                                  : isInUse
                                  ? 'bg-sky-500/90 text-white border border-sky-300/40 animate-pulse'
                                  : 'bg-emerald-500/90 text-white border border-emerald-300/40'
                              }`}
                            >
                              {isFullyOccupied ? 'Fully Occupied' : isInUse ? `⚡ In Use (${inUseCount})` : 'Available'}
                            </span>
                          </div>

                          {/* Category Pill */}
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                              {service.categoryLabel || 'Amenity'}
                            </span>
                          </div>

                          {/* Expand icon */}
                          <div className="absolute bottom-3 right-3 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white" title="Open Lightbox">
                            <Maximize2 size={12} />
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text)' }}>
                              {service.title}
                            </h3>
                            <p className="text-[11px] line-clamp-2" style={{ color: 'var(--muted)' }}>
                              {service.tagline || service.description}
                            </p>
                          </div>

                          {/* Real-Time Live Vacancy Bar */}
                          <div className="p-2.5 rounded-2xl space-y-1.5" style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}>
                            <div className="flex justify-between text-[10px] font-semibold">
                              <span style={{ color: 'var(--muted)' }}>Live Vacancy:</span>
                              <strong style={{ color: isFullyOccupied ? '#fb7185' : isInUse ? '#38bdf8' : 'var(--accent)' }}>
                                {availQty} of {service.total_capacity} Available
                              </strong>
                            </div>

                            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.5)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, 100 - occPct))}%`,
                                  background: isFullyOccupied
                                    ? 'linear-gradient(to right, #f43f5e, #fb7185)'
                                    : isInUse
                                    ? 'linear-gradient(to right, #0284c7, #38bdf8)'
                                    : 'linear-gradient(to right, #10b981, #2dd4bf)',
                                }}
                              />
                            </div>
                          </div>

                          {/* Pricing and Book Action */}
                          <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor: 'var(--line)' }}>
                            <div>
                              <span className="text-[9px] block uppercase font-bold" style={{ color: 'var(--muted)' }}>Starting from:</span>
                              <strong className="text-sm font-black font-mono" style={{ color: 'var(--accent)' }}>
                                ₱{service.price.toLocaleString()} <span className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>/ {service.unit}</span>
                              </strong>
                            </div>

                            <button
                              onClick={() => onOpenBooking && onOpenBooking(service)}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider transition-all"
                            >
                              <span>Book</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Close Services / Back to About Button */}
              <div className="text-center pt-6">
                <button
                  type="button"
                  className="px-6 py-3 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer transition-all border shadow-lg"
                  style={{
                    background: isLight ? 'var(--panel)' : '#071f14',
                    borderColor: 'var(--line)',
                    color: 'var(--text)',
                  }}
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
              <div className="fluid-lightbox-topbar">
                <div className="fluid-lightbox-counter">
                  <span>Service {selectedIndex + 1} of {SERVICES_CATALOG_DATA.length} • {selectedService.service_code}</span>
                </div>
                <button
                  className="fluid-lightbox-close"
                  onClick={() => setSelectedService(null)}
                  aria-label="Close Lightbox"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="fluid-lightbox-main">
                <button
                  type="button"
                  className="fluid-lightbox-arrow arrow-left"
                  onClick={handlePrevLightbox}
                  aria-label="Previous Service"
                >
                  <ChevronLeft size={24} />
                </button>

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

                <button
                  type="button"
                  className="fluid-lightbox-arrow arrow-right"
                  onClick={handleNextLightbox}
                  aria-label="Next Service"
                >
                  <ChevronRight size={24} />
                </button>

                <div className="fluid-lightbox-details">
                  <div className="lightbox-header-icon">{selectedService.icon}</div>
                  <small className="lightbox-tagline">✨ {selectedService.tagline}</small>
                  <h2 className="lightbox-title">{selectedService.title}</h2>
                  <p className="lightbox-desc">{selectedService.description}</p>

                  <div className="lightbox-features-list">
                    <div className="lightbox-feature-item">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Rate: ₱{selectedService.price.toLocaleString()} / {selectedService.unit}</span>
                    </div>
                    <div className="lightbox-feature-item">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Total Resort Capacity: {selectedService.total_capacity} Units</span>
                    </div>
                    <div className="lightbox-feature-item">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Real-Time Availability Synchronized</span>
                    </div>
                  </div>

                  <div className="lightbox-footer-actions flex gap-2">
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
                      onClick={() => {
                        setSelectedService(null);
                        if (onOpenBooking) onOpenBooking(selectedService);
                      }}
                    >
                      <span>Book Online Now</span>
                      <ArrowRight size={14} />
                    </button>
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
