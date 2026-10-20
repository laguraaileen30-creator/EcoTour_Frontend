import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck, FileWarning, Search, Send, X, Check, Calendar,
  User, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Filter,
  ChevronRight, Info, ShieldAlert, ArrowLeft, RefreshCw, Hash,
  DollarSign, Wrench, CheckSquare, Clock, Eye
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson } from '../../../utils/catalog';
import './InspectionsTab.css';

const bookingIdOf = (booking) => booking?.id ?? booking?.booking_id ?? booking?.reservation_id;

const bookingNumberOf = (booking) =>
  String(booking?.bookingNumber || booking?.booking_number || booking?.bookingRef || booking?.booking_ref || `BK-${bookingIdOf(booking)}`);

const clientNameOf = (booking) =>
  String(booking?.clientName || booking?.client_name || booking?.fullName || booking?.touristName || booking?.tourist_name || 'Guest');

const dateOf = (booking) =>
  String(booking?.bookingDate || booking?.booking_date || booking?.reservationDate || booking?.reservation_date || booking?.checkIn || booking?.check_in || 'N/A');

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/);
  if (!parts.length || !parts[0]) return 'G';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const InspectionsTab = () => {
  const { resortBookings = [], showAlert, refreshAllLiveData, theme } = useEcoTour();
  const [activeSection, setActiveSection] = useState('bookings'); // 'bookings' | 'damages' | 'inspections'
  const [activeView, setActiveView] = useState('list'); // 'list', 'new_inspection', 'new_damage'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [damageSearchQuery, setDamageSearchQuery] = useState('');
  const [damageStatusFilter, setDamageStatusFilter] = useState('ALL');

  const [inspectionSearchQuery, setInspectionSearchQuery] = useState('');
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState('ALL');

  // Evidence Preview Modal
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState(null);

  // Live Database Records Synced with Admin
  const [damageReports, setDamageReports] = useState([]);
  const [inspectionsHistory, setInspectionsHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchDatabaseRecords = async () => {
    setLoadingData(true);
    try {
      const dmgRes = await apiJson('/damages', { auth: true });
      const rawDmg = dmgRes.reports || dmgRes.data?.reports || (Array.isArray(dmgRes.data) ? dmgRes.data : []);
      setDamageReports(rawDmg);
    } catch (e) {
      console.warn("Could not load damages list:", e);
    }

    try {
      const insRes = await apiJson('/inspections', { auth: true });
      const rawIns = insRes.inspections || insRes.data?.inspections || (Array.isArray(insRes.data) ? insRes.data : []);
      setInspectionsHistory(rawIns);
    } catch (e) {
      console.warn("Could not load inspections list:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDatabaseRecords();
  }, []);

  // Inspection Form State
  const [inspectionType, setInspectionType] = useState('Pre-Checkin');
  const [overallStatus, setOverallStatus] = useState('Clear');
  const [remarks, setRemarks] = useState('');

  // Damage Form State
  const [damageReport, setDamageReport] = useState({
    item_name: '',
    damage_type: '',
    description: '',
    recommended_fee: 0,
    evidence_url: ''
  });

  const selectedBookingId = bookingIdOf(selectedBooking);

  // Quick inspection checklist tags that staff can click to append to remarks
  const quickTags = [
    'All Linens & Bedding Intact',
    'Aircon & Appliances Functional',
    'Restroom Clean & Plumbing Checked',
    'Keys & Amenity Cards Returned',
    'No Missing Assets',
    'Minor Wear and Tear Noted'
  ];

  const handleAddQuickTag = (tag) => {
    setRemarks((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return tag;
      if (cleanPrev.includes(tag)) return prev;
      return `${cleanPrev}, ${tag}`;
    });
  };

  const handleCreateInspection = async () => {
    const bookingId = bookingIdOf(selectedBooking);
    if (!bookingId) {
      setSubmitError('Select a valid booking before saving an inspection.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await apiJson('/inspections', {
        method: 'POST',
        auth: true,
        body: {
          booking_id: bookingId,
          type: inspectionType,
          status: overallStatus === 'Damaged' ? 'Damage Found' : 'Clear',
          items: [{ item_name: 'General Inspection', condition: overallStatus, notes: remarks }]
        }
      });
      if (showAlert) {
        showAlert({
          title: 'Inspection Recorded',
          message: `Inspection for ${bookingNumberOf(selectedBooking)} (${clientNameOf(selectedBooking)}) saved to database.`,
          type: 'success'
        });
      }
      setActiveView('list');
      setActiveSection('inspections');
      setRemarks('');
      await fetchDatabaseRecords();
      if (refreshAllLiveData) refreshAllLiveData();
    } catch (err) {
      setSubmitError(err.message || 'Unable to save the inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportDamage = async () => {
    const bookingId = bookingIdOf(selectedBooking);
    if (!bookingId) {
      setSubmitError('Select a valid booking before reporting damage.');
      return;
    }
    if (!damageReport.item_name.trim() || !damageReport.damage_type.trim()) {
      setSubmitError('Enter the damaged item and the type of damage.');
      return;
    }
    const recommendedFee = Number(damageReport.recommended_fee);
    if (!Number.isFinite(recommendedFee) || recommendedFee < 0) {
      setSubmitError('Enter a valid, non-negative recommended fee.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await apiJson('/damages', {
        method: 'POST',
        auth: true,
        body: {
          booking_id: bookingId,
          item_name: damageReport.item_name.trim(),
          damage_type: damageReport.damage_type.trim(),
          description: damageReport.description.trim(),
          recommended_fee: recommendedFee,
          evidence_url: damageReport.evidence_url.trim()
        }
      });

      if (showAlert) {
        showAlert({
          title: 'Damage Reported',
          message: `Damage report for "${damageReport.item_name}" submitted to Admin for approval.`,
          type: 'success'
        });
      }

      setActiveView('list');
      setActiveSection('damages');
      setDamageReport({ item_name: '', damage_type: '', description: '', recommended_fee: 0, evidence_url: '' });
      await fetchDatabaseRecords();
      if (refreshAllLiveData) refreshAllLiveData();
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit the damage report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSelect = (booking) => {
    const id = bookingIdOf(booking);
    if (selectedBookingId === id) {
      setSelectedBooking(null);
    } else {
      setSelectedBooking(booking);
      setSubmitError('');
    }
  };

  // Filtered Bookings List
  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (resortBookings || []).filter((b) => {
      const bNum = bookingNumberOf(b).toLowerCase();
      const cName = clientNameOf(b).toLowerCase();
      const bStatus = (b.status || 'Pending').toLowerCase();

      const matchesQuery = !q || bNum.includes(q) || cName.includes(q);

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        const filterLower = statusFilter.toLowerCase();
        matchesStatus = bStatus.includes(filterLower);
      }

      return matchesQuery && matchesStatus;
    });
  }, [resortBookings, searchQuery, statusFilter]);

  // Filtered Damages List
  const filteredDamages = useMemo(() => {
    const q = damageSearchQuery.toLowerCase().trim();
    return (damageReports || []).filter((r) => {
      const bNum = String(r.booking_number || `BK-${r.booking_id}`).toLowerCase();
      const cName = String(r.client_name || '').toLowerCase();
      const item = String(r.item_name || '').toLowerCase();
      const dtype = String(r.damage_type || '').toLowerCase();
      const staff = String(r.staff_fname || '').toLowerCase();

      const matchesSearch = !q || bNum.includes(q) || cName.includes(q) || item.includes(q) || dtype.includes(q) || staff.includes(q);

      let matchesStatus = true;
      if (damageStatusFilter !== 'ALL') {
        matchesStatus = (r.status || '').toLowerCase() === damageStatusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [damageReports, damageSearchQuery, damageStatusFilter]);

  // Filtered Inspections List
  const filteredInspections = useMemo(() => {
    const q = inspectionSearchQuery.toLowerCase().trim();
    return (inspectionsHistory || []).filter((ins) => {
      const bNum = String(ins.booking_number || `BK-${ins.booking_id}`).toLowerCase();
      const cName = String(ins.client_name || '').toLowerCase();
      const type = String(ins.type || '').toLowerCase();
      const status = String(ins.status || '').toLowerCase();
      const staff = String(`${ins.fname || ''} ${ins.lname || ''}`).toLowerCase();

      const matchesSearch = !q || bNum.includes(q) || cName.includes(q) || type.includes(q) || status.includes(q) || staff.includes(q);

      let matchesStatus = true;
      if (inspectionStatusFilter !== 'ALL') {
        const f = inspectionStatusFilter.toLowerCase();
        matchesStatus = status.includes(f) || type.includes(f);
      }

      return matchesSearch && matchesStatus;
    });
  }, [inspectionsHistory, inspectionSearchQuery, inspectionStatusFilter]);

  // Damage stats
  const pendingDamagesCount = useMemo(() => (damageReports || []).filter((d) => d.status === 'Pending').length, [damageReports]);
  const approvedDamagesCount = useMemo(() => (damageReports || []).filter((d) => d.status === 'Approved').length, [damageReports]);
  const totalDamageFees = useMemo(
    () => (damageReports || []).filter((d) => d.status === 'Approved').reduce((acc, r) => acc + (parseFloat(r.final_fee || r.recommended_fee) || 0), 0),
    [damageReports]
  );

  // Determine pill status class for bookings
  const getStatusClass = (statusStr = '') => {
    const s = String(statusStr).toLowerCase();
    if (s.includes('pending')) return 'status-pending';
    if (s.includes('confirm') || s.includes('paid') || s.includes('active') || s.includes('checkin') || s.includes('checked in')) return 'status-confirmed';
    if (s.includes('completed') || s.includes('checkout') || s.includes('checked out') || s.includes('done')) return 'status-completed';
    if (s.includes('cancel') || s.includes('void') || s.includes('damag')) return 'status-cancelled';
    return 'status-pending';
  };

  // Determine pill status class for damage reports
  const getDamageStatusClass = (statusStr = '') => {
    const s = String(statusStr).toLowerCase();
    if (s.includes('pending')) return 'status-pending';
    if (s.includes('approv') || s.includes('clear')) return 'status-confirmed';
    if (s.includes('waiv')) return 'status-completed';
    if (s.includes('reject') || s.includes('damag')) return 'status-cancelled';
    return 'status-pending';
  };

  return (
    <div className="inspections-tab">
      <div className="inspect-card">
        {/* HEADER SECTION */}
        <div className="inspect-header">
          <div className="inspect-title-group">
            <div className="inspect-icon-chip">
              <ClipboardCheck size={22} />
            </div>
            <div className="inspect-title-text">
              <h3>
                Inspections &amp; Damage
                {pendingDamagesCount > 0 && (
                  <span
                    className="inspect-form-booking-badge"
                    style={{ fontSize: 11, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.35)' }}
                  >
                    {pendingDamagesCount} Damage Pending Admin
                  </span>
                )}
              </h3>
              <p>Inspect guest facilities, log asset conditions, and file damage compensation claims with automatic Admin sync.</p>
            </div>
          </div>

          <div className="inspect-header-actions">
            <button
              className="inspect-action-btn btn-inspect-ghost"
              onClick={() => fetchDatabaseRecords()}
              disabled={loadingData}
              title="Sync live records from database"
            >
              <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} />
              <span>{loadingData ? 'Syncing…' : 'Sync Live'}</span>
            </button>
            <button
              className="inspect-action-btn btn-inspect-primary"
              onClick={() => {
                setActiveSection('bookings');
                setActiveView('new_inspection');
              }}
              disabled={!selectedBooking}
              title={selectedBooking ? 'Record a facility inspection for the selected booking' : 'Select a booking below first'}
            >
              <ClipboardCheck size={16} /> + New Inspection
            </button>
            <button
              className="inspect-action-btn btn-inspect-danger"
              onClick={() => {
                setActiveSection('bookings');
                setActiveView('new_damage');
              }}
              disabled={!selectedBooking}
              title={selectedBooking ? 'File a damage report for the selected booking' : 'Select a booking below first'}
            >
              <FileWarning size={16} /> Report Damage
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="inspect-tabs-nav">
          <button
            className={`inspect-tab-nav-btn ${activeSection === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('bookings');
              setActiveView('list');
            }}
          >
            <ClipboardCheck size={15} />
            <span>Bookings &amp; New Report</span>
            <span className="badge">{filteredBookings.length}</span>
          </button>

          <button
            className={`inspect-tab-nav-btn ${activeSection === 'damages' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('damages');
              setActiveView('list');
            }}
          >
            <FileWarning size={15} />
            <span>Reported Damages Log</span>
            <span className="badge">{damageReports.length}</span>
            {pendingDamagesCount > 0 && (
              <span className="badge-pending" title={`${pendingDamagesCount} awaiting Admin review`}>
                {pendingDamagesCount} Pending
              </span>
            )}
          </button>

          <button
            className={`inspect-tab-nav-btn ${activeSection === 'inspections' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('inspections');
              setActiveView('list');
            }}
          >
            <CheckSquare size={15} />
            <span>Facility Inspection Logs</span>
            <span className="badge">{inspectionsHistory.length}</span>
          </button>
        </div>

        {/* ERROR ALERT BANNER */}
        {submitError && (
          <div className="inspect-alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{submitError}</span>
            <button
              onClick={() => setSubmitError('')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* PHOTO EVIDENCE PREVIEW MODAL */}
        {previewEvidenceUrl && (
          <div className="inspect-modal-overlay" onClick={() => setPreviewEvidenceUrl(null)}>
            <div className="inspect-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="inspect-modal-header">
                <h4>
                  <Eye size={16} style={{ color: '#38bdf8' }} /> Photo Evidence
                </h4>
                <button
                  onClick={() => setPreviewEvidenceUrl(null)}
                  style={{ background: 'none', border: 'none', color: '#9fbfad', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: 20, textAlign: 'center' }}>
                <img
                  src={previewEvidenceUrl}
                  alt="Damage Evidence"
                  style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: 12, objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: BOOKINGS & CREATE INSPECTION / DAMAGE
           ========================================================================= */}
        {activeSection === 'bookings' && (
          <>
            {/* SELECTED BOOKING SHOWCASE BANNER */}
            {selectedBooking && activeView === 'list' && (
              <div className="inspect-selected-banner">
                <div className="inspect-selected-meta">
                  <span className="inspect-selected-tag">
                    <CheckCircle2 size={13} /> Selected Booking
                  </span>
                  <div className="inspect-selected-info">
                    <span className="inspect-selected-ref">{bookingNumberOf(selectedBooking)}</span>
                    <span>•</span>
                    <span className="inspect-selected-name">{clientNameOf(selectedBooking)}</span>
                    <span>•</span>
                    <span className={`inspect-status-pill ${getStatusClass(selectedBooking.status)}`}>
                      <span className="dot" /> {selectedBooking.status || 'Pending'}
                    </span>
                    <span>•</span>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>{dateOf(selectedBooking)}</span>
                  </div>
                </div>

                <div className="inspect-selected-actions">
                  <button
                    className="inspect-action-btn btn-inspect-primary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={() => setActiveView('new_inspection')}
                  >
                    <ClipboardCheck size={14} /> Start Inspection
                  </button>
                  <button
                    className="inspect-action-btn btn-inspect-danger"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={() => setActiveView('new_damage')}
                  >
                    <FileWarning size={14} /> Report Damage
                  </button>
                  <button className="inspect-deselect-btn" onClick={() => setSelectedBooking(null)}>
                    <X size={13} /> Deselect
                  </button>
                </div>
              </div>
            )}

            {!selectedBooking && activeView === 'list' && (
              <div className="inspect-guide-bar">
                <Info size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
                <span>Click <strong>"Select"</strong> on any booking in the table below to start an inspection or file a damage report.</span>
              </div>
            )}

            {/* VIEW 1: BOOKINGS LIST & TABLE */}
            {activeView === 'list' && (
              <>
                {/* CONTROLS: SEARCH & FILTER */}
                <div className="inspect-controls">
                  <div className="inspect-search-wrap">
                    <Search size={16} className="inspect-search-icon" />
                    <input
                      type="text"
                      placeholder="Search booking number or client name to select..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="inspect-search-input"
                    />
                    {searchQuery && (
                      <button className="inspect-clear-search" onClick={() => setSearchQuery('')} title="Clear search">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="inspect-filter-group">
                    {[
                      { key: 'ALL', label: 'All Bookings' },
                      { key: 'Pending', label: 'Pending' },
                      { key: 'Confirmed', label: 'Confirmed' },
                      { key: 'Checked', label: 'Checked In' },
                      { key: 'Completed', label: 'Completed' }
                    ].map((f) => (
                      <button
                        key={f.key}
                        className={`inspect-filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                        onClick={() => setStatusFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="inspect-table-wrap">
                  <table className="inspect-table">
                    <thead>
                      <tr>
                        <th>Booking No.</th>
                        <th>Client Name</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="inspect-empty-state">
                              <div className="inspect-empty-icon">
                                <Search size={24} />
                              </div>
                              <h4>No matching bookings found</h4>
                              <p>Try refining your search keyword or selecting a different status filter.</p>
                              {searchQuery && (
                                <button
                                  className="inspect-action-btn btn-inspect-ghost"
                                  style={{ marginTop: 8 }}
                                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                                >
                                  Reset Search
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => {
                          const id = bookingIdOf(b) || bookingNumberOf(b);
                          const isSelected = selectedBookingId === bookingIdOf(b);
                          const cName = clientNameOf(b);
                          const bNum = bookingNumberOf(b);
                          const bDate = dateOf(b);
                          const bStatus = b.status || 'Pending';
                          const statusClass = getStatusClass(bStatus);

                          return (
                            <tr key={id} className={isSelected ? 'row-selected' : ''}>
                              <td>
                                <span className="inspect-ref-badge">
                                  <Hash size={12} /> {bNum}
                                </span>
                              </td>
                              <td>
                                <div className="inspect-client-cell">
                                  <div className="inspect-client-avatar">{getInitials(cName)}</div>
                                  <span className="inspect-client-name">{cName}</span>
                                </div>
                              </td>
                              <td>
                                <div className="inspect-date-cell">
                                  <Calendar size={13} />
                                  <span>{bDate}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`inspect-status-pill ${statusClass}`}>
                                  <span className="dot" /> {bStatus}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  className={`inspect-select-btn ${isSelected ? 'is-selected' : ''}`}
                                  onClick={() => handleToggleSelect(b)}
                                  title={isSelected ? 'Deselect this booking' : 'Select this booking'}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check size={13} /> Selected
                                    </>
                                  ) : (
                                    <>
                                      Select <ChevronRight size={13} />
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* VIEW 2: NEW INSPECTION FORM */}
            {activeView === 'new_inspection' && selectedBooking && (
              <div className="inspect-form-card">
                <div className="inspect-form-header">
                  <h4>
                    <ClipboardCheck size={20} style={{ color: '#4ade80' }} />
                    New Facility Inspection
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="inspect-form-booking-badge">
                      {bookingNumberOf(selectedBooking)} • {clientNameOf(selectedBooking)}
                    </span>
                    <button
                      className="btn-inspect-ghost inspect-action-btn"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => setActiveView('list')}
                    >
                      <ArrowLeft size={13} /> Back to List
                    </button>
                  </div>
                </div>

                <div className="inspect-form-grid">
                  <div className="inspect-form-group">
                    <label className="inspect-label">Inspection Type</label>
                    <select
                      value={inspectionType}
                      onChange={(e) => setInspectionType(e.target.value)}
                      className="inspect-field"
                    >
                      <option value="Pre-Checkin">Pre-Checkin (Before guest arrival)</option>
                      <option value="Checkout">Checkout (Before guest departure)</option>
                      <option value="Routine">Routine Facility Check</option>
                    </select>
                  </div>

                  <div className="inspect-form-group">
                    <label className="inspect-label">Overall Condition Status</label>
                    <select
                      value={overallStatus}
                      onChange={(e) => setOverallStatus(e.target.value)}
                      className="inspect-field"
                    >
                      <option value="Clear">Clear / Pristine &amp; Good Condition</option>
                      <option value="Minor Issues">Minor Issues (Needs cleaning / housekeeping)</option>
                      <option value="Damaged">Damaged (Asset broken / requires fee compensation)</option>
                    </select>
                  </div>

                  <div className="inspect-form-group full-width">
                    <label className="inspect-label">
                      <span>Remarks &amp; Notes</span>
                      <small>Quick check tag shortcuts below</small>
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="inspect-field"
                      style={{ minHeight: 90, resize: 'vertical' }}
                      placeholder="Describe inspected room, cottage, appliances, cleanliness, or amenities status..."
                    />

                    <div className="inspect-quick-tags">
                      {quickTags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className="inspect-tag-btn"
                          onClick={() => handleAddQuickTag(t)}
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="inspect-form-actions">
                  <button
                    className="inspect-action-btn btn-inspect-primary"
                    onClick={handleCreateInspection}
                    disabled={submitting}
                  >
                    <Send size={15} /> {submitting ? 'Saving Inspection…' : 'Save Inspection'}
                  </button>
                  <button
                    className="inspect-action-btn btn-inspect-ghost"
                    onClick={() => setActiveView('list')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: REPORT DAMAGE FORM */}
            {activeView === 'new_damage' && selectedBooking && (
              <div className="inspect-form-card" style={{ borderColor: 'rgba(244, 63, 94, 0.35)' }}>
                <div className="inspect-form-header" style={{ borderBottomColor: 'rgba(244, 63, 94, 0.2)' }}>
                  <h4 style={{ color: '#fb7185' }}>
                    <FileWarning size={20} />
                    Report Damaged Facility Asset
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className="inspect-form-booking-badge"
                      style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.35)' }}
                    >
                      {bookingNumberOf(selectedBooking)} • {clientNameOf(selectedBooking)}
                    </span>
                    <button
                      className="btn-inspect-ghost inspect-action-btn"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => setActiveView('list')}
                    >
                      <ArrowLeft size={13} /> Back to List
                    </button>
                  </div>
                </div>

                <div className="inspect-form-grid">
                  <div className="inspect-form-group">
                    <label className="inspect-label" style={{ color: '#fb7185' }}>Damaged Item</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart TV, Cottage Table, Glass Window, Shower Fixture"
                      value={damageReport.item_name}
                      onChange={(e) => setDamageReport({ ...damageReport, item_name: e.target.value })}
                      className="inspect-field"
                    />
                  </div>

                  <div className="inspect-form-group">
                    <label className="inspect-label" style={{ color: '#fb7185' }}>Damage Type</label>
                    <select
                      value={damageReport.damage_type}
                      onChange={(e) => setDamageReport({ ...damageReport, damage_type: e.target.value })}
                      className="inspect-field"
                    >
                      <option value="">Select Damage Type...</option>
                      <option value="Cracked Screen / Glass">Cracked Screen / Glass</option>
                      <option value="Broken Furniture / Fixture">Broken Furniture / Fixture</option>
                      <option value="Missing Item / Lost Asset">Missing Item / Lost Asset</option>
                      <option value="Stained / Burned Linen">Stained / Burned Linen</option>
                      <option value="Electrical / Plumbing Defect">Electrical / Plumbing Defect</option>
                      <option value="Vandalism / Surface Damage">Vandalism / Surface Damage</option>
                      <option value="Other Damage">Other Damage</option>
                    </select>
                  </div>

                  <div className="inspect-form-group full-width">
                    <label className="inspect-label" style={{ color: '#fb7185' }}>Description of Damage Incident</label>
                    <textarea
                      placeholder="Provide complete details on how the damage occurred or what was observed during check-out..."
                      value={damageReport.description}
                      onChange={(e) => setDamageReport({ ...damageReport, description: e.target.value })}
                      className="inspect-field"
                      style={{ minHeight: 90, resize: 'vertical' }}
                    />
                  </div>

                  <div className="inspect-form-group">
                    <label className="inspect-label" style={{ color: '#fb7185' }}>
                      <span>Recommended Damage Fee (₱)</span>
                      <small>Subject to Admin approval</small>
                    </label>
                    <div className="inspect-currency-input-wrap">
                      <span className="inspect-currency-prefix">₱</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        placeholder="0.00"
                        value={damageReport.recommended_fee}
                        onChange={(e) => setDamageReport({ ...damageReport, recommended_fee: e.target.value })}
                        className="inspect-field inspect-field-currency"
                      />
                    </div>
                  </div>

                  <div className="inspect-form-group">
                    <label className="inspect-label" style={{ color: '#fb7185' }}>
                      <span>Evidence / Photo URL (Optional)</span>
                      <small>Image link or photo evidence</small>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/evidence-photo.jpg"
                      value={damageReport.evidence_url}
                      onChange={(e) => setDamageReport({ ...damageReport, evidence_url: e.target.value })}
                      className="inspect-field"
                    />
                  </div>
                </div>

                <div className="inspect-form-actions">
                  <button
                    className="inspect-action-btn btn-inspect-danger"
                    onClick={handleReportDamage}
                    disabled={submitting}
                  >
                    <FileWarning size={15} /> {submitting ? 'Submitting…' : 'Submit for Admin Approval'}
                  </button>
                  <button
                    className="inspect-action-btn btn-inspect-ghost"
                    onClick={() => setActiveView('list')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            SECTION 2: REPORTED DAMAGES LOG (Live Synced with Admin)
           ========================================================================= */}
        {activeSection === 'damages' && (
          <div>
            {/* STATS TILES */}
            <div className="inspect-stats-grid">
              <div className="inspect-stat-tile">
                <div className="inspect-stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                  <FileWarning size={20} />
                </div>
                <div className="inspect-stat-info">
                  <small>Total Reported</small>
                  <strong>{damageReports.length}</strong>
                </div>
              </div>

              <div className="inspect-stat-tile" style={{ borderColor: pendingDamagesCount > 0 ? 'rgba(245, 158, 11, 0.4)' : '' }}>
                <div className="inspect-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Clock size={20} />
                </div>
                <div className="inspect-stat-info">
                  <small>Awaiting Admin Review</small>
                  <strong style={{ color: pendingDamagesCount > 0 ? '#fbbf24' : 'inherit' }}>
                    {pendingDamagesCount}
                  </strong>
                </div>
              </div>

              <div className="inspect-stat-tile">
                <div className="inspect-stat-icon" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="inspect-stat-info">
                  <small>Approved by Admin</small>
                  <strong style={{ color: '#4ade80' }}>{approvedDamagesCount}</strong>
                </div>
              </div>

              <div className="inspect-stat-tile">
                <div className="inspect-stat-icon" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf' }}>
                  <DollarSign size={20} />
                </div>
                <div className="inspect-stat-info">
                  <small>Total Approved Penalties</small>
                  <strong style={{ color: '#2dd4bf' }}>
                    ₱{totalDamageFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="inspect-controls">
              <div className="inspect-search-wrap">
                <Search size={16} className="inspect-search-icon" />
                <input
                  type="text"
                  placeholder="Search by booking no, client, item name, or damage type..."
                  value={damageSearchQuery}
                  onChange={(e) => setDamageSearchQuery(e.target.value)}
                  className="inspect-search-input"
                />
                {damageSearchQuery && (
                  <button className="inspect-clear-search" onClick={() => setDamageSearchQuery('')} title="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="inspect-filter-group">
                {[
                  { key: 'ALL', label: `All (${damageReports.length})` },
                  { key: 'Pending', label: `Pending (${pendingDamagesCount})` },
                  { key: 'Approved', label: `Approved (${approvedDamagesCount})` },
                  { key: 'Waived', label: 'Waived' },
                  { key: 'Rejected', label: 'Rejected' }
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`inspect-filter-btn ${damageStatusFilter === f.key ? 'active' : ''}`}
                    onClick={() => setDamageStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DAMAGES TABLE */}
            <div className="inspect-table-wrap">
              <table className="inspect-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Booking No.</th>
                    <th>Client</th>
                    <th>Damaged Asset</th>
                    <th>Description</th>
                    <th>Staff Rec. Fee</th>
                    <th>Admin Final Fee</th>
                    <th>Admin Status</th>
                    <th style={{ textAlign: 'right' }}>Reported Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDamages.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="inspect-empty-state">
                          <div className="inspect-empty-icon">
                            <FileWarning size={24} />
                          </div>
                          <h4>No damage incident reports found</h4>
                          <p>When staff reports damage, it appears here and is immediately visible to the Admin for approval.</p>
                          <button
                            className="inspect-action-btn btn-inspect-danger"
                            style={{ marginTop: 10 }}
                            onClick={() => {
                              setActiveSection('bookings');
                              setActiveView('list');
                            }}
                          >
                            <FileWarning size={14} /> Report Facility Damage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDamages.map((r) => {
                      const statusClass = getDamageStatusClass(r.status);
                      const clientName = r.client_name || 'Guest Visitor';
                      const hasEvidence = Boolean(r.evidence_url && r.evidence_url.trim());
                      const finalFee = parseFloat(r.final_fee !== null && r.final_fee !== undefined ? r.final_fee : r.recommended_fee) || 0;
                      const recFee = parseFloat(r.recommended_fee || 0);

                      return (
                        <tr key={r.id}>
                          <td>
                            <span className="inspect-id-badge">#{r.id}</span>
                          </td>
                          <td>
                            <span className="inspect-ref-badge">
                              <Hash size={12} /> {r.booking_number || `BK-${r.booking_id}`}
                            </span>
                          </td>
                          <td>
                            <div className="inspect-client-cell">
                              <div className="inspect-client-avatar">{getInitials(clientName)}</div>
                              <span className="inspect-client-name">{clientName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="inspect-damage-item">{r.item_name}</span>
                            <span className="inspect-damage-type">{r.damage_type}</span>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <p style={{ margin: 0, fontSize: 12.5, color: '#9fbfad', lineHeight: 1.4 }}>
                              {r.description}
                            </p>
                            {hasEvidence && (
                              <button
                                onClick={() => setPreviewEvidenceUrl(r.evidence_url)}
                                style={{
                                  marginTop: 4,
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#38bdf8',
                                  fontSize: 11,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3
                                }}
                              >
                                <Eye size={12} /> View Photo Evidence
                              </button>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: 13, color: '#9fbfad', fontVariantNumeric: 'tabular-nums' }}>
                              ₱{recFee.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span className="inspect-fee-badge" style={{ color: r.status === 'Approved' ? '#4ade80' : 'inherit' }}>
                              ₱{finalFee.toFixed(2)}
                            </span>
                            {r.status === 'Approved' && (
                              <small style={{ display: 'block', fontSize: 10, color: '#4ade80' }}>
                                ✓ Folio Charged
                              </small>
                            )}
                          </td>
                          <td>
                            <span className={`inspect-status-pill ${statusClass}`}>
                              <span className="dot" /> {r.status}
                            </span>
                            {r.approver_name && r.status !== 'Pending' && (
                              <small style={{ display: 'block', fontSize: 10, color: '#9fbfad', marginTop: 2 }}>
                                By: {r.approver_name}
                              </small>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', fontSize: 12, color: '#9fbfad' }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: FACILITY INSPECTION LOGS
           ========================================================================= */}
        {activeSection === 'inspections' && (
          <div>
            {/* SEARCH & FILTERS */}
            <div className="inspect-controls">
              <div className="inspect-search-wrap">
                <Search size={16} className="inspect-search-icon" />
                <input
                  type="text"
                  placeholder="Search inspections by booking no, client, status, or staff..."
                  value={inspectionSearchQuery}
                  onChange={(e) => setInspectionSearchQuery(e.target.value)}
                  className="inspect-search-input"
                />
                {inspectionSearchQuery && (
                  <button className="inspect-clear-search" onClick={() => setInspectionSearchQuery('')} title="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="inspect-filter-group">
                {[
                  { key: 'ALL', label: `All (${inspectionsHistory.length})` },
                  { key: 'Clear', label: 'Clear' },
                  { key: 'Damage', label: 'Damage Found' },
                  { key: 'Pre-Checkin', label: 'Pre-Checkin' },
                  { key: 'Checkout', label: 'Checkout' }
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`inspect-filter-btn ${inspectionStatusFilter === f.key ? 'active' : ''}`}
                    onClick={() => setInspectionStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* INSPECTIONS TABLE */}
            <div className="inspect-table-wrap">
              <table className="inspect-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Booking No.</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Condition Status</th>
                    <th>Inspected Items &amp; Notes</th>
                    <th>Inspector</th>
                    <th style={{ textAlign: 'right' }}>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInspections.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="inspect-empty-state">
                          <div className="inspect-empty-icon">
                            <ClipboardCheck size={24} />
                          </div>
                          <h4>No facility inspection records found</h4>
                          <p>Record pre-checkin, checkout, or routine facility inspections from the Bookings tab.</p>
                          <button
                            className="inspect-action-btn btn-inspect-primary"
                            style={{ marginTop: 10 }}
                            onClick={() => {
                              setActiveSection('bookings');
                              setActiveView('list');
                            }}
                          >
                            <ClipboardCheck size={14} /> Start Inspection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInspections.map((ins) => {
                      const clientName = ins.client_name || 'Guest Visitor';
                      const inspectorName = ins.fname ? `${ins.fname} ${ins.lname || ''}`.trim() : 'Duty Staff';
                      const isClear = String(ins.status || '').toLowerCase().includes('clear');

                      return (
                        <tr key={ins.id}>
                          <td>
                            <span className="inspect-id-badge">#{ins.id}</span>
                          </td>
                          <td>
                            <span className="inspect-ref-badge">
                              <Hash size={12} /> {ins.booking_number || `BK-${ins.booking_id}`}
                            </span>
                          </td>
                          <td>
                            <div className="inspect-client-cell">
                              <div className="inspect-client-avatar">{getInitials(clientName)}</div>
                              <span className="inspect-client-name">{clientName}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ecfdf5' }}>
                              {ins.type}
                            </span>
                          </td>
                          <td>
                            <span className={`inspect-status-pill ${isClear ? 'status-confirmed' : 'status-cancelled'}`}>
                              <span className="dot" /> {ins.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: 260 }}>
                            {Array.isArray(ins.items) && ins.items.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {ins.items.map((it, idx) => (
                                  <div key={it.id || idx} style={{ fontSize: 12, color: '#9fbfad' }}>
                                    <strong style={{ color: it.condition === 'Damaged' ? '#fb7185' : '#86efac' }}>
                                      {it.item_name}:
                                    </strong>{' '}
                                    {it.notes || it.condition}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: '#9fbfad', fontStyle: 'italic' }}>General inspection logged</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9fbfad' }}>
                              <User size={12} style={{ color: '#4ade80' }} />
                              <span>{inspectorName}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: 12, color: '#9fbfad' }}>
                            {ins.created_at ? new Date(ins.created_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionsTab;
