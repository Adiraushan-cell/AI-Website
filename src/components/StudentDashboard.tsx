import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Plus,
  BellRing,
  Filter,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentTransaction, ScholarshipApplication } from '../types';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { UrgentPaymentAlertBanner } from './UrgentPaymentAlertBanner';
import { PaymentTrendsChart } from './PaymentTrendsChart';

export const StudentDashboard: React.FC = () => {
  const {
    currentStudent,
    calculateStudentDues,
    transactions,
    scholarships,
    selectedReceipt,
    setSelectedReceipt,
    setActiveView,
    submitScholarshipApplication,
  } = useApp();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewScholarshipModal, setShowNewScholarshipModal] = useState(false);

  // Local state for urgent push alerts and simulation
  const [simulatedDaysOffset, setSimulatedDaysOffset] = useState<number>(0);
  const [onlyUrgentItemsFilter, setOnlyUrgentItemsFilter] = useState<boolean>(false);

  // New scholarship claim form
  const [newSchemeName, setNewSchemeName] = useState('NSP Central Sector Scheme (CSSS)');
  const [newSponsoringBody, setNewSponsoringBody] = useState('Ministry of Education, Govt. of India');
  const [newSanctionedAmount, setNewSanctionedAmount] = useState<number>(20000);
  const [newSchemeType, setNewSchemeType] = useState<
    'CENTRAL_GOVT' | 'STATE_GOVT' | 'INSTITUTIONAL' | 'CORPORATE'
  >('CENTRAL_GOVT');

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No student profile active. Please select a student account.</p>
      </div>
    );
  }

  const dues = calculateStudentDues(currentStudent.id);

  // Adjusted calculations based on local date simulation
  const adjustedDaysRemaining = dues.daysRemaining - simulatedDaysOffset;
  const isUrgentDue = dues.pendingBalance > 0 && (adjustedDaysRemaining <= 7 || dues.isUrgentDue);
  const isAdjustedOverdue = dues.isOverdue || adjustedDaysRemaining < 0;
  const adjustedDaysOverdue = adjustedDaysRemaining < 0 ? Math.abs(adjustedDaysRemaining) : dues.daysOverdue;

  // Filter items if user toggles "Highlight Urgent Dues Only"
  const rawItems = dues.schedule?.items || [];
  const displayedItems = onlyUrgentItemsFilter ? rawItems.filter((i) => i.mandatory) : rawItems;

  // Student's transactions
  const studentTransactions = transactions.filter(
    (t) => t.studentId === currentStudent.id || t.studentRollNo === currentStudent.rollNo
  );

  // Student's scholarships
  const studentScholarships = scholarships.filter(
    (s) => s.studentId === currentStudent.id || s.studentRollNo === currentStudent.rollNo
  );

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitScholarshipApplication({
      student: currentStudent,
      schemeName: newSchemeName,
      sponsoringBody: newSponsoringBody,
      schemeType: newSchemeType,
      sanctionedAmount: Number(newSanctionedAmount) || 25000,
      documents: ['Income Certificate', 'Academic Transcript', 'Fee Receipt'],
    });
    setShowNewScholarshipModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Student Profile Header Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-850 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md bg-slate-700 shrink-0">
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
                  {currentStudent.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentStudent.rollNo}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                  {currentStudent.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentStudent.program} in {currentStudent.branch} • Semester {currentStudent.semester} (Academic Year {currentStudent.academicYear})
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span>CGPA: <strong className="text-emerald-400 font-mono">{currentStudent.cgpa}</strong></span>
                <span>•</span>
                <span>Domicile: <strong className="text-slate-200">{currentStudent.domicileState}</strong></span>
                <span>•</span>
                <span>Family Income: <strong className="text-slate-200 font-mono">₹{currentStudent.annualFamilyIncome.toLocaleString('en-IN')}/yr</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {isUrgentDue && (
              <button
                onClick={() => {
                  const el = document.getElementById('urgent-payment-desk');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all animate-pulse"
                title="Tuition due date is within 7 days. Click to view urgent tasks"
              >
                <BellRing className="w-4 h-4 text-amber-400" />
                <span>
                  {isAdjustedOverdue
                    ? `Overdue (${adjustedDaysOverdue}d)`
                    : `Due Alert: ${adjustedDaysRemaining <= 0 ? 'Less than 24h' : `${adjustedDaysRemaining}d left`}`}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveView('advisor')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AI Scholarship Advisor (+10 M)</span>
            </button>

            <button
              onClick={() => setActiveView('help')}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              title="Open Bursar Help Desk & Chatbot"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Help Desk & Chatbot</span>
            </button>

            {dues.pendingBalance > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Semester Dues</span>
              </button>
            )}
          </div>
        </div>

        {/* PUSH-NOTIFICATION STYLE URGENT PAYMENT ALERT BANNER */}
        <UrgentPaymentAlertBanner
          student={currentStudent}
          schedule={dues.schedule}
          pendingBalance={dues.pendingBalance}
          totalFee={dues.totalFee}
          regularDueDate={dues.schedule?.regularDueDate || '2026-10-01'}
          extendedDueDate={dues.schedule?.extendedDueDate || '2026-10-15'}
          lateFeePerDay={dues.schedule?.lateFeePerDay || 50}
          isOverdue={isAdjustedOverdue}
          daysOverdue={adjustedDaysOverdue}
          daysRemaining={adjustedDaysRemaining}
          isUrgentDue={isUrgentDue}
          onOpenPaymentModal={() => setShowPaymentModal(true)}
          onOpenAdvisor={() => setActiveView('advisor')}
          simulatedDaysOffset={simulatedDaysOffset}
          onUpdateSimulatedDaysOffset={setSimulatedDaysOffset}
        />

        {/* SECTION 1: OUTSTANDING DUES BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Summary Metric Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`rounded-2xl p-5 shadow-lg border transition-all ${
              isAdjustedOverdue
                ? 'bg-slate-800 border-red-500/80 shadow-red-950/40 ring-1 ring-red-500/50'
                : isUrgentDue
                ? 'bg-slate-800 border-amber-500/80 shadow-amber-950/30 ring-1 ring-amber-500/50'
                : 'bg-slate-800 border-slate-700'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Semester {currentStudent.semester} Dues</span>
                {isAdjustedOverdue ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue ({adjustedDaysOverdue} days)
                  </span>
                ) : isUrgentDue ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" />
                    Due in {adjustedDaysRemaining} Days
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    On Schedule
                  </span>
                )}
              </div>

              <div className="text-3xl font-bold font-mono text-white mt-1">
                {formatCurrency(dues.pendingBalance)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {dues.pendingBalance === 0 ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ All fees for Semester {currentStudent.semester} have been fully cleared!
                  </span>
                ) : (
                  <span>
                    Payable before deadline:{' '}
                    <strong className="text-slate-200">
                      {dues.schedule?.regularDueDate || '2026-10-01'}
                    </strong>
                  </span>
                )}
              </p>

              {/* Urgent Countdown Pill */}
              {isUrgentDue && dues.pendingBalance > 0 && (
                <div className={`mt-3 p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  isAdjustedOverdue
                    ? 'bg-red-950/40 border-red-800/60 text-red-300'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                }`}>
                  <span className="flex items-center gap-1.5 font-medium">
                    <BellRing className="w-3.5 h-3.5" />
                    <span>{isAdjustedOverdue ? 'Overdue Action' : 'Urgent Payment Task'}:</span>
                  </span>
                  <span className="font-mono font-bold">
                    {adjustedDaysRemaining < 0
                      ? `${Math.abs(adjustedDaysRemaining)}d past due`
                      : adjustedDaysRemaining === 0
                      ? 'Due Today!'
                      : `${adjustedDaysRemaining}d remaining`}
                  </span>
                </div>
              )}

              {dues.lateFeeAccrued > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center justify-between">
                  <span>Accrued Late Fine:</span>
                  <span className="font-mono font-bold">+{formatCurrency(dues.lateFeeAccrued)}</span>
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                  <span>Cleared: {formatCurrency(dues.amountPaid)}</span>
                  <span>Total: {formatCurrency(dues.totalFee)}</span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((dues.amountPaid / dues.totalFee) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {dues.pendingBalance > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Online or Upload Challan</span>
                </button>
              )}
            </div>

            {/* Quick Helper card */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Accounts Counter Timings</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Counter #1 (Online Fee Reconcile): 09:30 AM – 01:30 PM
                <br />
                Counter #2 (Scholarship & Waivers): 10:00 AM – 03:30 PM
                <br />
                Counter #3 (Bank Challan Verification): 11:00 AM – 02:00 PM
              </p>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700 pb-4 mb-4 gap-3">
              <div>
                <h3 className="font-bold text-base text-white">Itemized Semester Dues Breakdown</h3>
                <p className="text-xs text-slate-400">
                  {dues.schedule?.academicSession || 'Even Semester 2024-2025'} • Approved Tariff
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {isUrgentDue && (
                  <button
                    onClick={() => setOnlyUrgentItemsFilter(!onlyUrgentItemsFilter)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      onlyUrgentItemsFilter
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-700/60 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                    }`}
                    title="Toggle showing all items or only mandatory urgent payment heads"
                  >
                    <Filter className="w-3 h-3" />
                    <span>{onlyUrgentItemsFilter ? 'Show All Items' : 'Filter Urgent Heads'}</span>
                  </button>
                )}
                <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-700 rounded text-slate-300">
                  {displayedItems.length} Components
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Head Code</th>
                    <th className="py-2.5 px-3">Mandatory</th>
                    <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {displayedItems.map((item) => {
                    const isUrgentHead = isUrgentDue && item.mandatory;
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isUrgentHead ? 'bg-amber-950/15 hover:bg-amber-950/25' : 'hover:bg-slate-750/50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white block">{item.title}</span>
                            {isUrgentHead && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                Urgent Head
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{item.description}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{item.code}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.mandatory
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {item.mandatory ? 'Statutory' : 'Optional'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-850 border-t border-slate-700 font-bold text-xs">
                    <td colSpan={3} className="py-3 px-3 text-right text-slate-300 uppercase">
                      Total Semester Tariff:
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-mono text-sm">
                      {formatCurrency(dues.totalFee)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 2: PAYMENT HISTORY & DOWNLOADABLE DIGITAL RECEIPTS */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-700 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Payment History & Verified Digital Receipts</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Download digitally certified fee counterfoils compliant with IT 80E tax exemption rules.
              </p>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Make New Remittance</span>
            </button>
          </div>

          {/* D3.js Payment Trends Chart */}
          <div className="mb-6">
            <PaymentTrendsChart
              transactions={studentTransactions}
              currentSchedule={dues.schedule}
              academicYear={currentStudent.academicYear}
            />
          </div>

          {studentTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No transactions recorded for this student account yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold text-[10px] tracking-wider bg-slate-850/50">
                    <th className="py-3 px-4">Receipt / Scroll No</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Mode & Bank</th>
                    <th className="py-3 px-4">Transaction Ref / UTR</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {studentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {tx.receiptNo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {new Date(tx.paymentDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 block uppercase">
                          {tx.paymentMethod.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{tx.bankName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                        {tx.transactionRef}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(tx.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tx.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {tx.status === 'VERIFIED' ? 'Verified ✓' : tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.status === 'VERIFIED' ? (
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        ) : tx.status === 'PENDING_APPROVAL' ? (
                          <span className="text-[11px] text-amber-400 font-mono">
                            In Desk #3 Queue
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-400 font-mono">
                            {tx.rejectionReason || 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 3: SCHOLARSHIP GRANT TRACKER (4-STAGE PIPELINE) */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-700 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Scholarship Grant Tracker</h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                  4-Stage Clearance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Track status across Department Scrutiny, Bursar Reconciliation, State Nodal Approval, and Direct Benefit Transfer.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('advisor')}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Eligibility Advisor</span>
              </button>
              <button
                onClick={() => setShowNewScholarshipModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Scheme Claim</span>
              </button>
            </div>
          </div>

          {studentScholarships.length === 0 ? (
            <div className="p-8 text-center bg-slate-850/50 rounded-xl border border-slate-700/60">
              <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No active scholarship claims linked to your Roll No.
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Use our AI Scholarship Advisor to find high-match state and central grants matching your family income and academic merit.
              </p>
              <button
                onClick={() => setActiveView('advisor')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Match Scholarships with AI (+10 M)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {studentScholarships.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-850 border border-slate-700 rounded-xl p-5 shadow-md space-y-4"
                >
                  {/* Top application info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-750 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{app.schemeName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-semibold">
                          {app.applicationNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{app.sponsoringBody}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-mono">Grant Value</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        {formatCurrency(app.sanctionedAmount)}
                      </span>
                    </div>
                  </div>

                  {/* 4-Stage Visual Progress Timeline */}
                  <div className="py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                      {app.stageHistory.map((stg) => (
                        <div
                          key={stg.stage}
                          className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                            stg.status === 'completed'
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : stg.status === 'in_progress'
                              ? 'bg-blue-950/40 border-blue-500/50 text-blue-200 ring-1 ring-blue-500/40'
                              : 'bg-slate-900/60 border-slate-700/60 text-slate-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[10px] font-bold uppercase">
                                Stage 0{stg.stage}
                              </span>
                              {stg.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : stg.status === 'in_progress' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                              )}
                            </div>
                            <span className="font-semibold block text-slate-100 text-[11px] leading-tight">
                              {stg.title}
                            </span>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px]">
                            {stg.officerRemarks ? (
                              <p className="line-clamp-2 text-slate-300 italic">
                                &quot;{stg.officerRemarks}&quot;
                              </p>
                            ) : (
                              <span className="text-slate-500">Awaiting clearance</span>
                            )}
                            {stg.completedAt && (
                              <span className="font-mono text-slate-400 block mt-1">
                                {stg.completedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disbursement or adjustment alert */}
                  <div className="bg-slate-900/80 border border-slate-750 p-3 rounded-lg flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div>
                      Fee Offset in Ledger:{' '}
                      <strong className="text-white font-mono">
                        {formatCurrency(app.adjustedAgainstFees)}
                      </strong>{' '}
                      • Student Bank Transfer:{' '}
                      <strong className="text-emerald-400 font-mono">
                        {formatCurrency(app.disbursedToBank)}
                      </strong>
                    </div>
                    <div>
                      Status:{' '}
                      <strong className="font-mono text-indigo-300 uppercase">{app.status}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          student={currentStudent}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(tx) => {
            setShowPaymentModal(false);
            setSelectedReceipt(tx);
          }}
        />
      )}

      {/* Verified Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}

      {/* Submit New Scholarship Claim Modal */}
      {showNewScholarshipModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white mb-1">Register New Scholarship Claim</h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit your sanctioned scholarship details to Accounts Counter #2 for fee ledger adjustment.
            </p>

            <form onSubmit={handleCreateScholarship} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Scheme Name *</label>
                <input
                  type="text"
                  required
                  value={newSchemeName}
                  onChange={(e) => setNewSchemeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Sponsoring Authority / Department *
                </label>
                <input
                  type="text"
                  required
                  value={newSponsoringBody}
                  onChange={(e) => setNewSponsoringBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Scheme Type</label>
                  <select
                    value={newSchemeType}
                    onChange={(e: any) => setNewSchemeType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="CENTRAL_GOVT">Central Government</option>
                    <option value="STATE_GOVT">State Government</option>
                    <option value="INSTITUTIONAL">Institutional</option>
                    <option value="CORPORATE">Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Sanction Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={newSanctionedAmount}
                    onChange={(e) => setNewSanctionedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewScholarshipModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Submit for Scrutiny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
