import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Leaf, ArrowLeft } from "lucide-react";
import "./Auth.css";
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import { useEcoTour } from "../context/EcoTourContext";

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;

        case "staff":
          navigate("/staff/dashboard");
          break;

        case "client":
          if (data.user.status === "approved") {
            navigate("/home");
          } else {
            setError("Your account is waiting for admin approval.");
          }
          break;

        default:
          setError("Invalid user role.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-login">
      <div className="auth-background" style={{ backgroundImage: `url(${currentBg})` }} />

      <button onClick={() => navigate("/")} className="back-to-home-btn">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="auth-container-login">
        <div className="auth-welcome">
          <p className="welcome-subtitle">WELCOME BACK</p>
          <h1 className="welcome-title">
            ESCAPE. RELAX. <span className="highlight">REFRESH.</span>
          </h1>
          <p className="welcome-text">
            Sign in to continue your serene getaway at Cold Spring Resort.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-form-side">
            <div className="form-header">
              <h2>SIGN IN</h2>
              <p>Welcome back! Please enter your details.</p>
              <div className="divider">
                <Leaf size={12} />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="text"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>PASSWORD</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    disabled={loading}
                  />
                  <span className="checkmark" />
                  <span>Remember me</span>
                </label>
                <button type="button" onClick={() => navigate("/forgot-password")} className="forgot-link">Forgot Password?</button>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>LOG IN</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="divider-text">
                <span>OR</span>
              </div>



              <p className="switch-text">
                Don't have an account?{" "}
                <button type="button" onClick={() => navigate("/signup")} className="switch-link" disabled={loading}>
                  Sign up
                </button>
              </p>
            </form>
          </div>

          <div className="auth-image-side">
            <img src={currentBg} alt="Cold Spring Resort" />
            <div className="image-overlay" />
            <div className="image-tagline">
              <Leaf size={16} />
              <span>Nature's peace. Your perfect escape.</span>
            </div>
          </div>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">💧</div>
            <h3>NATURAL SPRINGS</h3>
            <p>Crystal clear and refreshing waters.</p>
          </div>
          <div className="feature-divider" />
          <div className="feature-item">
            <div className="feature-icon"></div>
            <h3>RELAXING SPACES</h3>
            <p>Comfortable cottages and amenities.</p>
          </div>
          <div className="feature-divider" />
          <div className="feature-item">
            <div className="feature-icon">🌲</div>
            <h3>MEMORABLE EXPERIENCE</h3>
            <p>Perfect for family, friends, and events.</p>
          </div>
        </div>

        <p className="copyright">© 2024 Cold Spring Resort. All rights reserved.</p>
      </div>
    </div>
  );
}