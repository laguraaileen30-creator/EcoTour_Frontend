import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Home, LogIn } from "lucide-react";
import homeImage from "../assets/home.png";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10" 
        style={{ backgroundImage: `url(${homeImage})` }} 
      />

      <div className="w-full max-w-md bg-[#07150e]/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-amber-400" />
        </div>

        <p className="text-xs uppercase tracking-widest text-amber-400 font-extrabold mb-1">ACCOUNT STATUS</p>
        <h1 className="text-2xl font-black text-white mb-2">Pending Admin Approval</h1>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Your account profiling form has been submitted successfully. Please wait while an administrator reviews and approves your account access.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn size={16} />
            <span>Login with Another Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
