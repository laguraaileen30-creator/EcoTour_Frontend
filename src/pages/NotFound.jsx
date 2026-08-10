import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import homeImage from "../assets/home.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10" 
        style={{ backgroundImage: `url(${homeImage})` }} 
      />

      <div className="w-full max-w-md bg-[#07150e]/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Compass size={32} className="text-emerald-400" />
        </div>

        <p className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold mb-1">404 ERROR</p>
        <h1 className="text-3xl font-black text-white mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Oops! The page you are trying to access does not exist or has been moved.
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
        >
          <Home size={16} />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
}
