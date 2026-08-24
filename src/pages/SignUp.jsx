import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, ArrowRight, Leaf, CheckCircle, ArrowLeft } from "lucide-react";
import "./Auth.css";
import homeImage from "../assets/home.png";
import lightImage from "../assets/light.png";
import { useEcoTour } from "../context/EcoTourContext";

export default function Signup() {
  const navigate = useNavigate();
  const { theme } = useEcoTour();
  const currentBg = theme === "light" ? lightImage : homeImage;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignedNo, setAssignedNo] = useState(`CLT-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const [formData, setFormData] = useState({
    role: "client",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "Male",
    email: "",
    contactNumber: "",
    address: "",
    agreeTerms: false,
  });

  const generatedPassword = (formData.lastName.trim() + formData.firstName.trim()).toLowerCase();

  const handleRoleChange = (newRole) => {
    const prefix = newRole === "staff" ? "STF" : "CLT";
    const newNo = `${prefix}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setAssignedNo(newNo);
    setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        client_no: assignedNo,
        fname: formData.firstName,
        mname: formData.middleName,
        lname: formData.lastName,
        contact_no: formData.contactNumber,
        address: formData.address,
        gender: formData.gender,
        role: formData.role,
        email: formData.email,
        password: generatedPassword || `${formData.lastName.toLowerCase()}${formData.firstName.toLowerCase()}`,
        status: "pending",
      };

      let response;
      try {
        response = await fetch("http://localhost:5000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e1) {
        response = await fetch("http://localhost:3001/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (data.success || response.ok) {
        setIsSubmitted(true);
      } else {
        alert(data.message || "Registration failed. Email might already be registered.");
      }
    } catch (err) {
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page-login">
        <div className="auth-background" style={{ backgroundImage: `url(${currentBg})` }} />

        <button onClick={() => navigate("/")} className="back-to-home-btn">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        <div className="auth-container-login">
          <div className="success-card">
            <CheckCircle size={64} className="success-icon" />
            <h2>Registration Submitted!</h2>
            <p>Assigned ID: <strong style={{ color: '#059669' }}>{assignedNo}</strong></p>
            <p>Account Status: <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>PENDING ADMIN APPROVAL</span></p>
            <p className="success-note" style={{ marginTop: '12px' }}>
              📧 <strong>What happens next?</strong>
              <br />
              Your application is under review by the Administrator. Once approved, your default password will be auto-generated <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>firstname+middlename+lastname+123</code> and sent directly to your email address: <strong>{formData.email}</strong>.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="submit-btn"
              style={{ maxWidth: "300px", margin: "20px auto 0" }}
            >
              <span>RETURN TO LOGIN</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-login">
      <div className="auth-background" style={{ backgroundImage: `url(${currentBg})` }} />

      <button onClick={() => navigate("/")} className="back-to-home-btn">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="auth-container-login">
        <div className="auth-welcome">
          <p className="welcome-subtitle">JOIN OUR COMMUNITY</p>
          <h1 className="welcome-title">
            CREATE YOUR <span className="highlight">ACCOUNT</span>
          </h1>
          <p className="welcome-text">
            Fill out the profiling form below. All new Client & Staff accounts require Admin approval.
          </p>
        </div>

        <div className="auth-card auth-card-wide">
          <div className="auth-form-side">
            <div className="form-header">
              <h2>PERSONAL PROFILING REGISTRATION</h2>
              <p>Standardized form with auto-generated ID & default password</p>
              <div className="divider"><Leaf size={12} /></div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">

              {/* ROW 1: ACCOUNT TYPE SELECTOR & AUTO-GENERATED ID (STAFF CODE / CLIENT ID) */}
              <div className="form-row form-row-2col">
                <div className="form-group form-group-standard">
                  <label>ACCOUNT TYPE *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl text-xs font-bold text-emerald-300 outline-none focus:border-emerald-400"
                    disabled={loading}
                  >
                    <option value="client">Client / Tourist</option>
                    <option value="staff">Resort Staff</option>
                  </select>
                  <small className="input-hint">Select whether registering as a Client or Staff</small>
                </div>

                <div className="form-group form-group-standard">
                  <label>{formData.role === 'staff' ? 'AUTO-GENERATED STAFF CODE' : 'AUTO-GENERATED CLIENT ID'}</label>
                  <input
                    type="text"
                    value={assignedNo}
                    readOnly
                    className="w-full bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-mono font-bold text-emerald-800"
                  />
                  <small className="input-hint">
                    {formData.role === 'staff' ? 'Official Staff ID code (STF-2026-XXXXXX)' : 'System generated Client ID'}
                  </small>
                </div>
              </div>

              {/* FIRST NAME */}
              <div className="form-group form-group-full">
                <label>FIRST NAME *</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Enter your First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* MIDDLE NAME */}
              <div className="form-group form-group-full">
                <label>MIDDLE NAME</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Enter your Middle Name"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* LAST NAME */}
              <div className="form-group form-group-full">
                <label>LAST NAME *</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Enter your Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* ROW 3: GENDER DROPDOWN & CONTACT NO */}
              <div className="form-row form-row-2col">
                <div className="form-group form-group-standard">
                  <label>GENDER *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-medium text-slate-800"
                    disabled={loading}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group form-group-standard">
                  <label>CONTACT NUMBER *</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input
                      type="tel"
                      placeholder="09123456789"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/\D/g, "") })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* ROW 4: EMAIL ADDRESS */}
              <div className="form-row">
                <div className="form-group form-group-full">
                  <label>EMAIL ADDRESS *</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* ROW 5: COMPLETE ADDRESS */}
              <div className="form-row">
                <div className="form-group form-group-full">
                  <label>COMPLETE ADDRESS *</label>
                  <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                      type="text"
                      placeholder="House/Street, Barangay, City, Province"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* AUTO-GENERATED PASSWORD PREVIEW BOX */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-900">Auto-Generated Password:</span>
                  <code className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                    {generatedPassword || "lastnamefirstname"}
                  </code>
                </div>
                <p className="text-[11px] text-blue-700">
                  Standard rule: <code>lastname + firstname</code> (lowercase). Will be used for your initial login.
                </p>
              </div>

              {/* ACCOUNT STATUS PREVIEW */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-900">Account Initial Status:</span>
                <span className="bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                  PENDING APPROVAL
                </span>
              </div>

              {/* TERMS CHECKBOX */}
              <div className="form-group">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    required
                    disabled={loading}
                  />
                  <span className="checkmark" />
                  <span>
                    I confirm that the details provided are correct and understand that my account requires admin approval.
                  </span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span>Submitting Profiling Request...</span>
                ) : (
                  <>
                    <span>SUBMIT ACCOUNT PROFILING</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="switch-text">
                Already have an approved account?{" "}
                <button type="button" onClick={() => navigate("/login")} className="switch-link" disabled={loading}>
                  Log in here
                </button>
              </p>
            </form>
          </div>

          <div className="auth-image-side">
            <img src={currentBg} alt="Cold Spring Resort" />
            <div className="image-overlay" />
            <div className="image-tagline">
              <Leaf size={16} />
              <span>Your journey to nature begins with a single step.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}