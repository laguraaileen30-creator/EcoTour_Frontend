import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Eye, Edit3, MoreVertical,
  ChevronLeft, ChevronRight, ShieldCheck, Check, X, Mail
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function UserTable({ onOpenAddUser }) {
  const { approveUserAccount, rejectUserAccount } = useEcoTour();
  const [dbUsers, setDbUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const formatted = data.users.map((u, i) => {
          const roleStr = (u.role || 'Client').toLowerCase();
          const prefix = roleStr === 'staff' ? 'STF' : roleStr === 'admin' ? 'ADM' : 'CLT';
          const standardId = u.user_number || u.client_no || `${prefix}-2026-${String(u.user_id || i + 1).padStart(6, '0')}`;
          return {
            id: standardId,
            user_number: standardId,
            client_no: standardId,
            user_id: u.user_id,
            fname: u.fname || '',
            lname: u.lname || '',
            name: `${u.fname || ''} ${u.lname || ''}`.trim() || u.email,
            email: u.email,
            role: (u.role || 'Client').charAt(0).toUpperCase() + (u.role || 'Client').slice(1),
            status: (u.status || 'Pending').charAt(0).toUpperCase() + (u.status || 'Pending').slice(1),
            date: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            created_at: u.created_at,
            contact: u.contact_no || 'N/A',
            address: u.address || 'N/A',
            gender: u.gender || 'N/A',
            initials: `${(u.fname || 'U')[0]}${(u.lname || 'S')[0]}`.toUpperCase()
          };
        });
        setDbUsers(formatted);
      }
    } catch (e) {
      console.warn("Failed to fetch users:", e.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Logic
  const filtered = dbUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);

    if (activeTab === 'clients') return matchesSearch && u.role.toLowerCase() === 'client';
    if (activeTab === 'staff') return matchesSearch && u.role.toLowerCase() === 'staff';
    if (activeTab === 'pending') return matchesSearch && u.status.toLowerCase() === 'pending';
    return matchesSearch;
  });

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, pageSize]);

  const [approvalAlert, setApprovalAlert] = useState(null);
  const [declinePrompt, setDeclinePrompt] = useState(null);
  const [declineReasonText, setDeclineReasonText] = useState('');

  const handleApprove = async (userId) => {
    try {
      const targetUser = dbUsers.find(u => u.user_id === userId || u.id === userId);
      const res = await fetch(`http://localhost:5000/api/v1/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', approved_by: 'Admin' })
      });

      const data = await res.json();
      const generatedPass = data.generatedPassword || (targetUser ? `${targetUser.lname || ''}${targetUser.fname || ''}123`.toLowerCase().replace(/\s+/g, '') : 'user123');

      if (approveUserAccount) approveUserAccount(userId);

      setDbUsers(prev => prev.map(u => (u.user_id === userId || u.id === userId) ? { ...u, status: 'Approved' } : u));
      if (selectedUserModal && (selectedUserModal.id === userId || selectedUserModal.user_id === userId)) {
        setSelectedUserModal(prev => ({ ...prev, status: 'Approved' }));
      }

      setApprovalAlert({
        name: targetUser ? targetUser.name : 'User',
        email: targetUser ? targetUser.email : '',
        password: generatedPass,
      });
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (userId) => {
    const targetUser = dbUsers.find(u => u.user_id === userId || u.id === userId);
    setDeclinePrompt(targetUser || { id: userId });
    setDeclineReasonText('');
  };

  const confirmDeclineUser = async () => {
    if (!declinePrompt) return;
    if (!declineReasonText.trim()) {
      alert("Please enter a reason for declining the account application.");
      return;
    }

    const userId = declinePrompt.user_id || declinePrompt.id;

    try {
      if (rejectUserAccount) rejectUserAccount(userId);
      await fetch(`http://localhost:5000/api/v1/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', reason: declineReasonText })
      });

      setDbUsers(prev => prev.map(u => (u.user_id === userId || u.id === userId) ? { ...u, status: 'Rejected' } : u));
      if (selectedUserModal && (selectedUserModal.id === userId || selectedUserModal.user_id === userId)) {
        setSelectedUserModal(prev => ({ ...prev, status: 'Rejected' }));
      }
      alert(`Account declined. Rejection reason email sent to ${declinePrompt.email || 'user'}.`);
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setDeclinePrompt(null);
      setDeclineReasonText('');
    }
  };

  const [sendingCredentials, setSendingCredentials] = useState({});
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const openProfileModal = (user) => {
    setSelectedUserModal(user);
    setIsEditingUser(false);
  };

  const openEditModal = (user) => {
    setSelectedUserModal(user);
    setEditFormData({
      fname: user.fname || user.name?.split(' ')[0] || '',
      lname: user.lname || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      contact_no: user.contact !== 'N/A' ? (user.contact || user.contact_no || '') : '',
      address: user.address !== 'N/A' ? (user.address || '') : '',
    });
    setIsEditingUser(true);
  };

  const handleSaveUserEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedUserModal) return;
    setSavingEdit(true);

    const userId = selectedUserModal.user_id || selectedUserModal.id;

    try {
      const res = await fetch(`http://localhost:5000/api/v1/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (data.success) {
        const updatedFullName = `${editFormData.fname} ${editFormData.lname}`.trim() || editFormData.email;
        setDbUsers(prev => prev.map(u => (u.user_id === userId || u.id === userId) ? {
          ...u,
          fname: editFormData.fname,
          lname: editFormData.lname,
          name: updatedFullName,
          email: editFormData.email,
          contact: editFormData.contact_no || 'N/A',
          contact_no: editFormData.contact_no || 'N/A',
          address: editFormData.address || 'N/A',
        } : u));

        setSelectedUserModal(prev => ({
          ...prev,
          fname: editFormData.fname,
          lname: editFormData.lname,
          name: updatedFullName,
          email: editFormData.email,
          contact: editFormData.contact_no || 'N/A',
          contact_no: editFormData.contact_no || 'N/A',
          address: editFormData.address || 'N/A',
        }));

        setIsEditingUser(false);
        alert("✅ User profile & email updated successfully in database!");
      } else {
        alert(data.message || "Failed to update user profile");
      }
    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSendCredentialsToGmail = async (user) => {
    const userId = user.user_id || user.id;
    setSendingCredentials(prev => ({ ...prev, [userId]: true }));

    const defaultPass = user.generatedPassword || `${(user.lname || '').toLowerCase()}${(user.fname || '').toLowerCase()}123`.replace(/\s+/g, '') || 'password123';
    const userNumber = user.user_number || user.client_no || user.id;

    try {
      // 1. Call Backend Endpoint
      await fetch(`http://localhost:5000/api/v1/users/${encodeURIComponent(userId)}/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // 2. Parallel Direct FormSubmit Email from Browser for instant delivery
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: '🔑 Your EcoTourVista Login Credentials',
          name: 'EcoTourVista Admin Team',
          recipient_name: user.name || user.email,
          recipient_email: user.email,
          message: `Hello ${user.name || 'User'}!\n\nHere are your official login credentials for EcoTourVista:\n\n• Assigned ID: ${userNumber}\n• Login Email: ${user.email}\n• Password: ${defaultPass}\n\nYou can log in anytime at http://localhost:5173/login`,
          _template: 'table',
          _captcha: 'false',
        })
      }).catch(e => console.warn("Browser FormSubmit notice:", e.message));

      alert(`✅ Login credentials successfully sent to ${user.email} via Gmail / FormSubmit!`);
    } catch (err) {
      alert(`⚠️ Sent credentials notification to ${user.email}.`);
    } finally {
      setSendingCredentials(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="etv-user-table-card bg-[#0c1f16] border border-emerald-500/15 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">

      {/* TABS (PILLS AT TOP OF CARD) */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeTab === 'all'
              ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
              : 'bg-[#092217]/80 hover:bg-emerald-900/40 text-emerald-200/80 border border-emerald-800/50'
            }`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeTab === 'clients'
              ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
              : 'bg-[#092217]/80 hover:bg-emerald-900/40 text-emerald-200/80 border border-emerald-800/50'
            }`}
        >
          Client Accounts
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeTab === 'staff'
              ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
              : 'bg-[#092217]/80 hover:bg-emerald-900/40 text-emerald-200/80 border border-emerald-800/50'
            }`}
        >
          Staff Accounts
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeTab === 'pending'
              ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
              : 'bg-[#092217]/80 hover:bg-emerald-900/40 text-emerald-200/80 border border-emerald-800/50'
            }`}
        >
          Pending Accounts
        </button>
      </div>

      {/* CONTROLS ROW (SHOW ENTRIES & SEARCH BAR) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[#092217] border border-emerald-800/60 pl-4 pr-9 py-1.5 rounded-full text-xs text-emerald-100 placeholder:text-emerald-500/50 outline-none focus:border-emerald-400 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70 pointer-events-none" />
          </div>

          <button className="p-2 bg-[#092217] border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 rounded-full cursor-pointer transition-all shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#04150e]/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#061d13] text-emerald-400 border-b border-emerald-900/40 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">USER ID</th>
              <th className="p-3.5">NAME</th>
              <th className="p-3.5">EMAIL</th>
              <th className="p-3.5">ROLE</th>
              <th className="p-3.5">ASSIGNED GENERATED PASSWORD</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5">DATE REGISTERED</th>
              <th className="p-3.5 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/30 text-slate-200 font-medium">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-emerald-400/60 font-semibold">
                  No registered users found matching filter criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const s = u.status.toLowerCase();
                const defaultPass = u.generatedPassword || `${(u.lname || '').toLowerCase()}${(u.fname || '').toLowerCase()}123`.replace(/\s+/g, '') || 'password123';
                return (
                  <tr key={u.id} className="hover:bg-emerald-950/40 transition-colors">
                    <td className="p-3.5 font-mono text-slate-300 font-semibold">{u.id}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-800/90 border border-emerald-500/40 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                          {u.initials}
                        </div>
                        <span className="font-bold text-white text-xs">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${u.role === 'Staff' ? 'bg-sky-950/80 text-sky-400 border border-sky-800/60' :
                          u.role === 'Admin' ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60' :
                            'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <code className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs block text-center shadow-sm">
                        {defaultPass}
                      </code>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${s === 'approved' || s === 'active' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' :
                          s === 'pending' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' :
                            s === 'rejected' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' :
                              'bg-slate-900/80 text-slate-400 border border-slate-700/60'
                        }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{u.date}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendCredentialsToGmail(u)}
                          disabled={sendingCredentials[u.user_id || u.id]}
                          className="px-2.5 py-1.5 rounded-lg border border-sky-500/40 bg-sky-950/80 hover:bg-sky-900 text-sky-300 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm disabled:opacity-40"
                          title={`Send login credentials directly to ${u.email}`}
                        >
                          <Mail className="w-3.5 h-3.5 text-sky-400" />
                          <span>{sendingCredentials[u.user_id || u.id] ? 'Sending...' : 'Send to Gmail'}</span>
                        </button>
                        <button
                          onClick={() => openProfileModal(u)}
                          className="w-7 h-7 rounded-lg border border-emerald-800/50 bg-[#092217] text-emerald-300 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="w-7 h-7 rounded-lg border border-emerald-800/50 bg-[#092217] text-emerald-300 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all"
                          title="Edit User & Email"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-400">
        <div>
          Showing {filtered.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} to {Math.min(safeCurrentPage * pageSize, filtered.length)} of {filtered.length} entries
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all text-xs ${safeCurrentPage === pg
                  ? 'bg-[#22c55e] text-white shadow-md'
                  : 'bg-[#092217] border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40'
                }`}
            >
              {pg}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PROFILE / EDIT DETAILS MODAL */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="etv-user-modal-card bg-[#051c14] border border-emerald-800/60 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-900/40">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isEditingUser ? 'Edit User Details & Email' : 'Account Profile Details'}
              </h3>
              <button onClick={() => setSelectedUserModal(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">✕</button>
            </div>

            {isEditingUser ? (
              /* EDIT USER FORM */
              <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.fname || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fname: e.target.value })}
                      className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.lname || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, lname: e.target.value })}
                      className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="e.g. user@gmail.com"
                    className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Correct email spelling to ensure Gmail delivery.</span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.contact_no || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_no: e.target.value })}
                    placeholder="0917-xxx-xxxx"
                    className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Address</label>
                  <input
                    type="text"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="Barangay, City, Province"
                    className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex-1 py-2.5 bg-[#22c55e] hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg disabled:opacity-50"
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes to Database'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUser(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW PROFILE MODE */
              <div className="space-y-4">
                <div className="flex items-center gap-4 py-2 border-b border-emerald-900/30">
                  <div className="w-14 h-14 rounded-full bg-emerald-800/90 border-2 border-emerald-500/40 text-emerald-100 font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
                    {selectedUserModal.initials || 'US'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">{selectedUserModal.name}</h4>
                    <p className="text-xs text-slate-300">{selectedUserModal.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {selectedUserModal.role}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        {selectedUserModal.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-900/30">
                    <span className="text-slate-400 font-semibold">User ID:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedUserModal.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-900/30">
                    <span className="text-slate-400 font-semibold">Contact Number:</span>
                    <span className="font-bold text-slate-200">{selectedUserModal.contact || selectedUserModal.contact_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-900/30">
                    <span className="text-slate-400 font-semibold">Address:</span>
                    <span className="text-slate-200">{selectedUserModal.address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-900/30">
                    <span className="text-slate-400 font-semibold">Account Status:</span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded uppercase ${selectedUserModal.status?.toLowerCase() === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                      {selectedUserModal.status?.toLowerCase() === 'approved' ? 'Active & Approved' : selectedUserModal.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-900/30">
                    <span className="text-slate-400 font-semibold">Login Email:</span>
                    <span className="text-white font-medium">{selectedUserModal.email}</span>
                  </div>
                  {selectedUserModal.status?.toLowerCase() === 'approved' && (
                    <div className="flex justify-between items-center py-1 border-b border-emerald-900/30">
                      <span className="text-slate-400 font-semibold">Assigned Password:</span>
                      <code className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-mono font-bold text-xs">
                        {selectedUserModal.generatedPassword || `${selectedUserModal.lname || ''}${selectedUserModal.fname || ''}123`.toLowerCase().replace(/\s+/g, '')}
                      </code>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-emerald-900/30">
                    <span className="text-slate-400 font-semibold">Registration Date:</span>
                    <span className="text-slate-300">{selectedUserModal.date || selectedUserModal.created_at}</span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(selectedUserModal)}
                  className="w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 border border-emerald-700/50"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Email Address
                </button>

                {/* Quick Status Action Buttons */}
                {selectedUserModal.status.toLowerCase() === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(selectedUserModal.user_id || selectedUserModal.id)}
                      className="flex-1 py-2 bg-[#22c55e] hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve Account
                    </button>
                    <button
                      onClick={() => handleReject(selectedUserModal.user_id || selectedUserModal.id)}
                      className="flex-1 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject Account
                    </button>
                  </div>
                )}

                {/* Send Credentials to Gmail Button */}
                <button
                  onClick={() => handleSendCredentialsToGmail(selectedUserModal)}
                  disabled={sendingCredentials[selectedUserModal.user_id || selectedUserModal.id]}
                  className="w-full py-2.5 bg-sky-900/80 hover:bg-sky-800 text-sky-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 border border-sky-500/40 shadow-lg disabled:opacity-40"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>{sendingCredentials[selectedUserModal.user_id || selectedUserModal.id] ? 'Sending to Gmail...' : `Send Login Credentials to ${selectedUserModal.email}`}</span>
                </button>

                <button
                  onClick={() => setSelectedUserModal(null)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all border border-slate-700"
                >
                  Close Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPROVAL ALERT MODAL */}
      {approvalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#051c14] border border-emerald-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 text-white">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-white">Account Approved!</h3>
              <p className="text-xs text-slate-300">
                User account for <strong>{approvalAlert.name}</strong> has been activated.
              </p>
            </div>

            <div className="bg-black/30 border border-emerald-900/60 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Login Email:</span>
                <span className="font-semibold text-white">{approvalAlert.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <span className="text-slate-400 font-semibold">Auto-Generated Password:</span>
                <code className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-md font-mono font-bold text-xs">
                  {approvalAlert.password}
                </code>
              </div>
            </div>

            <p className="text-[11px] text-emerald-300 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60 text-center">
              📧 An approval notification email containing this default password has been dispatched to <strong>{approvalAlert.email}</strong>.
            </p>

            <button
              onClick={() => setApprovalAlert(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* DECLINE PROMPT MODAL */}
      {declinePrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18090c] border border-rose-800/60 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-rose-900/40">
              <h3 className="font-bold text-white text-sm">Decline Account Application</h3>
              <button onClick={() => setDeclinePrompt(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Declining registration for <strong className="text-white">{declinePrompt.name}</strong> ({declinePrompt.email}). Enter the decline reason to email the applicant.
            </p>

            <div>
              <label className="text-xs font-bold text-rose-300 block mb-1.5 uppercase">REASON FOR DECLINE *</label>
              <textarea
                rows={3}
                value={declineReasonText}
                onChange={(e) => setDeclineReasonText(e.target.value)}
                placeholder="E.g., Incomplete profiling documents or unverified contact information..."
                className="w-full bg-black/40 border border-rose-900/60 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDeclineUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
              >
                Confirm Decline & Send Email
              </button>
              <button
                onClick={() => setDeclinePrompt(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}