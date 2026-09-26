import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  Eye,
  Send,
  Building,
  DollarSign,
  Users,
  Check,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentTransaction, ScholarshipApplication, ScholarshipStage } from '../types';
import { ReceiptModal } from './ReceiptModal';

export const AdminDashboard: React.FC = () => {
  const {
    adminProfile,
    studentsList,
    calculateStudentDues,
    transactions,
    scholarships,
    approveTransaction,
    rejectTransaction,
    updateScholarshipStage,
    getDefaultersList,
    exportDefaulterCSV,
    sendDefaulterReminder,
    reminderSentList,
    selectedReceipt,
    setSelectedReceipt,
    loginAsStudent,
  } = useApp();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'reconciliation' | 'approval_queue' | 'defaulters' | 'scholarships'
  >('reconciliation');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal for challan proof viewing
  const [inspectTx, setInspectTx] = useState<PaymentTransaction | null>(null);
  const [rejectionTx, setRejectionTx] = useState<PaymentTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Selected Defaulter for Printable Notice
  const [noticeStudent, setNoticeStudent] = useState<any | null>(null);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  // University-wide metrics
  const totalVerifiedCollection = transactions
    .filter((t) => t.status === 'VERIFIED')
    .reduce((sum, t) => sum + t.amountPaid, 0);

  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING_APPROVAL');

  const defaulters = getDefaultersList();
  const totalOutstandingBalance = defaulters.reduce((sum, d) => sum + d.outstandingBalance, 0);

  const totalScholarshipSanctioned = scholarships.reduce(
    (sum, s) => sum + s.sanctionedAmount,
    0
  );

  // Filtered Students for Reconciliation Ledger
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = branchFilter === 'ALL' || s.branch.includes(branchFilter);

    const dues = calculateStudentDues(s.id);
    let matchesStatus = true;
    if (statusFilter === 'PAID') matchesStatus = dues.pendingBalance === 0;
    if (statusFilter === 'PENDING') matchesStatus = dues.pendingBalance > 0 && !dues.isOverdue;
    if (statusFilter === 'OVERDUE') matchesStatus = dues.isOverdue;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleApprove = (txId: string) => {
    approveTransaction(txId);
    setInspectTx(null);
  };

  const handleReject = () => {
    if (rejectionTx) {
      rejectTransaction(rejectionTx.id, rejectionReason || 'Counterfoil details mismatch with bank scroll.');
      setRejectionTx(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Officer Header Card */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-850 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-700 shrink-0">
              <img
                src={adminProfile.avatarUrl}
                alt={adminProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
                  {adminProfile.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {adminProfile.officerId}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                  {adminProfile.designation}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {adminProfile.department} • {adminProfile.deskCounter}
              </p>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                <span>Official Contact: <strong className="text-slate-200">{adminProfile.phone}</strong></span>
                <span>•</span>
                <span>Statutory Authority: <strong className="text-slate-200">Joint Bursar & Cashier Desk</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportDefaulterCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Defaulter Ledger (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 Core Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Total Fees Collected
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {formatCurrency(totalVerifiedCollection)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reconciled across {transactions.filter((t) => t.status === 'VERIFIED').length} vouchers</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Total Outstanding Balance
            </span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {formatCurrency(totalOutstandingBalance)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Across <strong className="text-white">{defaulters.length}</strong> students with pending dues
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                Pending Approval Queue
              </span>
              {pendingTransactions.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
              {pendingTransactions.length} Remittances
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Offline Challans & NEFT transfers awaiting scrutiny
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Scholarship Grants Cleared
            </span>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
              {formatCurrency(totalScholarshipSanctioned)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {scholarships.length} Central, State & Endowment claims
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reconciliation'
                ? 'border-blue-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Fee Reconciliation Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('approval_queue')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approval_queue'
                ? 'border-blue-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Payment Approval Queue</span>
            {pendingTransactions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {pendingTransactions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('defaulters')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'defaulters'
                ? 'border-blue-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Defaulter List & Demand Notices</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-bold text-[10px]">
              {defaulters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scholarships')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scholarships'
                ? 'border-blue-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Scholarship Disbursement Clearing</span>
          </button>
        </div>

        {/* TAB 1: STUDENT FEE RECONCILIATION LEDGER */}
        {activeTab === 'reconciliation' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-xs"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Computer">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-xs"
                >
                  <option value="ALL">All Dues Status</option>
                  <option value="PAID">Fully Paid</option>
                  <option value="PENDING">Pending Balance</option>
                  <option value="OVERDUE">Overdue / Defaulter</option>
                </select>
              </div>
            </div>

            {/* Reconciliation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold text-[10px] tracking-wider bg-slate-850">
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4">Branch & Sem</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Total Tariff</th>
                    <th className="py-3 px-4 text-right">Paid / Adjusted</th>
                    <th className="py-3 px-4 text-right">Outstanding Dues</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredStudents.map((std) => {
                    const dues = calculateStudentDues(std.id);
                    return (
                      <tr key={std.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {std.rollNo}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-100 block">{std.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{std.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-200 block">{std.branch.split(' ')[0]}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Sem {std.semester}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                            {std.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {formatCurrency(dues.totalFee)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                          {formatCurrency(dues.amountPaid)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {dues.pendingBalance === 0 ? (
                            <span className="text-slate-500 font-normal">₹0 (Cleared)</span>
                          ) : dues.isOverdue ? (
                            <span className="text-red-400">{formatCurrency(dues.pendingBalance)}</span>
                          ) : (
                            <span className="text-amber-400">{formatCurrency(dues.pendingBalance)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {dues.pendingBalance === 0 ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                              CLEARED
                            </span>
                          ) : dues.isOverdue ? (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[10px] font-bold">
                              DEF-OVERDUE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => loginAsStudent(std.id)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                            title="Inspect student's view"
                          >
                            Inspect Desk
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING PAYMENT APPROVAL QUEUE */}
        {activeTab === 'approval_queue' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div>
                <h3 className="font-bold text-base text-white">
                  Counterfoil Verification Queue (Counter #3)
                </h3>
                <p className="text-xs text-slate-400">
                  Verify student bank challan counterfoils against campus bank scroll statements before issuing official e-receipts.
                </p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
                {pendingTransactions.length} Awaiting Clearance
              </span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-850/60 rounded-xl border border-slate-700/60">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Queue is clear!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  All submitted offline challans and NEFT transfers have been audited and reconciled.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-850 border border-slate-700 rounded-xl p-5 space-y-4 shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{tx.studentName}</span>
                          <span className="font-mono text-xs text-blue-400 font-semibold">
                            {tx.studentRollNo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {tx.program} ({tx.branch.split(' ')[0]}) • Semester {tx.semester}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-mono">Amount Remitted</span>
                        <span className="text-lg font-bold font-mono text-emerald-400">
                          {formatCurrency(tx.amountPaid)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-750 p-3 rounded-lg text-xs space-y-1.5 font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Method:</span>
                        <span className="text-white font-bold">{tx.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Scroll / UTR Ref:</span>
                        <span className="text-amber-400 font-bold">{tx.transactionRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deposit Bank:</span>
                        <span className="text-slate-300">{tx.bankName || 'SBI Campus Branch'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Submitted On:</span>
                        <span className="text-slate-400">
                          {new Date(tx.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Counterfoil Thumbnail */}
                    {tx.challanSlipUrl && (
                      <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-lg border border-slate-750">
                        <img
                          src={tx.challanSlipUrl}
                          alt="Challan Slip"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-600 shadow-sm"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-200 block">
                            Bank Stamped Counterfoil Slip
                          </span>
                          <button
                            onClick={() => setInspectTx(tx)}
                            className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect Full Slip & Details</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-750">
                      <button
                        onClick={() => setRejectionTx(tx)}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(tx.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Issue E-Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEFAULTER LIST & DEMAND NOTICES */}
        {activeTab === 'defaulters' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-base text-white">
                    Defaulter List & Statutory Demurrage Ledger
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Students with unpaid semester dues past the grace deadline. Generate official demand notices or export data.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportDefaulterCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Defaulter List (CSV)</span>
                </button>
              </div>
            </div>

            {defaulters.length === 0 ? (
              <div className="p-8 text-center bg-slate-850/60 rounded-xl border border-slate-700/60">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No active fee defaulters!</p>
                <p className="text-xs text-slate-400 mt-0.5">All students have cleared semester dues on time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold text-[10px] tracking-wider bg-slate-850">
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Branch & Sem</th>
                      <th className="py-3 px-4 text-right">Outstanding Fee</th>
                      <th className="py-3 px-4 text-center">Due Date</th>
                      <th className="py-3 px-4 text-center">Days Overdue</th>
                      <th className="py-3 px-4 text-right">Late Fine</th>
                      <th className="py-3 px-4 text-center">Notice Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {defaulters.map((d) => (
                      <tr key={d.studentId} className="hover:bg-slate-750/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{d.rollNo}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-100 block">{d.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{d.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-200">{d.branch.split(' ')[0]}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Sem {d.semester}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-red-400">
                          {formatCurrency(d.outstandingBalance)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300 text-[11px]">
                          {d.dueDate}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {d.daysOverdue > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold font-mono">
                              +{d.daysOverdue} Days
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-300 font-semibold">
                          +{formatCurrency(d.lateFineAccrued)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {reminderSentList[d.studentId] ? (
                            <span className="text-[10px] text-emerald-400 font-medium font-mono">
                              Sent: {reminderSentList[d.studentId]}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Not Dispatched</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => sendDefaulterReminder(d.studentId)}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Send simulated email/SMS reminder notice"
                            >
                              <Send className="w-3 h-3" />
                              <span>Remind</span>
                            </button>
                            <button
                              onClick={() => setNoticeStudent(d)}
                              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Demand Notice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SCHOLARSHIP DISBURSEMENT CLEARING */}
        {activeTab === 'scholarships' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div>
                <h3 className="font-bold text-base text-white">
                  University Scholarship Disbursement Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Reconcile incoming DBT funds and approve semester tuition offsets in student fee ledgers.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {scholarships.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-850 border border-slate-700 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-750 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{app.studentName}</span>
                        <span className="font-mono text-xs text-blue-400">{app.studentRollNo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          {app.applicationNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {app.schemeName} • Authority: {app.sponsoringBody}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">Sanction Amount</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {formatCurrency(app.sanctionedAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress Controller */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    {[1, 2, 3, 4].map((stageNum) => {
                      const stageInfo = app.stageHistory.find((s) => s.stage === stageNum);
                      const isCurrent = app.currentStage === stageNum;
                      const isPast = app.currentStage > stageNum;

                      return (
                        <div
                          key={stageNum}
                          className={`p-3 rounded-lg border flex flex-col justify-between ${
                            isPast
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                              : isCurrent
                              ? 'bg-blue-950/40 border-blue-500/50 text-blue-200 ring-1 ring-blue-500/30'
                              : 'bg-slate-900/40 border-slate-750 text-slate-500'
                          }`}
                        >
                          <div>
                            <span className="font-mono text-[9px] uppercase font-bold block mb-1">
                              Stage {stageNum} {isPast ? '✓' : isCurrent ? '● Active' : ''}
                            </span>
                            <span className="font-semibold block text-[11px] leading-tight">
                              {stageInfo?.title || `Stage ${stageNum}`}
                            </span>
                          </div>

                          {isCurrent && app.currentStage < 4 && (
                            <button
                              onClick={() =>
                                updateScholarshipStage(
                                  app.id,
                                  (app.currentStage + 1) as ScholarshipStage,
                                  'Audited and endorsed by Joint Bursar Desk #2'
                                )
                              }
                              className="mt-3 w-full py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-semibold cursor-pointer"
                            >
                              Advance to Stage {app.currentStage + 1} →
                            </button>
                          )}

                          {isCurrent && app.currentStage === 4 && app.status !== 'DISBURSED' && (
                            <button
                              onClick={() =>
                                updateScholarshipStage(
                                  app.id,
                                  4,
                                  'Funds credited & reconciled against college dues',
                                  true
                                )
                              }
                              className="mt-3 w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold cursor-pointer"
                            >
                              Release & Offset Dues ✓
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>
                      Fee Offset:{' '}
                      <strong className="text-white font-mono">{formatCurrency(app.adjustedAgainstFees)}</strong> • Bank Allowance:{' '}
                      <strong className="text-emerald-400 font-mono">{formatCurrency(app.disbursedToBank)}</strong>
                    </span>
                    <span className="font-mono text-indigo-300 uppercase font-semibold">
                      Status: {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inspect Challan Slip Modal */}
      {inspectTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Inspect Bank Counterfoil Voucher</h3>
            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
              <img
                src={inspectTx.challanSlipUrl}
                alt="Counterfoil Full"
                className="w-full max-h-80 object-contain p-2"
              />
            </div>
            <div className="text-xs space-y-1 text-slate-300 font-mono">
              <p>Student: <strong className="text-white">{inspectTx.studentName} ({inspectTx.studentRollNo})</strong></p>
              <p>Amount: <strong className="text-emerald-400">{formatCurrency(inspectTx.amountPaid)}</strong></p>
              <p>Bank Reference: <strong className="text-amber-400">{inspectTx.transactionRef}</strong></p>
              <p>Deposit Branch: {inspectTx.depositBranch || 'SBI Campus Branch'}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => setInspectTx(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleApprove(inspectTx.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md"
              >
                Approve & Issue E-Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Remarks Modal */}
      {rejectionTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-red-400">Reject Challan Remittance</h3>
            <p className="text-xs text-slate-300">
              Specify reason for rejecting counterfoil ({rejectionTx.transactionRef}). This will notify the student to resubmit at Counter #3.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. UTR number mismatch with bank daily scroll statement. Physical verification needed."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionTx(null)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Defaulter Demand Notice Modal */}
      {noticeStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-2xl p-8 shadow-2xl space-y-6 print:shadow-none print:border-none print:max-w-none">
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h2 className="font-serif text-xl font-bold uppercase tracking-tight">
                NATIONAL INSTITUTE OF SCIENCE & TECHNOLOGY
              </h2>
              <p className="text-xs uppercase font-semibold text-slate-600">
                OFFICE OF THE BURSAR • DIVISION OF ACADEMIC FINANCE
              </p>
              <p className="text-[11px] text-slate-500">Ref No: NIST/BURSAR/DEMURRAGE/2026/0491</p>
            </div>

            <div className="text-center py-2">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 border border-red-300 font-bold text-xs uppercase tracking-wider rounded">
                STATUTORY DEMAND NOTICE • UNPAID SEMESTER DUES
              </span>
            </div>

            <div className="text-xs leading-relaxed space-y-3">
              <p>
                <strong>To:</strong> {noticeStudent.name} (Roll No: <strong>{noticeStudent.rollNo}</strong>)
                <br />
                {noticeStudent.branch} • Semester {noticeStudent.semester}
              </p>

              <p>
                This is a formal notice from the Bursar Section that your semester tuition dues of{' '}
                <strong className="text-red-700 font-mono text-sm">
                  {formatCurrency(noticeStudent.outstandingBalance)}
                </strong>{' '}
                remained unpaid past the extended due date of <strong>{noticeStudent.dueDate}</strong>.
              </p>

              <p>
                As of today, your payment is <strong>{noticeStudent.daysOverdue} days overdue</strong>,
                attracting a statutory late demurrage fee of{' '}
                <strong>{formatCurrency(noticeStudent.lateFineAccrued)}</strong> (accrued at ₹50/day).
              </p>

              <p className="p-3 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">
                You are instructed to remit the total outstanding amount of{' '}
                <span className="text-red-700 font-mono">
                  {formatCurrency(noticeStudent.outstandingBalance + noticeStudent.lateFineAccrued)}
                </span>{' '}
                within 7 banking days via the online portal or at Campus Counter #1 to avoid debarment
                from End-Semester Examinations.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-xs">
              <div>
                <p className="font-mono text-[10px] text-slate-500">Issued On: {new Date().toLocaleDateString()}</p>
                <p className="font-mono text-[10px] text-slate-500">Notice ID: DEM-2024-SEM{noticeStudent.semester}-{noticeStudent.rollNo}</p>
              </div>
              <div className="text-right">
                <p className="font-serif italic font-bold">Dr. S. K. Mukherjee</p>
                <p className="font-semibold text-[11px]">Senior Bursar & Accounts Officer</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Print Official Notice
              </button>
              <button
                onClick={() => setNoticeStudent(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Receipt View */}
      {selectedReceipt && (
        <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
};
