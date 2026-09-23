import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ServicesCatalog from '../components/ServicesCatalog';
import './LandingPage.css';

// Public "All Services" page — every card comes from the database (Admin → Service Management). View-only.
export default function AllServices() {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <ServicesCatalog />
      </main>
      <Footer />
    </div>
  );
}
