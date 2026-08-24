import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import { useEcoTour } from "../context/EcoTourContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="auth-page-login min-h-screen flex items-center justify-center p-6 relative">
      <div 
        className="auth-background absolute inset-0 bg-cover bg-center opacity-10" 
        style={{ backgroundImage: `url(${currentBg})` }} 
      />

      <button 
        onClick={() => navigate("/login")} 
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 rounded-full text-xs font-bold hover:bg-emerald-900/80 transition-all cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Back to Login</span>
      </button>

      <div className="w-full max-w-md bg-[#07150e]/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <p className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold mb-1">PASSWORD RECOVERY</p>
        <h1 className="text-2xl font-black text-white mb-2">Forgot Your Password?</h1>
        
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Reset Link Sent!</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Enter the email address associated with your account, and we will send you instructions to reset your password.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">EMAIL ADDRESS</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-emerald-400" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="w-full bg-slate-900/80 border border-emerald-900/60 pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
            >
              {loading ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Send size={14} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-2">
              Remembered your password?{" "}
              <button 
                type="button" 
                onClick={() => navigate("/login")} 
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
