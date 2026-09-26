import React, { useRef } from 'react';
import {
  Printer,
  Download,
  CheckCircle,
  Copy,
  X,
  ShieldCheck,
  Building,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { PaymentTransaction } from '../types';

interface ReceiptModalProps {
  receipt: PaymentTransaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const numberToWords = (num: number): string => {
    const a = [
      '',
      'One ',
      'Two ',
      'Three ',
      'Four ',
      'Five ',
      'Six ',
      'Seven ',
      'Eight ',
      'Nine ',
      'Ten ',
      'Eleven ',
      'Twelve ',
      'Thirteen ',
      'Fourteen ',
      'Fifteen ',
      'Sixteen ',
      'Seventeen ',
      'Eighteen ',
      'Nineteen ',
    ];
    const b = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    const convertTens = (val: number): string => {
      if (val < 20) return a[val] || '';
      const tens = Math.floor(val / 10);
      const units = val % 10;
      return (b[tens] || '') + (units ? ' ' + a[units] : ' ');
    };

    if (num === 0) return 'Zero Rupees Only';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor((num % 1000) / 100);
    const remainder = num % 100;

    let res = '';
    if (crore > 0) res += convertTens(crore) + 'Crore ';
    if (lakh > 0) res += convertTens(lakh) + 'Lakh ';
    if (thousand > 0) res += convertTens(thousand) + 'Thousand ';
    if (hundred > 0) res += a[hundred] + 'Hundred ';
    if (remainder > 0) {
      if (res !== '') res += 'and ';
      res += convertTens(remainder);
    }

    return res.trim() + ' Rupees Only';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(receipt.digitalStampCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${receipt.receiptNo}_Verified.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Official University Digital E-Receipt</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              VERIFIED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div ref={printableRef} className="p-6 sm:p-8 text-slate-900 bg-white relative">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="text-9xl font-black uppercase text-slate-900 rotate-[-25deg]">
              PAID & VERIFIED
            </span>
          </div>

          {/* Institutional Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-bold border-2 border-amber-500 shadow-sm">
                  NIST
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950 font-serif">
                    NATIONAL INSTITUTE OF SCIENCE & TECHNOLOGY
                  </h1>
                  <p className="text-xs text-slate-600 uppercase font-semibold tracking-wider">
                    Autonomous Institute of National Standing • Division of Finance & Accounts
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    University Administrative Complex, North Campus, Pune - 411007, Maharashtra
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
                  ORIGINAL COUNTERFOIL
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  Receipt No: <span className="font-bold text-slate-800">{receipt.receiptNo}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Date: {new Date(receipt.paymentDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 tracking-wide uppercase">
                Semester Fee Clearance Voucher • {receipt.academicSession}
              </span>
              <span className="font-mono text-slate-500">
                Challan/Scroll Ref: <strong className="text-slate-800">{receipt.transactionRef}</strong>
              </span>
            </div>
          </div>

          {/* Student Particulars 2-Column Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Student Full Name
              </span>
              <span className="font-bold text-slate-900 text-sm">{receipt.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Permanent Roll No
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {receipt.studentRollNo}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Program & Branch
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {receipt.program} ({receipt.branch.split(' ')[0]})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Academic Semester
              </span>
              <span className="font-bold text-slate-800">Semester {receipt.semester}</span>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Fee Component / Head of Account</th>
                  <th className="py-2.5 px-4 text-center">Session</th>
                  <th className="py-2.5 px-4 text-right">Amount Cleared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipt.feeBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.label}</td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                      Sem {receipt.semester}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                  <td colSpan={3} className="py-3 px-4 text-right text-slate-700 uppercase">
                    Total Amount Received & Reconciled:
                  </td>
                  <td className="py-3 px-4 text-right text-base text-emerald-800 font-mono">
                    {formatCurrency(receipt.amountPaid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in words & Payment Details */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 mb-6 text-xs">
            <div className="text-slate-600">
              <span className="font-semibold text-slate-800 uppercase text-[10px] tracking-wider mr-2">
                Amount In Words:
              </span>
              <strong className="text-slate-900 font-serif italic">
                {numberToWords(receipt.amountPaid)}
              </strong>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-y-1">
              <div>
                Mode of Remittance:{' '}
                <strong className="text-slate-800 font-mono uppercase">
                  {receipt.paymentMethod.replace('_', ' ')}
                </strong>
                {receipt.bankName && ` • Bank: ${receipt.bankName}`}
              </div>
              <div>
                Transaction Ref: <strong className="font-mono text-slate-800">{receipt.transactionRef}</strong>
              </div>
            </div>
          </div>

          {/* Verification, Stamp & Signatures */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* QR Code & Digital Digest */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 bg-white flex items-center justify-center shadow-inner">
                {/* Visual SVG QR Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <rect x="5" y="5" width="28" height="28" fill="currentColor" />
                  <rect x="10" y="10" width="18" height="18" fill="white" />
                  <rect x="14" y="14" width="10" height="10" fill="currentColor" />

                  <rect x="67" y="5" width="28" height="28" fill="currentColor" />
                  <rect x="72" y="10" width="18" height="18" fill="white" />
                  <rect x="76" y="14" width="10" height="10" fill="currentColor" />

                  <rect x="5" y="67" width="28" height="28" fill="currentColor" />
                  <rect x="10" y="72" width="18" height="18" fill="white" />
                  <rect x="14" y="76" width="10" height="10" fill="currentColor" />

                  <rect x="40" y="10" width="8" height="16" fill="currentColor" />
                  <rect x="52" y="15" width="8" height="10" fill="currentColor" />
                  <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                  <rect x="45" y="45" width="10" height="10" fill="white" />
                  <rect x="68" y="45" width="14" height="8" fill="currentColor" />
                  <rect x="40" y="70" width="12" height="16" fill="currentColor" />
                  <rect x="70" y="70" width="20" height="20" fill="currentColor" />
                  <rect x="80" y="80" width="6" height="6" fill="white" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-500">
                <span className="font-semibold block text-slate-800">Scan to Verify</span>
                <span className="font-mono block truncate max-w-[140px] text-[9px] text-slate-400">
                  {receipt.digitalStampCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="mt-0.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>

            {/* Official Circular Digital Seal */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-emerald-600/70 p-1 flex flex-col items-center justify-center text-center text-[8px] font-bold uppercase text-emerald-800 tracking-tighter bg-emerald-50/40 rotate-[-8deg] shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-0.5" />
                <span>NIST ACCOUNTS</span>
                <span className="text-[9px] text-emerald-700">VERIFIED</span>
                <span className="font-mono text-[7px] text-slate-500">
                  {receipt.verifiedAt
                    ? new Date(receipt.verifiedAt).toLocaleDateString()
                    : 'AUTOMATED'}
                </span>
              </div>
            </div>

            {/* Bursar Digital Signature */}
            <div className="text-right text-xs">
              <div className="font-serif italic text-base text-slate-800 tracking-wide">
                Dr. S. K. Mukherjee
              </div>
              <div className="font-bold text-slate-900 text-[11px] mt-0.5">
                Accounts Officer & Joint Bursar
              </div>
              <div className="text-[10px] text-slate-500">
                Division of Academic Finance • NIST Pune
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-1">
                Cert ID: BURSAR-SIGN-2024/99182
              </div>
            </div>
          </div>

          {/* Legal / Statutory Compliance Footer */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] text-slate-400 text-center leading-relaxed">
            Note: This e-receipt is an authorized digital instrument under Section 65B of the Indian Evidence Act.
            It is valid for Income Tax 80E Rebate, Employer Reimbursements, and Bank Education Loan Disbursements.
            Retain this voucher till graduation. For discrepancy, contact Counter #1 within 7 banking days.
          </div>
        </div>
      </div>
    </div>
  );
};
