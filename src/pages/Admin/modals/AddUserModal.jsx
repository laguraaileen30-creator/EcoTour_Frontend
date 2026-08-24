import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Leaf, RefreshCw, UserPlus, CheckCircle } from 'lucide-react';

export default function AddUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    role: 'client',
    clientNumber: '',
    firstname: '',
    middlename: '',
    lastname: '',
    gender: 'Male',
    contactnumber: '',
    email: '',
    address: '',
    status: 'Pending',
    agreeTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-generate Client/Staff/Admin Number from MySQL sequence
  const generateClientNumber = async (roleType) => {
    const r = (roleType || 'client').toLowerCase();
    const prefix = r === 'staff' ? 'STF' : r === 'admin' ? 'ADM' : 'CLT';
    const year = new Date().getFullYear();

    try {
      const res = await fetch('http://localhost:5000/api/v1/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const count = data.users.filter(u => (u.role || '').toLowerCase() === r).length + 1;
        return `${prefix}-${year}-${String(count).padStart(6, '0')}`;
      }
    } catch (e) {}
    return `${prefix}-${year}-000015`;
  };

  // Calculate Auto-Generated Password: lastname + firstname (lowercase)
  const generatedPassword = (
    (formData.lastname || '').trim() + (formData.firstname || '').trim()
  ).toLowerCase();

  // Handle Role Change
  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    const newNo = await generateClientNumber(newRole);
    setFormData(prev => ({
      ...prev,
      role: newRole,
      clientNumber: newNo,
    }));
  };

  // Reset Form when Modal opens
  useEffect(() => {
    if (isOpen) {
      generateClientNumber('client').then(newNo => {
        setFormData({
          role: 'client',
          clientNumber: newNo,
          firstname: '',
          middlename: '',
          lastname: '',
          gender: 'Male',
          contactnumber: '',
          email: '',
          address: '',
          status: 'Pending',
          agreeTerms: false,
        });
      });
      setIsSubmitting(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (typeof val === 'string') {
      if (name === 'firstname' || name === 'middlename' || name === 'lastname') {
        val = val.replace(/[^a-zA-Z\s'-]/g, '');
      } else if (name === 'contactnumber') {
        val = val.replace(/\D/g, '');
      } else if (name === 'email') {
        val = val.toLowerCase();
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.agreeTerms) {
      setErrorMessage("Please confirm that the details provided are correct.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      user_number: formData.clientNumber,
      client_no: formData.clientNumber,
      fname: formData.firstname.trim(),
      mname: formData.middlename.trim(),
      lname: formData.lastname.trim(),
      contact_no: formData.contactnumber.trim(),
      address: formData.address.trim(),
      gender: formData.gender,
      role: formData.role,
      email: formData.email.trim(),
      password: generatedPassword || `${formData.lastname.toLowerCase()}${formData.firstname.toLowerCase()}`,
      status: formData.status,
    };

    try {
      let response;
      try {
        response = await fetch("http://localhost:5000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e1) {
        // Fallback to /api/v1/users endpoint
        response = await fetch("http://localhost:5000/api/v1/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok && (data.success || data.user_number)) {
        setSuccessMessage("User account registered successfully!");
        setTimeout(() => {
          if (onUserCreated) onUserCreated(data);
          onClose();
        }, 700);
      } else {
        setErrorMessage(data.message || "Registration failed. Email might already be registered.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage("Unable to connect to backend server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-[#0a1c15] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all disabled:opacity-60";
  const labelClass = "block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="etv-user-modal-card bg-[#051c14] border border-emerald-800/60 rounded-3xl w-full max-w-xl shadow-2xl shadow-emerald-950/80 overflow-hidden my-6 animate-in fade-in zoom-in duration-200 text-white">

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-2 text-center relative border-b border-emerald-900/40 bg-[#041710]">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-emerald-900/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white uppercase">
            PERSONAL PROFILING REGISTRATION
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Standardized form with auto-generated ID & default password
          </p>

          <div className="flex items-center justify-center my-3 gap-3">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-700/60 to-transparent w-24"></div>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-700/60 to-transparent w-24"></div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/90 border border-rose-700/60 rounded-xl text-rose-200 text-xs font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> {successMessage}
            </div>
          )}

          {/* ROW 1: ROLE TYPE & AUTO-GENERATED ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className={labelClass}>
                ROLE TYPE <span className="text-emerald-400">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                disabled={isSubmitting}
                className={inputClass}
                required
              >
                <option value="client">Client / Tourist</option>
                <option value="staff">Staff Member</option>
              </select>
            </div>

            <div>
              <label htmlFor="clientNumber" className={labelClass}>
                AUTO-GENERATED ID NUMBER
              </label>
              <input
                type="text"
                id="clientNumber"
                name="clientNumber"
                value={formData.clientNumber}
                readOnly
                className={`${inputClass} bg-[#04150e] text-emerald-400 font-mono font-bold border-emerald-900/60 cursor-not-allowed`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                System generated code ({formData.role === 'staff' ? 'Staff' : formData.role === 'admin' ? 'Admin' : 'Client'})
              </p>
            </div>
          </div>

          {/* ROW 2: NAMES (FIRST, MIDDLE, LAST) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="firstname" className={labelClass}>
                FIRST NAME <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Juan"
                  required
                  disabled={isSubmitting}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="middlename" className={labelClass}>
                MIDDLE NAME
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                <input
                  type="text"
                  id="middlename"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleChange}
                  placeholder="Dela"
                  disabled={isSubmitting}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastname" className={labelClass}>
                LAST NAME <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Cruz"
                  required
                  disabled={isSubmitting}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* ROW 3: GENDER & CONTACT NUMBER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className={labelClass}>
                GENDER <span className="text-emerald-400">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="contactnumber" className={labelClass}>
                CONTACT NUMBER <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                <input
                  type="tel"
                  id="contactnumber"
                  name="contactnumber"
                  value={formData.contactnumber}
                  onChange={handleChange}
                  placeholder="09123456789"
                  required
                  disabled={isSubmitting}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* ROW 4: EMAIL ADDRESS */}
          <div>
            <label htmlFor="email" className={labelClass}>
              EMAIL ADDRESS <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan.cruz@email.com"
                required
                disabled={isSubmitting}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* ROW 5: COMPLETE ADDRESS */}
          <div>
            <label htmlFor="address" className={labelClass}>
              COMPLETE ADDRESS <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Street, Barangay, City, Province"
                required
                disabled={isSubmitting}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* ACCOUNT APPROVAL PROCESS NOTE */}
          <div className="p-3 bg-[#07241a] border border-emerald-800/50 rounded-xl text-xs space-y-1">
            <span className="font-semibold text-emerald-300">💡 Account Application Process:</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              No password required during profiling. Upon Administrator review and approval, a default password (<code className="text-emerald-400">firstname+middlename+lastname+123</code>) will be auto-generated and sent directly to the registered email address.
            </p>
          </div>

          {/* ACCOUNT INITIAL STATUS PREVIEW BOX */}
          <div className="p-3 bg-[#07241a] border border-emerald-800/50 rounded-xl flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-200">Account Initial Status:</span>
            <div className="flex items-center gap-2">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-[#04150e] border border-amber-500/40 text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider outline-none cursor-pointer"
              >
                <option value="Pending" className="bg-[#051c14] text-amber-300">PENDING APPROVAL</option>
                <option value="Approved" className="bg-[#051c14] text-emerald-300">APPROVED</option>
              </select>
            </div>
          </div>

          {/* CONFIRMATION CHECKBOX */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 text-xs leading-relaxed select-none">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="mt-0.5 rounded border-emerald-800 bg-[#0a1c15] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>
                I confirm that the details provided are correct and understand that my account requires admin approval.
              </span>
            </label>
          </div>

          {/* FOOTER ACTIONS INSIDE FORM TO GUARANTEE SUBMIT */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-emerald-900/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  SUBMIT PERSONAL PROFILING
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}