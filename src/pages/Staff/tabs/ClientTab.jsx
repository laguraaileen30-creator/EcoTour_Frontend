import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';

export default function ClientTab() {
  const { clients = [], setClients } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ name: '', email: '', membership: 'Standard', status: 'Approved' });
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e) => {
    e.preventDefault();
    const newClient = { ...form, id: Date.now(), joinDate: new Date().toLocaleDateString() };
    // 📝 CONNECT TO BACKEND HERE: e.g., addClientAPI(newClient)
    setClients([...clients, newClient]);
    setIsModalOpen(false);
    setForm({ name: '', email: '', membership: 'Standard', status: 'Approved' });
  };

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: '24px' }}>
        <div>
          <span className="card-title">Visitor & Client Management</span>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Manage visitor accounts and memberships</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setIsModalOpen(true)}>
          + Add Client
        </button>
      </div>

      <div style={{ padding: '0 24px 20px' }}>
        <input className="modal-input" style={{ margin: 0 }} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="manage-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Membership</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No clients found</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.email}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.joinDate || 'Today'}</td>
                  <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}>{c.membership}</span></td>
                  <td><span className={`badge ${c.status === 'Approved' ? 'confirmed' : 'cancelled'}`}>{c.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD CLIENT MODAL */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
          <h3 className="modal-title">Register New Client</h3>
          <form onSubmit={handleAdd}>
            <input className="modal-input" placeholder="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="modal-input" type="email" placeholder="Email Address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <select className="modal-input" value={form.membership} onChange={e => setForm({...form, membership: e.target.value})}>
              <option>Standard</option>
              <option>VIP</option>
              <option>Gold Member</option>
            </select>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Register Client</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}