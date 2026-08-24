import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, Trees, FileText } from 'lucide-react';
import './OfficialReceiptModal.css';
import { getPhilippineDateStr, getPhilippineTimeStr } from '../../../utils/phTime';

export default function OfficialReceiptModal({ receiptData, onClose }) {
  const printRef = useRef(null);

  if (!receiptData) return null;

  // Standard Normalized Receipt Fields
  const receiptNo = receiptData.receiptNo || receiptData.receipt_no || receiptData.bookingRef || receiptData.booking_number || `OR-2026-${String(receiptData.id || 101).padStart(6, '0')}`;
  const clientName = receiptData.clientName || receiptData.client_name || receiptData.touristName || receiptData.fullName || 'Walk-In Guest Tourist';
  const userNo = receiptData.userNumber || receiptData.client_no || receiptData.user_number || 'CLT-2026-000001';
  const dateStr = receiptData.date || receiptData.bookingDate || receiptData.reservationDate || getPhilippineDateStr();
  const timeStr = receiptData.time || receiptData.arrivalTime || receiptData.timeSlot || getPhilippineTimeStr();
  const paymentMethod = receiptData.paymentMethod || receiptData.payment_method || receiptData.method || 'CASH';
  const status = receiptData.status || 'PAID';
  const cashierName = receiptData.staffName || receiptData.cashier || 'Duty Cashier';

  const rawItems = receiptData.items && receiptData.items.length > 0 ? receiptData.items : [
    {
      name: receiptData.serviceName || receiptData.packageName || 'Duangon Cold Spring Entrance & Day Pass',
      quantity: receiptData.totalVisitors || receiptData.pax || receiptData.quantity || 1,
      unitPrice: (receiptData.totalPrice || receiptData.grandTotal || receiptData.total_amount || 0) / Math.max(1, (receiptData.totalVisitors || receiptData.pax || 1)),
      subtotal: parseFloat(receiptData.totalPrice || receiptData.grandTotal || receiptData.total_amount || 0)
    }
  ];

  const grandTotal = parseFloat(receiptData.grandTotal || receiptData.totalPrice || receiptData.total_amount || receiptData.amount || 0);
  const cashReceived = parseFloat(receiptData.cashReceived || receiptData.tendered || grandTotal);
  const change = Math.max(0, cashReceived - grandTotal);

  const parkShare = (grandTotal * 0.70).toFixed(2);
  const barangayShare = (grandTotal * 0.20).toFixed(2);
  const municipalShare = (grandTotal * 0.10).toFixed(2);

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'left=0,top=0,width=850,height=950,toolbar=0,scrollbars=1,status=0');
    if (windowPrint) {
      windowPrint.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Official Receipt - ${receiptNo}</title>
            <style>
              @page { size: auto; margin: 15mm; }
              body { font-family: Arial, sans-serif; padding: 20px; color: #111; background: #fff; line-height: 1.4; font-size: 13px; }
              .or-wrapper { border: 2px solid #111; padding: 25px; width: 100%; max-width: 720px; margin: 0 auto; border-radius: 8px; }
              .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 15px; }
              .header h2 { margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
              .header p { margin: 2px 0; font-size: 12px; color: #444; }
              .or-badge { font-family: monospace; font-size: 14px; font-weight: bold; margin-top: 8px; display: inline-block; padding: 4px 14px; border: 1.5px solid #111; border-radius: 4px; background: #f0fdf4; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; }
              .meta-grid strong { display: block; font-size: 13px; color: #000; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
              th, td { padding: 9px 12px; text-align: left; border-bottom: 1px solid #cbd5e1; }
              th { background: #f1f5f9; text-transform: uppercase; font-size: 11px; font-weight: bold; }
              .text-right { text-align: right !important; }
              .text-center { text-align: center !important; }
              .lgu-box { background: #f0fdf4; padding: 12px 16px; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 12px; margin-bottom: 15px; }
              .lgu-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
              .total-box { border: 2px solid #15803d; padding: 14px; border-radius: 8px; font-size: 14px; background: #f0fdf4; margin-bottom: 15px; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
              .grand-amount { font-size: 20px; font-weight: bold; color: #15803d; font-family: monospace; }
              .footer-notice { text-align: center; font-size: 11px; font-style: italic; color: #64748b; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="or-wrapper">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      windowPrint.document.close();
      windowPrint.focus();
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 300);
    } else {
      window.print();
    }
  };

  return (
    <div className="etv-or-backdrop print:p-0 print:bg-white print:static">
      
      {/* PERFECT MODAL CARD CONTAINER */}
      <div className="etv-or-card">
        
        {/* ALWAYS PINNED TOP HEADER BAR */}
        <div className="etv-or-topbar print:hidden">
          <div className="flex items-center gap-3 text-emerald-400">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                Official Resort Receipt
              </h3>
              <p className="text-xs text-emerald-300/80">Duangon Cold Spring Resort Sales & Billing Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-emerald-900/50 transition-colors cursor-pointer"
            title="Close Receipt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE RECEIPT CONTENT BODY */}
        <div className="etv-or-body custom-scrollbar" ref={printRef}>
          
          {/* RECEIPT HEADER */}
          <div className="etv-or-header">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 mb-1">
              <Trees className="w-7 h-7" />
            </div>
            <h2>DUANGON COLD SPRING RESORT</h2>
            <p>Poblacion, Zamora, Bilar, Bohol, Philippines</p>
            <p className="font-mono text-xs opacity-75">Official BIR Registered Receipt • EcoTourVista System</p>
            
            <div className="etv-or-badge">
              OR NO: {receiptNo}
            </div>
          </div>

          {/* CUSTOMER & TRANSACTION METADATA */}
          <div className="etv-or-meta-grid">
            <div className="etv-or-meta-item">
              <span className="label">Customer Name</span>
              <strong className="truncate">{clientName}</strong>
              <small className="text-emerald-400 font-mono text-[10px]">ID: {userNo}</small>
            </div>
            <div className="etv-or-meta-item">
              <span className="label">Date & Time</span>
              <strong>{dateStr}</strong>
              <small className="text-emerald-300 font-semibold text-[10px]">{timeStr}</small>
            </div>
            <div className="etv-or-meta-item">
              <span className="label">Payment Method</span>
              <strong className="text-emerald-300">{paymentMethod}</strong>
            </div>
            <div className="etv-or-meta-item">
              <span className="label">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold text-xs sm:text-sm mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {status}
              </span>
            </div>
          </div>

          {/* ITEMIZED PARTICULAR SERVICES TABLE */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              Itemized Particulars & Services
            </span>
            <div className="etv-or-table-container">
              <table className="etv-or-table">
                <thead>
                  <tr>
                    <th>Particulars / Service Description</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {rawItems.map((item, idx) => {
                    const q = parseInt(item.quantity || 1, 10);
                    const p = parseFloat(item.unitPrice || item.price || 0);
                    const sub = parseFloat(item.subtotal || (q * p) || 0);
                    return (
                      <tr key={idx}>
                        <td className="font-semibold text-white">{item.name || item.service_name || 'Resort Day Pass Ticket'}</td>
                        <td className="text-center font-mono font-bold text-emerald-300">{q}</td>
                        <td className="text-right font-mono opacity-80">₱{p.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right font-mono font-extrabold text-emerald-400">₱{sub.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* REVENUE SHARE DISTRIBUTION */}
          <div className="etv-or-lgu-box">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              LGU Revenue Share Distribution
            </span>
            <div className="etv-or-lgu-row">
              <span>Resort Operator (70%):</span>
              <strong className="font-mono text-white">₱{parkShare}</strong>
            </div>
            <div className="etv-or-lgu-row">
              <span>Barangay Environmental Share (20%):</span>
              <strong className="font-mono text-white">₱{barangayShare}</strong>
            </div>
            <div className="etv-or-lgu-row">
              <span>Municipal / Guide Association (10%):</span>
              <strong className="font-mono text-white">₱{municipalShare}</strong>
            </div>
          </div>

          {/* TOTALS & PAYMENT COMPUTATION */}
          <div className="etv-or-total-box">
            <div className="etv-or-total-row">
              <span className="font-extrabold text-white uppercase tracking-wider text-sm sm:text-base">TOTAL AMOUNT PAID:</span>
              <strong className="etv-or-grand-amount">
                ₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="flex justify-between text-xs text-slate-300 border-t border-emerald-800/60 pt-2.5 mt-2.5">
              <span>Cash Tendered:</span>
              <span className="font-mono font-bold text-white">₱{cashReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-300 font-extrabold mt-1">
              <span>Change Amount:</span>
              <span className="font-mono">₱{change.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* SIGNATURE AREA & FOOTER */}
          <div className="etv-or-footer-sig">
            <div className="text-[11px] text-slate-400">
              <p className="font-bold text-slate-300">Cashier: {cashierName}</p>
              <p className="italic mt-0.5">Thank you for visiting Duangon Cold Spring Resort!</p>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-white/60 mb-1"></div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Authorized Signature</span>
            </div>
          </div>

          <p className="etv-or-notice">
            *** THIS RECEIPT SERVES AS OFFICIAL RECORD OF TRANSACTION ***
          </p>

        </div>

        {/* ALWAYS PINNED BOTTOM ACTION BAR */}
        <div className="etv-or-bottombar print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/70 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Official Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
