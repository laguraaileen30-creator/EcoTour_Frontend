import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import HowItWorks from "./HowItWorks";
import Contact from "./Contact";
import NearbyDestinations from "./NearbyDestinations";
import Footer from "./Footer";
import PackagesDeals from "./PackagesDeals";
import "./LandingPage.css";

// Public landing page is view-only: visitors browse packages and their included services.
// Reservations are made from the client portal after logging in.
export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        {/* Exact Flow: Hero -> About Us -> How It Works -> Packages -> Contact -> Nearby Destinations */}
        <Hero />
        <About />
        <HowItWorks />
        <div id="packages">
          <PackagesDeals />
        </div>
        <Contact />
        <NearbyDestinations />
      </main>

      <Footer />
    </div>
  );
}
