import React, { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import HowItWorks from "./HowItWorks";
import Contact from "./Contact";
import NearbyDestinations from "./NearbyDestinations";
import Footer from "./Footer";
import ReservationModal from "../components/ReservationModal";
import PackagesDeals from "./PackagesDeals";
import "./LandingPage.css";

export default function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookPackage = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <div className="landing-page">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />
      <main>
        {/* Exact Flow: Hero -> About Us -> How It Works -> Contact -> Nearby Destinations */}
        <Hero onOpenBooking={() => setIsBookingOpen(true)} />
        <About onOpenBooking={() => setIsBookingOpen(true)} />
        <HowItWorks />
        <div id="packages">
          <PackagesDeals onBookPackage={handleBookPackage} />
        </div>
        <Contact />
        <NearbyDestinations />
      </main>

      {/* Landing Page Online Reservation Modal */}
      <ReservationModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />

      <Footer />
    </div>
  );
}