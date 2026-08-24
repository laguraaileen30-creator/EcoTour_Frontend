import React, { useState, useEffect } from 'react';
import {
  UserCog, UserCheck, Clock, DollarSign, Edit3, Eye,
  Printer, CheckCircle2, ShieldCheck, Search, Filter, Calendar, X
} from 'lucide-react';
import { getPhilippineDateStr, getPhilippineTimeStr } from '../../../utils/phTime';

export default function StaffTable({ onRefreshStats }) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [selectedLogsStaff, setSelectedLogsStaff] = useState(null);
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState(null);
  const [editStaffModal, setEditStaffModal] = useState(null);
  const [payslipData, setPayslipData] = useState(null);

  // Fetch registered staff from MySQL server
  const fetchStaffFromDatabase = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users?role=staff');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const today = getPhilippineDateStr();
        const formatted = data.users.map((u, i) => {
          const positions = ['Park Maintenance & Lifeguard', 'Duty Cashier & POS Officer', 'Tour & Eco-Guide Officer', 'Resort Receptionist'];
          const pos = u.position || positions[i % positions.length];
          const dailyRate = u.daily_salary || (i % 2 === 0 ? 800 : 750);
          
          return {
            id: u.user_id,
            user_number: u.user_number || u.client_no || `STF-2026-0000${u.user_id}`,
            name: `${u.fname || ''} ${u.lname || ''}`.trim() || u.email,
            email: u.email,
            contact: u.contact_no || '09945122977',
            position: pos,
            dailySalary: dailyRate,
            status: u.status || 'Approved',
            clockedIn: i % 2 === 0,
            clockInTime: i % 2 === 0 ? '08:00 AM' : null,
            clockOutTime: null,
            attendanceHistory: [
              { date: today, timeIn: '08:00 AM', timeOut: i % 2 === 0 ? 'On Duty' : '05:00 PM', hours: 8, status: 'Present' },
              { date: '2026-08-10', timeIn: '08:00 AM', timeOut: '05:00 PM', hours: 8, status: 'Present' },
              { date: '2026-08-09', timeIn: '08:15 AM', timeOut: '05:00 PM', hours: 7.75, status: 'Present' },
              { date: '2026-08-08', timeIn: '08:00 AM', timeOut: '05:00 PM', hours: 8, status: 'Present' },
            ]
          };
        });
        setStaffMembers(formatted);
        if (onRefreshStats) onRefreshStats(formatted);
      }
    } catch (e) {
      console.warn("Error fetching staff accounts:", e.message);
    }
  };

  useEffect(() => {
    fetchStaffFromDatabase();
  }, []);

  // Clock In / Clock Out Handler
  const handleToggleClock = (staffId) => {
    const nowTime = getPhilippineTimeStr();
    const today = getPhilippineDateStr();

    setStaffMembers(prev => prev.map(s => {
      if (s.id === staffId) {
        const isClockingIn = !s.clockedIn;
        const updatedHistory = (s.attendanceHistory || []).map(h => {
          if (h.date === today) {
            return isClockingIn 
              ? { ...h, timeIn: nowTime, timeOut: 'On Duty', status: 'Present' }
              : { ...h, timeOut: nowTime, status: 'Clocked Out' };
          }
          return h;
        });

        if (!updatedHistory.some(h => h.date === today) && isClockingIn) {
          updatedHistory.unshift({ date: today, timeIn: nowTime, timeOut: 'On Duty', hours: 8, status: 'Present' });
        }

        return {
          ...s,
          clockedIn: isClockingIn,
          clockInTime: isClockingIn ? nowTime : s.clockInTime,
          clockOutTime: !isClockingIn ? nowTime : s.clockOutTime,
          attendanceHistory: updatedHistory
        };
      }
      return s;
    }));
  };

  // Generate Payslip
  const handleOpenPayslip = (staff) => {
    const daysWorked = 15; // Standard 15-day cut-off period
    const grossPay = staff.dailySalary * daysWorked;
    const sss = 350.00;
    const philhealth = 200.00;
    const pagibig = 100.00;
    const totalDeductions = sss + philhealth + pagibig;
    const netPay = grossPay - totalDeductions;

    setPayslipData({
      payslipNo: `PAY-2026-${String(staff.id).padStart(4, '0')}`,
      staff,
      period: 'August 1, 2026 - August 15, 2026',
      daysWorked,
      dailyRate: staff.dailySalary,
      grossPay,
      sss,
      philhealth,
      pagibig,
      totalDeductions,
      netPay,
      issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  // Update Staff Details
  const handleSaveEditStaff = (e) => {
    e.preventDefault();
    if (!editStaffModal) return;

    setStaffMembers(prev => prev.map(s => s.id === editStaffModal.id ? editStaffModal : s));
    setEditStaffModal(null);
  };

  // Filter staff
  const filteredStaff = staffMembers.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = s.name.toLowerCase().includes(q) || s.user_number.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchesPos = filterPosition === 'all' || s.position.toLowerCase().includes(filterPosition.toLowerCase());
    return matchesQuery && matchesPos;
  });

  return (
    <div className="etv-staff-table-card bg-[#0c1f16] border border-emerald-500/15 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl text-white">

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-400" /> Staff Roster & Attendance Roster
          </h3>
          <p className="text-xs text-slate-300">Duty shift status, clock-in logs, and official salary payslip generation</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name or ID..."
              className="w-full bg-[#092217] border border-emerald-800/60 pl-4 pr-9 py-1.5 rounded-full text-xs text-emerald-100 placeholder:text-emerald-500/50 outline-none focus:border-emerald-400 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70 pointer-events-none" />
          </div>

          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-full px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">All Positions</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cashier">Cashier</option>
            <option value="Guide">Eco-Guide</option>
            <option value="Receptionist">Receptionist</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#04150e]/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#061d13] text-emerald-400 border-b border-emerald-900/40 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">STAFF ID</th>
              <th className="p-3.5">STAFF MEMBER</th>
              <th className="p-3.5">ASSIGNED POSITION</th>
              <th className="p-3.5 text-right">DAILY RATE</th>
              <th className="p-3.5 text-center">DUTY STATUS</th>
              <th className="p-3.5 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/30 text-slate-200 font-medium">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-emerald-400/60 font-semibold">
                  No registered staff accounts found.
                </td>
              </tr>
            ) : (
              filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-emerald-950/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-300 font-bold">{s.user_number}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-800/90 border border-emerald-500/40 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                        {s.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">{s.name}</span>
                        <span className="text-[10px] text-slate-400 block">{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300 font-medium">{s.position}</td>
                  <td className="p-3.5 text-right font-mono font-extrabold text-emerald-400">
                    ₱{Number(s.dailySalary).toLocaleString('en-US', { minimumFractionDigits: 2 })} / day
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1.5 shadow-sm ${
                      s.clockedIn 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    }`}>
                      {s.clockedIn ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                      {s.clockedIn ? `Clocked In (${s.clockInTime})` : 'Off Duty'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleToggleClock(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm ${
                          s.clockedIn 
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
                        }`}
                      >
                        {s.clockedIn ? 'Clock Out' : 'Clock In'}
                      </button>

                      <button
                        onClick={() => setSelectedLogsStaff(s)}
                        className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/60 text-emerald-300 hover:border-emerald-400 cursor-pointer transition-all"
                        title="View Attendance History"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenPayslip(s)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900 cursor-pointer font-bold text-xs flex items-center gap-1"
                        title="Generate Salary Payslip"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Payslip
                      </button>

                      <button
                        onClick={() => setEditStaffModal(s)}
                        className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/60 text-emerald-300 hover:border-emerald-400 cursor-pointer transition-all"
                        title="Edit Staff Position & Rate"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ATTENDANCE HISTORY LOGS */}
      {selectedLogsStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#051c14] border border-emerald-500/40 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-emerald-900/40">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Attendance Logs History</h3>
                  <p className="text-xs text-slate-300">{selectedLogsStaff.name} ({selectedLogsStaff.user_number})</p>
                </div>
              </div>
              <button onClick={() => setSelectedLogsStaff(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedLogsStaff.attendanceHistory.map((log, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-emerald-900/50 text-xs">
                  <div>
                    <span className="font-bold text-white block">{log.date}</span>
                    <span className="text-[11px] text-slate-400">In: {log.timeIn} | Out: {log.timeOut}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold block">{log.hours} hrs</span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedLogsStaff(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close Attendance Logs
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL SALARY PAYSLIP RECEIPT */}
      {payslipData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border-2 border-emerald-600 p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h2 className="font-black text-xl text-emerald-800 uppercase tracking-wide">Duangon Cold Spring Resort</h2>
              <p className="text-xs text-slate-600">Barangay Duangon, Bilar, Bohol, Philippines</p>
              <h3 className="font-extrabold text-sm text-slate-900 mt-2 uppercase tracking-wider">OFFICIAL STAFF SALARY PAYSLIP</h3>
              <p className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">PAYSLIP NO: {payslipData.payslipNo}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Employee Name:</span> <strong className="text-slate-900 block">{payslipData.staff.name}</strong></div>
              <div><span className="text-slate-500">Staff ID:</span> <strong className="text-slate-900 font-mono block">{payslipData.staff.user_number}</strong></div>
              <div><span className="text-slate-500">Designation:</span> <strong className="text-slate-900 block">{payslipData.staff.position}</strong></div>
              <div><span className="text-slate-500">Pay Period:</span> <strong className="text-slate-900 block">{payslipData.period}</strong></div>
            </div>

            {/* Calculations Table */}
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Details</th>
                  <th className="p-2 text-right">Amount (PHP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="p-2 font-bold text-slate-800">Basic Daily Rate</td>
                  <td className="p-2 text-right">₱{payslipData.dailyRate.toFixed(2)} / day</td>
                  <td className="p-2 text-right font-mono font-bold">₱{payslipData.dailyRate.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-slate-800">Total Days Worked (Cut-off)</td>
                  <td className="p-2 text-right">{payslipData.daysWorked} Days</td>
                  <td className="p-2 text-right font-mono font-bold">₱{payslipData.grossPay.toFixed(2)}</td>
                </tr>
                <tr className="bg-rose-50/50">
                  <td className="p-2 text-slate-700">SSS Contribution Deduction</td>
                  <td className="p-2 text-right text-slate-500">Statutory</td>
                  <td className="p-2 text-right font-mono text-rose-600">-₱{payslipData.sss.toFixed(2)}</td>
                </tr>
                <tr className="bg-rose-50/50">
                  <td className="p-2 text-slate-700">PhilHealth Contribution Deduction</td>
                  <td className="p-2 text-right text-slate-500">Statutory</td>
                  <td className="p-2 text-right font-mono text-rose-600">-₱{payslipData.philhealth.toFixed(2)}</td>
                </tr>
                <tr className="bg-rose-50/50">
                  <td className="p-2 text-slate-700">Pag-IBIG Contribution Deduction</td>
                  <td className="p-2 text-right text-slate-500">Statutory</td>
                  <td className="p-2 text-right font-mono text-rose-600">-₱{payslipData.pagibig.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Net Salary Highlight Box */}
            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase block">NET SALARY PAYOUT</span>
                <span className="text-[10px] text-emerald-700">Paid in full via Resort Cashier</span>
              </div>
              <span className="text-xl font-black font-mono text-emerald-700">₱{payslipData.netPay.toFixed(2)}</span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">Duty Resort Cashier</div>
                <span className="text-[10px] text-slate-500">Authorized Signature</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">{payslipData.staff.name}</div>
                <span className="text-[10px] text-slate-500">Employee Signature</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Official Payslip
              </button>
              <button
                onClick={() => setPayslipData(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT STAFF DETAILS */}
      {editStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditStaff} className="bg-[#051c14] border border-emerald-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-900/40">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" /> Edit Staff Position & Daily Rate
              </h3>
              <button type="button" onClick={() => setEditStaffModal(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Staff Member</label>
              <input type="text" value={editStaffModal.name} disabled className="w-full bg-[#04150e] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-slate-400 font-bold cursor-not-allowed" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Assigned Position</label>
              <input
                type="text"
                value={editStaffModal.position}
                onChange={(e) => setEditStaffModal(prev => ({ ...prev, position: e.target.value }))}
                required
                className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Daily Salary Rate (PHP)</label>
              <input
                type="number"
                step="50"
                value={editStaffModal.dailySalary}
                onChange={(e) => setEditStaffModal(prev => ({ ...prev, dailySalary: Number(e.target.value) }))}
                required
                className="w-full bg-[#092217] border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md">
                Save Staff Updates
              </button>
              <button type="button" onClick={() => setEditStaffModal(null)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}