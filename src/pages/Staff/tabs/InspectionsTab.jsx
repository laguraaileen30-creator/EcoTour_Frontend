import React, { useState } from 'react';
import { ClipboardCheck, FileWarning, Search, Send } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson } from '../../../utils/catalog';

const bookingIdOf = (booking) => booking?.id ?? booking?.booking_id ?? booking?.reservation_id;
const bookingNumberOf = (booking) =>
  String(booking?.bookingNumber || booking?.booking_number || booking?.bookingRef || booking?.booking_ref || `BK-${bookingIdOf(booking)}`);
const clientNameOf = (booking) =>
  String(booking?.clientName || booking?.client_name || booking?.fullName || booking?.touristName || booking?.tourist_name || 'Guest');

const InspectionsTab = () => {
  const { resortBookings } = useEcoTour();
  const [activeView, setActiveView] = useState('list'); // 'list', 'new_inspection', 'new_damage'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Inspection Form State
  const [inspectionType, setInspectionType] = useState('Pre-Checkin');
  const [overallStatus, setOverallStatus] = useState('Clear');
  const [remarks, setRemarks] = useState('');

  // Damage Form State
  const [damageReport, setDamageReport] = useState({
    item_name: '', damage_type: '', description: '', recommended_fee: 0, evidence_url: ''
  });

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
          status: overallStatus,
          items: [{ item_name: 'General Inspection', condition: overallStatus, notes: remarks }]
        }
      });
      alert('Inspection recorded!');
      setActiveView('list');
      setRemarks('');
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
      alert('Damage reported for Admin approval!');
      setActiveView('list');
      setDamageReport({ item_name: '', damage_type: '', description: '', recommended_fee: 0, evidence_url: '' });
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit the damage report.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = (resortBookings || []).filter(b => {
    const query = searchQuery.toLowerCase().trim();
    return bookingNumberOf(b).toLowerCase().includes(query) || clientNameOf(b).toLowerCase().includes(query);
  });

  return (
    <div className="ct-card ct-pad">
      <div className="ct-card-head">
        <span><ClipboardCheck size={18} /> Inspections & Damage</span>
        <div style={{display:'flex', gap: '10px'}}>
          <button className="gd-btn gd-btn-primary" onClick={() => setActiveView('new_inspection')} disabled={!selectedBooking}>
            + New Inspection
          </button>
          <button className="gd-btn gd-btn-danger" style={{backgroundColor: '#e11d48', color: 'white'}} onClick={() => setActiveView('new_damage')} disabled={!selectedBooking}>
            <FileWarning size={14} /> Report Damage
          </button>
        </div>
      </div>

      {submitError && <div role="alert" className="my-3 text-sm text-rose-600">{submitError}</div>}

      {activeView === 'list' && (
        <>
          <div className="search-bar" style={{marginBottom: 20}}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search booking number or client name to select..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              style={{width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginLeft: 10}}
            />
          </div>

          <div className="gd-table-wrap">
            <table className="gd-table">
              <thead>
                <tr>
                  <th>Booking No.</th>
                  <th>Client Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={bookingIdOf(b) || bookingNumberOf(b)} style={{backgroundColor: bookingIdOf(selectedBooking) === bookingIdOf(b) ? '#f0fdf4' : ''}}>
                    <td>{bookingNumberOf(b)}</td>
                    <td>{clientNameOf(b)}</td>
                    <td>{b.bookingDate || b.booking_date || b.reservationDate || b.reservation_date}</td>
                    <td>{b.status}</td>
                    <td>
                      <button className="gd-btn gd-btn-ghost" onClick={() => { setSelectedBooking(b); setSubmitError(''); }}>
                        {bookingIdOf(selectedBooking) === bookingIdOf(b) ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeView === 'new_inspection' && selectedBooking && (
        <div style={{marginTop: 20}}>
          <h4 style={{marginBottom: 15}}>New Inspection for {bookingNumberOf(selectedBooking)} - {clientNameOf(selectedBooking)}</h4>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400}}>
            <div>
              <label style={{display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 5}}>Inspection Type</label>
              <select value={inspectionType} onChange={e => setInspectionType(e.target.value)} className="gd-input" style={{width: '100%', padding: 8}}>
                <option value="Pre-Checkin">Pre-Checkin (Before guest arrives)</option>
                <option value="Checkout">Checkout (Before guest leaves)</option>
                <option value="Routine">Routine Check</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 5}}>Overall Status</label>
              <select value={overallStatus} onChange={e => setOverallStatus(e.target.value)} className="gd-input" style={{width: '100%', padding: 8}}>
                <option value="Clear">Clear / Good Condition</option>
                <option value="Minor Issues">Minor Issues (Needs cleaning/fixing)</option>
                <option value="Damaged">Damaged (Requires replacement/fee)</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 5}}>Remarks & Notes</label>
              <textarea 
                value={remarks} 
                onChange={e => setRemarks(e.target.value)} 
                className="gd-input" 
                style={{width: '100%', padding: 8, minHeight: 80}}
                placeholder="Everything looks good..." 
              />
            </div>
          </div>

          <div style={{marginTop: 20, display: 'flex', gap: 10}}>
            <button className="gd-btn gd-btn-primary" onClick={handleCreateInspection} disabled={submitting}><Send size={14}/> {submitting ? 'Saving…' : 'Save Inspection'}</button>
            <button className="gd-btn gd-btn-ghost" onClick={() => setActiveView('list')}>Cancel</button>
          </div>
        </div>
      )}

      {activeView === 'new_damage' && selectedBooking && (
        <div style={{marginTop: 20}}>
          <h4 style={{color: '#e11d48'}}>Report Damage for {bookingNumberOf(selectedBooking)}</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15, maxWidth: 400}}>
            <input placeholder="Damaged Item (e.g. TV)" value={damageReport.item_name} onChange={e => setDamageReport({...damageReport, item_name: e.target.value})} className="gd-input" style={{padding:8}} />
            <input placeholder="Damage Type (e.g. Cracked Screen)" value={damageReport.damage_type} onChange={e => setDamageReport({...damageReport, damage_type: e.target.value})} className="gd-input" style={{padding:8}} />
            <textarea placeholder="Description of what happened" value={damageReport.description} onChange={e => setDamageReport({...damageReport, description: e.target.value})} className="gd-input" style={{padding:8, minHeight: 80}} />
            
            <input type="number" placeholder="Recommended Damage Fee to Charge (₱)" value={damageReport.recommended_fee} onChange={e => setDamageReport({...damageReport, recommended_fee: e.target.value})} style={{padding:8, border: '2px solid #e11d48', borderRadius: 6}} />
          </div>

          <div style={{marginTop: 20, display: 'flex', gap: 10}}>
            <button className="gd-btn gd-btn-primary" style={{backgroundColor: '#e11d48'}} onClick={handleReportDamage} disabled={submitting}><FileWarning size={14}/> {submitting ? 'Submitting…' : 'Submit for Admin Approval'}</button>
            <button className="gd-btn gd-btn-ghost" onClick={() => setActiveView('list')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsTab;
