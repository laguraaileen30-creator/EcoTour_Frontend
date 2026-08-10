import React, { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import NearbyDestinations from "./NearbyDestinations";
import Contact from "./Contact";
import Footer from "./Footer";
import ReservationModal from "../components/ReservationModal";
import "./LandingPage.css";

export default function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="landing-page">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
      <main>
        <Hero onOpenBooking={() => setIsBookingOpen(true)} />
        <About />
        <NearbyDestinations />
        <Contact />
      </main>

      {/* Landing Page Online Reservation Modal */}
      <ReservationModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <Footer />
    </div>
  );
}