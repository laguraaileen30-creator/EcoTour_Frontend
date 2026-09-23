import React, { useState, useEffect } from 'react';
import { useEcoTour } from '../context/EcoTourContext';
import ServiceDetailsModal from '../components/ServiceDetailsModal';
import StatusBadge from '../components/StatusBadge';
import ServicesCatalog from '../components/ServicesCatalog';
import { API_BASE, resolveImage, isBookable } from '../utils/catalog';

// View-only: shows each package with its included services (booking happens in the client portal)
const PackagesDeals = () => {
  const { theme } = useEcoTour();
  const isLight = theme === 'light';
  
  const [packages, setPackages] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePromo, setActivePromo] = useState(null);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch all packages
      const packRes = await fetch(`${API_BASE}/packages?landing=1`);
      const packData = await packRes.json();
      
      // 2. Fetch active promotions (highest priority sorted by backend)
      const promoRes = await fetch(`${API_BASE}/promotions?landing=1`);
      const promoData = await promoRes.json();
      
      if (packData.success) {
        setPackages(packData.data.map(pkg => ({ ...pkg, image_url: resolveImage(pkg.image_url, 'family gateway deal.png') })));
      }
      
      if (promoData.success && promoData.data.length > 0) {
        // The backend returns the highest priority first, or we can just pick the first one
        setActivePromo(promoData.data[0]);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prices come from the server with any running deal already applied (same price as checkout)
  const getPackagePrice = (pkg) => {
    const finalPrice = Number(pkg.final_price ?? pkg.promo_price ?? pkg.regular_value);
    const originalPrice = Number(pkg.regular_value);
    const hasDiscount = finalPrice < originalPrice;
    const promoDetails = pkg.active_deal ? { id: pkg.active_deal.id, promo_name: pkg.active_deal.name } : null;
    return { finalPrice, originalPrice, hasDiscount, promoDetails };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-16" style={{ background: 'transparent' }}>
      
      {/* Dynamic Promotion Banner */}
      {activePromo && (
        <div 
          className={`w-full py-10 shadow-2xl relative overflow-hidden backdrop-blur-xl mb-12 rounded-3xl border group ${isLight ? 'border-emerald-500/20' : 'border-emerald-500/30'}`}
          style={{ 
            background: isLight ? 'linear-gradient(135deg, rgba(236,253,245,0.8) 0%, rgba(209,250,229,0.9) 100%)' : 'linear-gradient(135deg, rgba(10,90,90,0.6) 0%, rgba(3,19,11,0.8) 100%)',
          }}
        >
          {/* Animated Glow Background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700"></div>
          {!isLight && <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay z-0"></div>}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div>
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black rounded-full mb-3 animate-pulse uppercase shadow-[0_0_20px_rgba(244,63,94,0.6)] border border-rose-400/50 tracking-widest">
                {activePromo.promo_type === 'FLASH' ? '⚡ TODAY ONLY' : '🔥 ACTIVE SALE'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md" style={{ color: isLight ? '#065f46' : 'inherit' }}>{activePromo.promo_name}</h2>
              <p className={`mt-2 text-sm sm:text-base drop-shadow-md font-medium max-w-xl ${isLight ? 'text-emerald-800' : 'text-emerald-100'}`}>{activePromo.description}</p>
            </div>
            <div className="mt-6 md:mt-0">
              <div 
                className={`backdrop-blur-2xl rounded-2xl px-8 py-5 border text-center shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] ${isLight ? 'bg-white/60 border-emerald-500/20' : 'bg-black/40 border-emerald-400/20'}`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Valid Until</p>
                <p className={`text-2xl font-black tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] ${isLight ? 'text-emerald-900' : 'text-white'}`}>{new Date(activePromo.end_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section (When no active promo) */}
      {!activePromo && (
        <div 
          className="w-full py-16 shadow-lg backdrop-blur-sm mb-12 rounded-2xl border"
          style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md" style={{ color: 'inherit' }}>EcoTourVista Packages & Deals</h1>
            <p className="mt-2 text-sm sm:text-base max-w-2xl mx-auto font-medium" style={{ color: 'var(--muted)' }}>Discover the perfect package for your next adventure. Book today to lock in your reservation.</p>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {activePromo && (
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'inherit' }}>Featured Packages on Sale</h3>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>Select an eligible package below to claim your discount.</p>
          </div>
        )}
        
        {/* We use flex-wrap with justify-center to gracefully handle 4 on top, 3 centered on bottom */}
        <div className="flex flex-wrap justify-center gap-6">
          {packages.map((pkg) => {
            const { finalPrice, originalPrice, hasDiscount, promoDetails } = getPackagePrice(pkg);
            
            return (
              <div 
                key={pkg.id} 
                className={`w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 border group ${isLight ? 'shadow-md' : ''}`}
                style={{ 
                  background: isLight 
                    ? (hasDiscount ? 'rgba(236,253,245,0.6)' : 'rgba(255,255,255,0.7)')
                    : 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)', 
                  borderColor: pkg.package_type === 'UNLIMITED'
                    ? 'rgba(251,191,36,0.75)'
                    : isLight
                    ? (hasDiscount ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.1)')
                    : (hasDiscount ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'),
                  boxShadow: hasDiscount ? '0 10px 30px -10px rgba(16,185,129,0.3)' : (isLight ? '0 10px 30px -10px rgba(0,0,0,0.1)' : '0 10px 30px -10px rgba(0,0,0,0.5)'),
                  backdropFilter: 'blur(20px)'
                }}
              >
                
                <div 
                  className="relative h-52 w-full overflow-hidden bg-black/40 cursor-pointer"
                  onClick={() => setSelectedServiceForModal(pkg)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03130b] via-[#03130b]/40 to-transparent z-10 pointer-events-none opacity-90"></div>
                  <img 
                    src={pkg.image_url} 
                    alt={pkg.package_name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  {pkg.badge && !hasDiscount && (
                    <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-lg">
                      {pkg.badge}
                    </div>
                  )}
                  {hasDiscount && (
                    <div 
                      className="absolute top-4 right-4 z-20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black tracking-widest animate-pulse border shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      style={{ background: 'linear-gradient(45deg, #10b981, #059669)', borderColor: 'rgba(255,255,255,0.4)' }}
                    >
                      {pkg.badge || `${Math.round((1 - finalPrice / originalPrice) * 100)}% OFF`}
                    </div>
                  )}
                  
                  {/* Capacity Tag */}
                  <div 
                    className="absolute bottom-4 left-4 z-20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-lg flex items-center bg-black/50 text-white"
                  >
                    <svg className="w-3.5 h-3.5 mr-1 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    GOOD FOR {pkg.included_guests}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col relative z-20">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {pkg.package_type === 'UNLIMITED' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(90deg,#d97706,#f59e0b)' }}>♾️ UNLIMITED ACCESS</span>
                    )}
                    <StatusBadge status={pkg.availability_status} size="xs" />
                  </div>
                  {!isBookable(pkg.availability_status) && (
                    <p className="text-[11px] mb-2 font-semibold text-rose-400">
                      Unavailable today{pkg.unavailable_services?.length ? ` — ${pkg.unavailable_services.map(u => u.serviceName).join(', ')}` : ''}. Other dates may be open.
                    </p>
                  )}
                  {hasDiscount && promoDetails && (
                    <span className="text-[10px] font-black uppercase tracking-widest mb-2 block text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">
                      🔥 {promoDetails.promo_name}
                    </span>
                  )}
                  <h3 className={`text-xl font-black mb-2 leading-tight transition-colors duration-300 ${isLight ? 'text-gray-900 group-hover:text-emerald-700' : 'text-white group-hover:text-emerald-300'}`}>{pkg.package_name}</h3>
                  <p className={`text-sm mb-4 font-medium leading-relaxed ${isLight ? 'text-gray-600' : 'text-emerald-100/70'}`}>{pkg.description}</p>

                  {/* Included services */}
                  <div className="mb-6 flex-grow">
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {pkg.package_type === 'UNLIMITED' ? 'All services included' : "What's included"}
                    </span>
                    <ul className="space-y-1">
                      {(pkg.items || []).slice(0, 5).map((it) => (
                        <li key={it.service_id} className={`text-xs flex items-start gap-1.5 ${isLight ? 'text-gray-700' : 'text-emerald-50/90'}`}>
                          <span className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>✓</span>
                          <span>{it.service_name}{it.quantity > 1 ? ` × ${it.quantity}` : ''}</span>
                        </li>
                      ))}
                    </ul>
                    {(pkg.items || []).length > 5 && (
                      <span className={`text-[11px] font-bold mt-1 block ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>+ {pkg.items.length - 5} more services</span>
                    )}
                  </div>
                  
                  {/* Pricing */}
                  <div className={`mt-auto border-t pt-5 pb-6 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                    {hasDiscount ? (
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black line-through uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Regular: ₱{originalPrice.toLocaleString()}</span>
                        <div className="flex items-end mt-1">
                          <span className={`text-3xl font-black drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>₱{finalPrice.toLocaleString()}</span>
                        </div>
                        <span 
                          className={`text-[10px] font-black inline-block px-2.5 py-1 rounded-md w-max mt-2 uppercase tracking-widest border ${isLight ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}
                        >
                          YOU SAVE ₱{(originalPrice - finalPrice).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-end">
                        <span className={`text-3xl font-black drop-shadow-md ${isLight ? 'text-gray-900' : 'text-white'}`}>₱{finalPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => setSelectedServiceForModal(pkg)}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all duration-300 transform group-hover:scale-[1.02] ${
                      hasDiscount 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400' 
                        : (isLight ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 shadow-lg')
                    }`}
                  >
                    View Included Services
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual services are offered as optional add-ons to a package */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <ServicesCatalog compact />
      </div>

      <ServiceDetailsModal 
        isOpen={!!selectedServiceForModal}
        onClose={() => setSelectedServiceForModal(null)}
        service={selectedServiceForModal}
      />
    </div>
  );
};

export default PackagesDeals;
