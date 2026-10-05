import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiJson } from '../../../utils/catalog';

const DamageReviewsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const data = await apiJson('/damages', { auth: true });
      setReports(data.reports || data.data?.reports || (Array.isArray(data.data) ? data.data : []));
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load damage reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReview = async (id, status, final_fee) => {
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;

    try {
      await apiJson(`/damages/${id}/review`, {
        method: 'PUT',
        auth: true,
        body: { status, final_fee }
      });
      await fetchReports();
    } catch (err) {
      setError(err.message || 'Unable to update the damage report.');
    }
  };

  if (loading) return <div style={{padding: 20}}>Loading damage reports...</div>;

  return (
    <div className="ct-card ct-pad">
      <div className="ct-card-head">
        <span><AlertTriangle size={18} /> Damage Reports & Check-out Inspections</span>
      </div>

      {error && <div role="alert" style={{ color: '#be123c', marginTop: 12 }}>{error}</div>}

      <div className="gd-table-wrap" style={{marginTop: 20}}>
        <table className="gd-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Booking No.</th>
              <th>Client</th>
              <th>Item / Damage</th>
              <th>Description</th>
              <th>Recommended Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.booking_number}</td>
                <td>{r.client_name}</td>
                <td>{r.item_name} - {r.damage_type}</td>
                <td>{r.description}</td>
                <td style={{color: '#e11d48', fontWeight: 'bold'}}>₱{parseFloat(r.recommended_fee).toFixed(2)}</td>
                <td>
                  <span className={`gd-pill ${r.status === 'Pending' ? 'tone-amber' : r.status === 'Approved' ? 'tone-emerald' : 'tone-slate'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status === 'Pending' && (
                    <div style={{display: 'flex', gap: 5}}>
                      <button className="gd-btn gd-btn-primary" style={{padding: '4px 8px'}} onClick={() => handleReview(r.id, 'Approved', r.recommended_fee)}>Approve</button>
                      <button className="gd-btn gd-btn-ghost" style={{padding: '4px 8px'}} onClick={() => handleReview(r.id, 'Waived', 0)}>Waive</button>
                      <button className="gd-btn gd-btn-ghost" style={{padding: '4px 8px', color: '#e11d48'}} onClick={() => handleReview(r.id, 'Rejected', 0)}>Reject</button>
                    </div>
                  )}
                  {r.status !== 'Pending' && <span>Reviewed (Fee: ₱{parseFloat(r.final_fee).toFixed(2)})</span>}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={8} style={{textAlign: 'center', padding: 20}}>No damage reports pending review.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DamageReviewsTab;
