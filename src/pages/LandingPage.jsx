import React, { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Contact from "./Contact";
import NearbyDestinations from "./NearbyDestinations";
import Footer from "./Footer";
import ReservationModal from "../components/ReservationModal";
import "./LandingPage.css";

export default function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="landing-page">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
      <main>
        {/* Exact Flow: Hero -> About Us (with Explore Services Live Tracker) -> Contact -> Nearby Destinations */}
        <Hero onOpenBooking={() => setIsBookingOpen(true)} />
        <About onOpenBooking={() => setIsBookingOpen(true)} />
        <Contact />
        <NearbyDestinations />
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