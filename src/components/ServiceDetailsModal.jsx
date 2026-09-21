import React from 'react';
import { X, Check, Users, ShieldCheck } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';

export default function ServiceDetailsModal({ isOpen, onClose, service, onBookNow }) {
  const { theme } = useEcoTour();
  const isLight = theme === 'light';

  if (!isOpen || !service) return null;

  // Determine if this is a package (has included_guests) or a basic service (has capacity/description)
  const isPackage = !!service.included_guests || !!service.package_name;
  
  const title = isPackage ? service.package_name : (service.service_name || service.name);
  const image = isPackage ? service.image_url : (service.img || service.image_url || 'https://via.placeholder.com/600x400?text=Service');
  const description = service.description || 'Enjoy this fantastic service at Duangon Cold Spring Resort.';
  
  // Extract included items
  const items = isPackage ? (service.items || []) : [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="rounded-3xl max-w-lg w-full shadow-2xl relative my-8 overflow-hidden transition-all border"
        style={{
          background: isLight ? 'var(--bg-1, #ffffff)' : '#071f14',
          borderColor: 'var(--line)',
          color: 'var(--text)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md"
          style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image */}
        <div className="h-56 w-full relative bg-black/50">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
          
          <div className="absolute bottom-4 left-4 right-4">
            {service.badge && (
              <span className="inline-block px-2 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded mb-2">
                {service.badge}
              </span>
            )}
            <h3 className="text-2xl font-black text-white drop-shadow-md">{title}</h3>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--muted)' }}>
            {description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl border" style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', borderColor: 'var(--line)' }}>
              <span className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--muted)' }}>Price</span>
              <strong className="text-lg font-black font-mono text-emerald-500">
                ₱{parseFloat(service.regular_value || service.price || 0).toLocaleString()}
              </strong>
            </div>
            
            <div className="p-3 rounded-2xl border" style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', borderColor: 'var(--line)' }}>
              <span className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--muted)' }}>Capacity</span>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>{isPackage ? `${service.included_guests} Guests` : (service.capacity || 'N/A')}</span>
              </div>
            </div>
          </div>

          {/* Inclusions List for Packages */}
          {items.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                <ShieldCheck className="w-4 h-4" /> Package Inclusions:
              </h4>
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong style={{ color: 'var(--text)' }}>{item.quantity}x</strong> {item.service_name || item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onBookNow && (
            <button
              onClick={() => {
                onClose();
                onBookNow(service);
              }}
              className="w-full py-3.5 mt-4 rounded-xl font-black text-xs uppercase tracking-widest text-center cursor-pointer shadow-lg transition-all"
              style={{ background: 'var(--accent)', color: '#04170e' }}
            >
              Book This Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
