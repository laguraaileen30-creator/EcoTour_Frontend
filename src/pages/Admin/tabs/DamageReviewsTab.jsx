import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle, ClipboardCheck, Search, X, Check, CheckCircle2,
  ShieldAlert, RefreshCw, Hash, User, Calendar, DollarSign,
  FileWarning, ExternalLink, Filter, ChevronRight, Eye, Wrench, Clock
} from 'lucide-react';
import { apiJson } from '../../../utils/catalog';
import { useEcoTour } from '../../../context/EcoTourContext';
import './DamageReviewsTab.css';

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/);
  if (!parts.length || !parts[0]) return 'G';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const DamageReviewsTab = () => {
  const { showAlert, showConfirm, refreshAllLiveData, theme } = useEcoTour();

  const [activeSubTab, setActiveSubTab] = useState('damages'); // 'damages' | 'inspections'
  const [reports, setReports] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [damageStatusFilter, setDamageStatusFilter] = useState('ALL');
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState('ALL');

  // Modal State for Reviewing / Approving
  const [reviewModalReport, setReviewModalReport] = useState(null);
  const [finalFeeInput, setFinalFeeInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Evidence preview modal
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState(null);

  const fetchAllData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError('');
    try {
      // 1. Fetch damage reports
      const damageData = await apiJson('/damages', { auth: true });
      const rawReports = damageData.reports || damageData.data?.reports || (Array.isArray(damageData.data) ? damageData.data : []);
      setReports(rawReports);

      // 2. Fetch facility inspections
      try {
        const inspectData = await apiJson('/inspections', { auth: true });
        const rawInspections = inspectData.inspections || inspectData.data?.inspections || (Array.isArray(inspectData.data) ? inspectData.data : []);
        setInspections(rawInspections);
      } catch (insErr) {
        console.warn('Could not fetch inspections list:', insErr);
      }
    } catch (err) {
      setError(err.message || 'Unable to load damage reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenApproveModal = (report) => {
    setReviewModalReport(report);
    setFinalFeeInput(String(report.recommended_fee || 0));
  };

  const handleConfirmApproval = async () => {
    if (!reviewModalReport) return;
    const feeNum = parseFloat(finalFeeInput);
    if (!Number.isFinite(feeNum) || feeNum < 0) {
      if (showAlert) {
        showAlert({ title: 'Invalid Fee', message: 'Please enter a valid, non-negative penalty fee.', type: 'warning' });
      } else {
        alert('Please enter a valid penalty fee.');
      }
      return;
    }

    setSubmittingReview(true);
    try {
      await apiJson(`/damages/${reviewModalReport.id}/review`, {
        method: 'PUT',
        auth: true,
        body: { status: 'Approved', final_fee: feeNum }
      });
      if (showAlert) {
        showAlert({
          title: 'Damage Approved',
          message: `Report #${reviewModalReport.id} for "${reviewModalReport.item_name}" approved with fee ₱${feeNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
          type: 'success'
        });
      }
      setReviewModalReport(null);
      await fetchAllData();
      if (refreshAllLiveData) refreshAllLiveData();
    } catch (err) {
      if (showAlert) {
        showAlert({ title: 'Action Failed', message: err.message || 'Unable to approve damage report.', type: 'danger' });
      } else {
        alert(err.message);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuickReview = async (report, status, final_fee = 0) => {
    const isWaive = status === 'Waived';
    const actionText = isWaive ? 'waive this damage report (₱0.00 fee)' : 'reject this damage report';

    if (showConfirm) {
      const ok = await showConfirm({
        title: `${status} Damage Report #${report.id}?`,
        message: `Are you sure you want to ${actionText} for booking ${report.booking_number || ''}?`,
        type: isWaive ? 'info' : 'warning',
        confirmText: status
      });
      if (!ok) return;
    } else {
      if (!window.confirm(`Are you sure you want to ${status} this report?`)) return;
    }

    try {
      await apiJson(`/damages/${report.id}/review`, {
        method: 'PUT',
        auth: true,
        body: { status, final_fee }
      });
      if (showAlert) {
        showAlert({
          title: `Report ${status}`,
          message: `Damage report #${report.id} has been marked as ${status}.`,
          type: 'success'
        });
      }
      await fetchAllData();
      if (refreshAllLiveData) refreshAllLiveData();
    } catch (err) {
      setError(err.message || 'Unable to update the damage report.');
    }
  };

  // --- METRICS CALCULATION ---
  const pendingReports = useMemo(() => reports.filter((r) => r.status === 'Pending'), [reports]);
  const approvedReports = useMemo(() => reports.filter((r) => r.status === 'Approved'), [reports]);
  const totalDamagePenalties = useMemo(
    () => approvedReports.reduce((sum, r) => sum + parseFloat(r.final_fee || r.recommended_fee || 0), 0),
    [approvedReports]
  );

  // --- FILTERED DAMAGE REPORTS ---
  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return reports.filter((r) => {
      const bNum = String(r.booking_number || '').toLowerCase();
      const cName = String(r.client_name || '').toLowerCase();
      const item = String(r.item_name || '').toLowerCase();
      const dtype = String(r.damage_type || '').toLowerCase();
      const staff = String(`${r.staff_fname || ''} ${r.staff_lname || ''}`).toLowerCase();

      const matchesSearch = !q || bNum.includes(q) || cName.includes(q) || item.includes(q) || dtype.includes(q) || staff.includes(q);

      let matchesStatus = true;
      if (damageStatusFilter !== 'ALL') {
        matchesStatus = (r.status || '').toLowerCase() === damageStatusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, damageStatusFilter]);

  // --- FILTERED INSPECTIONS ---
  const filteredInspections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return inspections.filter((ins) => {
      const bNum = String(ins.booking_number || '').toLowerCase();
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
  }, [inspections, searchQuery, inspectionStatusFilter]);

  const getStatusPillClass = (statusStr = '') => {
    const s = String(statusStr).toLowerCase();
    if (s.includes('pending')) return 'status-pending';
    if (s.includes('approv') || s.includes('clear')) return 'status-approved';
    if (s.includes('waiv')) return 'status-waived';
    if (s.includes('reject') || s.includes('damag')) return 'status-rejected';
    return 'status-pending';
  };

  if (loading) {
    return (
      <div className="damage-reviews-tab">
        <div className="admin-inspect-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: '#4ade80', margin: '0 auto 12px' }} />
          <h4 style={{ color: '#ecfdf5', fontSize: 16 }}>Loading Damage Reports & Inspection Logs...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="damage-reviews-tab">
      <div className="admin-inspect-card">
        {/* HEADER SECTION */}
        <div className="admin-inspect-header">
          <div className="admin-inspect-title-group">
            <div className="admin-inspect-icon-chip">
              <ShieldAlert size={22} />
            </div>
            <div className="admin-inspect-title-text">
              <h3>
                Damage Reports &amp; Facility Inspections
                {pendingReports.length > 0 && (
                  <span
                    className="admin-status-pill status-pending"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    <span className="dot" /> {pendingReports.length} Pending Review
                  </span>
                )}
              </h3>
              <p>Review damage reports submitted by front-desk staff, approve penalty charges, and inspect audit logs.</p>
            </div>
          </div>

          <div className="admin-inspect-header-actions">
            <button
              className="admin-tab-nav-btn"
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              title="Refresh live damage reports and inspections"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing…' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* TOP GLANCE STATS TILES */}
        <div className="admin-inspect-stats-grid">
          <div className="admin-inspect-stat-tile">
            <div className="admin-inspect-stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <FileWarning size={20} />
            </div>
            <div className="admin-inspect-stat-info">
              <small>Total Damage Reports</small>
              <strong>{reports.length}</strong>
            </div>
          </div>

          <div className="admin-inspect-stat-tile" style={{ borderColor: pendingReports.length > 0 ? 'rgba(245, 158, 11, 0.4)' : '' }}>
            <div className="admin-inspect-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={20} />
            </div>
            <div className="admin-inspect-stat-info">
              <small>Pending Admin Review</small>
              <strong style={{ color: pendingReports.length > 0 ? '#fbbf24' : 'inherit' }}>
                {pendingReports.length}
              </strong>
            </div>
          </div>

          <div className="admin-inspect-stat-tile">
            <div className="admin-inspect-stat-icon" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
              <DollarSign size={20} />
            </div>
            <div className="admin-inspect-stat-info">
              <small>Approved Damage Fees</small>
              <strong style={{ color: '#4ade80' }}>
                ₱{totalDamagePenalties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="admin-inspect-stat-tile">
            <div className="admin-inspect-stat-icon" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf' }}>
              <ClipboardCheck size={20} />
            </div>
            <div className="admin-inspect-stat-info">
              <small>Total Inspections Logged</small>
              <strong>{inspections.length}</strong>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="admin-inspect-tabs-nav">
          <button
            className={`admin-tab-nav-btn ${activeSubTab === 'damages' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('damages')}
          >
            <FileWarning size={15} />
            <span>Damage Reports</span>
            <span className="badge">{reports.length}</span>
          </button>

          <button
            className={`admin-tab-nav-btn ${activeSubTab === 'inspections' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('inspections')}
          >
            <ClipboardCheck size={15} />
            <span>Facility Inspection Logs</span>
            <span className="badge">{inspections.length}</span>
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="admin-modal-overlay" style={{ background: 'transparent', position: 'static', padding: 0 }}>
            <div className="inspect-alert-error" role="alert" style={{ width: '100%' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* CONTROLS: SEARCH & FILTER */}
        <div className="admin-inspect-controls">
          <div className="admin-inspect-search-wrap">
            <Search size={16} className="admin-inspect-search-icon" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'damages'
                  ? 'Search by Booking No, client, damaged item, or staff name...'
                  : 'Search by Booking No, client, inspection status, or staff name...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-inspect-search-input"
            />
            {searchQuery && (
              <button
                className="admin-inspect-clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-inspect-filter-group">
            {activeSubTab === 'damages' ? (
              [
                { key: 'ALL', label: `All (${reports.length})` },
                { key: 'Pending', label: `Pending (${pendingReports.length})` },
                { key: 'Approved', label: `Approved (${approvedReports.length})` },
                { key: 'Waived', label: 'Waived' },
                { key: 'Rejected', label: 'Rejected' }
              ].map((f) => (
                <button
                  key={f.key}
                  className={`admin-inspect-filter-btn ${damageStatusFilter === f.key ? 'active' : ''}`}
                  onClick={() => setDamageStatusFilter(f.key)}
                >
                  {f.label}
                </button>
              ))
            ) : (
              [
                { key: 'ALL', label: `All (${inspections.length})` },
                { key: 'Clear', label: 'Clear' },
                { key: 'Damage', label: 'Damage Found' },
                { key: 'Pre-Checkin', label: 'Pre-Checkin' },
                { key: 'Checkout', label: 'Checkout' }
              ].map((f) => (
                <button
                  key={f.key}
                  className={`admin-inspect-filter-btn ${inspectionStatusFilter === f.key ? 'active' : ''}`}
                  onClick={() => setInspectionStatusFilter(f.key)}
                >
                  {f.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* SUBTAB 1: DAMAGE REPORTS TABLE */}
        {activeSubTab === 'damages' && (
          <div className="admin-inspect-table-wrap">
            <table className="admin-inspect-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Booking No.</th>
                  <th>Client</th>
                  <th>Damaged Asset</th>
                  <th>Description</th>
                  <th>Fee Assessment</th>
                  <th>Reported By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="admin-inspect-empty">
                        <div className="admin-inspect-empty-icon">
                          <FileWarning size={24} />
                        </div>
                        <h4>No damage reports found</h4>
                        <p>No damage incident reports match your current search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const statusClass = getStatusPillClass(r.status);
                    const staffName = r.staff_fname ? `${r.staff_fname} ${r.staff_lname || ''}`.trim() : 'Duty Staff';
                    const clientName = r.client_name || 'Guest Visitor';
                    const hasEvidence = Boolean(r.evidence_url && r.evidence_url.trim());

                    return (
                      <tr key={r.id}>
                        <td>
                          <span className="admin-id-badge">#{r.id}</span>
                        </td>
                        <td>
                          <span className="admin-ref-badge">
                            <Hash size={12} /> {r.booking_number || `BK-${r.booking_id}`}
                          </span>
                        </td>
                        <td>
                          <div className="admin-client-cell">
                            <div className="admin-client-avatar">{getInitials(clientName)}</div>
                            <span className="admin-client-name">{clientName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-damage-item">{r.item_name}</span>
                          <span className="admin-damage-type">{r.damage_type}</span>
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
                          <div>
                            <span className="admin-fee-badge">
                              ₱{(parseFloat(r.final_fee !== null && r.final_fee !== undefined ? r.final_fee : r.recommended_fee) || 0).toFixed(2)}
                            </span>
                            {r.status === 'Pending' && (
                              <small style={{ display: 'block', fontSize: 10, color: '#9fbfad' }}>
                                Rec. fee: ₱{(parseFloat(r.recommended_fee) || 0).toFixed(2)}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9fbfad' }}>
                            <User size={12} style={{ color: '#4ade80' }} />
                            <span>{staffName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-status-pill ${statusClass}`}>
                            <span className="dot" /> {r.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {r.status === 'Pending' ? (
                            <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="btn-review-approve"
                                onClick={() => handleOpenApproveModal(r)}
                                title="Approve and confirm damage fee to charge to guest"
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                className="btn-review-waive"
                                onClick={() => handleQuickReview(r, 'Waived', 0)}
                                title="Waive damage fee (₱0.00)"
                              >
                                Waive
                              </button>
                              <button
                                className="btn-review-reject"
                                onClick={() => handleQuickReview(r, 'Rejected', 0)}
                                title="Decline / Reject this damage report"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11.5, color: '#9fbfad', fontWeight: 600 }}>
                              Settled (₱{(parseFloat(r.final_fee || 0) || 0).toFixed(2)})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 2: FACILITY INSPECTION LOGS TABLE */}
        {activeSubTab === 'inspections' && (
          <div className="admin-inspect-table-wrap">
            <table className="admin-inspect-table">
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
                      <div className="admin-inspect-empty">
                        <div className="admin-inspect-empty-icon">
                          <ClipboardCheck size={24} />
                        </div>
                        <h4>No inspection logs found</h4>
                        <p>No check-in or check-out facility inspections match your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((ins) => {
                    const statusClass = getStatusPillClass(ins.status);
                    const staffName = ins.fname ? `${ins.fname} ${ins.lname || ''}`.trim() : 'Duty Staff';
                    const clientName = ins.client_name || 'Guest Visitor';
                    const dateStr = ins.created_at ? new Date(ins.created_at).toLocaleString() : 'Recent';

                    return (
                      <tr key={ins.id}>
                        <td>
                          <span className="admin-id-badge">#{ins.id}</span>
                        </td>
                        <td>
                          <span className="admin-ref-badge">
                            <Hash size={12} /> {ins.booking_number || `BK-${ins.booking_id}`}
                          </span>
                        </td>
                        <td>
                          <div className="admin-client-cell">
                            <div className="admin-client-avatar">{getInitials(clientName)}</div>
                            <span className="admin-client-name">{clientName}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: ins.type === 'Checkout' ? '#38bdf8' : '#86efac',
                              background: ins.type === 'Checkout' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(74, 222, 128, 0.12)',
                              padding: '3px 8px',
                              borderRadius: 6
                            }}
                          >
                            {ins.type}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-pill ${statusClass}`}>
                            <span className="dot" /> {ins.status}
                          </span>
                        </td>
                        <td style={{ maxWidth: 260 }}>
                          {Array.isArray(ins.items) && ins.items.length > 0 ? (
                            ins.items.map((it, idx) => (
                              <div key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
                                <strong>{it.item_name}:</strong>{' '}
                                <span style={{ color: '#9fbfad' }}>{it.condition || 'Checked'}</span>
                                {it.notes && <em style={{ display: 'block', fontSize: 11, color: '#cbd5e1' }}>"{it.notes}"</em>}
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: 12, color: '#9fbfad' }}>Standard facility check</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9fbfad' }}>
                            <User size={12} style={{ color: '#4ade80' }} />
                            <span>{staffName}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontSize: 11.5, color: '#9fbfad' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} />
                            <span>{dateStr}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: APPROVE DAMAGE & ADJUST FEE */}
      {reviewModalReport && (
        <div className="admin-modal-overlay">
          <div className="admin-review-modal">
            <div className="admin-modal-header">
              <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} style={{ color: '#4ade80' }} />
                Approve Damage Compensation
              </h4>
              <button
                className="admin-modal-close-btn"
                onClick={() => setReviewModalReport(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 12, border: '1px solid rgba(134, 239, 172, 0.14)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#9fbfad', textTransform: 'uppercase', fontWeight: 700 }}>Booking</span>
                  <span className="admin-ref-badge">{reviewModalReport.booking_number}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{reviewModalReport.client_name}</div>
                <div style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>
                  {reviewModalReport.item_name} — {reviewModalReport.damage_type}
                </div>
                <p style={{ fontSize: 12, color: '#9fbfad', margin: '6px 0 0', lineHeight: 1.4 }}>
                  "{reviewModalReport.description}"
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#86efac', marginBottom: 6 }}>
                  Final Penalty Fee to Charge (₱)
                </label>
                <div className="inspect-currency-input-wrap">
                  <span className="inspect-currency-prefix">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={finalFeeInput}
                    onChange={(e) => setFinalFeeInput(e.target.value)}
                    className="inspect-field inspect-field-currency"
                    style={{ fontSize: 15, fontWeight: 800 }}
                  />
                </div>
                <small style={{ display: 'block', color: '#9fbfad', fontSize: 11, marginTop: 4 }}>
                  Staff recommended: ₱{(parseFloat(reviewModalReport.recommended_fee) || 0).toFixed(2)}. This amount will be added to the client's booking bill.
                </small>
              </div>

              {reviewModalReport.evidence_url && (
                <div>
                  <a
                    href={reviewModalReport.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <ExternalLink size={13} /> View Attached Photo Evidence
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  className="btn-review-approve"
                  style={{ flex: 1, padding: 12, justifyContent: 'center', fontSize: 13 }}
                  onClick={handleConfirmApproval}
                  disabled={submittingReview}
                >
                  <Check size={16} /> {submittingReview ? 'Approving…' : 'Confirm & Charge Fee'}
                </button>
                <button
                  className="btn-review-waive"
                  style={{ flex: 0.5, padding: 12, justifyContent: 'center', fontSize: 13 }}
                  onClick={() => setReviewModalReport(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHOTO EVIDENCE VIEWER */}
      {previewEvidenceUrl && (
        <div className="admin-modal-overlay" onClick={() => setPreviewEvidenceUrl(null)}>
          <div className="admin-review-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="admin-modal-header">
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Damage Photo Evidence</h4>
              <button className="admin-modal-close-btn" onClick={() => setPreviewEvidenceUrl(null)}>
                <X size={15} />
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img
                src={previewEvidenceUrl}
                alt="Damage Evidence"
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  alert('Unable to load evidence image at this URL.');
                }}
              />
              <div style={{ marginTop: 12 }}>
                <a
                  href={previewEvidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <ExternalLink size={13} /> Open Image in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamageReviewsTab;
