import React, { useState } from 'react';
import {
  CreditCard,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Building2,
  Calendar,
  Download,
  ExternalLink,
  ChevronRight,
  Calculator,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  Search,
  AlertCircle,
  HelpCircle,
  Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SCHOLARSHIP_NOTICES, TESTIMONIALS, ACCOUNTS_COUNTER_INFO } from '../data/mockData';

export const LandingPage: React.FC = () => {
  const {
    feeSchedules,
    setActiveView,
    currentRole,
    loginAsStudent,
    loginAsAdmin,
    currentStudent,
  } = useApp();

  // Section 1 State: Fee Schedule Explorer
  const [selectedProgram, setSelectedProgram] = useState<'B.Tech' | 'M.Tech' | 'MBA'>('B.Tech');
  const [selectedSemester, setSelectedSemester] = useState<number>(4);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Science & Engineering');

  // Fee Calculator State
  const [calculatorCategory, setCalculatorCategory] = useState<'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'>('General');
  const [includeHostel, setIncludeHostel] = useState<boolean>(false);
  const [anticipatedScholarship, setAnticipatedScholarship] = useState<number>(0);

  // Active Schedule
  const activeSchedule =
    feeSchedules.find((s) => s.semester === selectedSemester) || feeSchedules[0];

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  // Calculator computation
  const baseTuition = activeSchedule?.items.find((i) => i.code.startsWith('TUI'))?.amount || 45000;
  let tuitionConcession = 0;
  if (['SC', 'ST'].includes(calculatorCategory)) {
    tuitionConcession = baseTuition; // 100% waiver
  } else if (calculatorCategory === 'EWS') {
    tuitionConcession = Math.round(baseTuition * 0.5); // 50% waiver
  }

  const hostelFee = includeHostel ? 28000 : 0;
  const estimatedPayable = Math.max(
    0,
    (activeSchedule?.totalAmount || 68500) - tuitionConcession + hostelFee - anticipatedScholarship
  );

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Division of Finance & Academic Accounts</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-serif leading-tight">
              Transparent Semester Fee Remittance &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                Scholarship Desk
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Official university portal for real-time semester fee schedule verification, instant
              digital e-receipt downloads with cryptographic stamps, and 4-stage scholarship grant tracking.
            </p>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (currentRole === 'student') {
                    setActiveView('student-dashboard');
                  } else {
                    setActiveView('admin-dashboard');
                  }
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open {currentRole === 'student' ? 'Student Fee Desk' : 'Accounts Admin Ledger'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('advisor')}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>AI Scholarship Eligibility Advisor</span>
                <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 text-[10px] font-mono rounded">
                  +10 M
                </span>
              </button>

              <button
                onClick={() => setActiveView('help')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-750 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Help Desk & Chatbot</span>
              </button>
            </div>

            {/* Live Stats Row */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
                <div className="text-2xl font-bold font-mono text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">Digital E-Receipts</div>
                <div className="text-[10px] text-slate-500">QR & GFR Rule 48 certified</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
                <div className="text-2xl font-bold font-mono text-blue-400">₹14.8 Cr</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">Scholarships Disbursed</div>
                <div className="text-[10px] text-slate-500">NSP, AICTE & State Schemes</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
                <div className="text-2xl font-bold font-mono text-amber-400">&lt; 24 Hrs</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">Challan Reconciliation</div>
                <div className="text-[10px] text-slate-500">Counter #3 Cashier Scroll</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
                <div className="text-2xl font-bold font-mono text-purple-400">4,200+</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">Active Students</div>
                <div className="text-[10px] text-slate-500">B.Tech, M.Tech, MBA Ledgers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: SEMESTER FEE SCHEDULE OVERVIEW & CALCULATOR */}
      <section id="fee-schedules-section" className="py-16 border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4" />
                <span>Section 1 • Official Academic Tariff</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Semester Fee Schedule Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Itemized statutory breakdown approved by the University Finance Committee and Academic Council.
              </p>
            </div>

            {/* Program & Semester Selector Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
                {(['B.Tech', 'M.Tech', 'MBA'] as const).map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setSelectedProgram(prog)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      selectedProgram === prog
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>

              {/* Semester buttons 1 to 8 */}
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`w-7 h-7 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center ${
                      selectedSemester === sem
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Itemized Fee Table */}
            <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedProgram} • Semester {selectedSemester} Fee Schedule</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-mono">
                      {activeSchedule.academicSession}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Regular Due Date: <strong className="text-slate-200">{activeSchedule.regularDueDate}</strong> • Extended with Fine: <strong className="text-slate-200">{activeSchedule.extendedDueDate}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Total Semester Tariff</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatCurrency(activeSchedule.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Account Head</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {activeSchedule.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{item.title}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{item.code}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              item.category === 'academic'
                                ? 'bg-blue-500/20 text-blue-300'
                                : item.category === 'facility'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{item.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900/80 font-bold border-t border-slate-700 text-xs">
                      <td colSpan={4} className="py-3.5 px-4 text-right text-slate-300 uppercase tracking-wider">
                        Consolidated Semester Fee:
                      </td>
                      <td className="py-3.5 px-4 text-right text-base text-emerald-400 font-mono">
                        {formatCurrency(activeSchedule.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Late fee grace notice */}
              <div className="p-4 bg-slate-900/40 border-t border-slate-700/70 text-xs flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Late Fine Policy: ₹{activeSchedule.lateFeePerDay}/day accrued after extended deadline.
                </span>
                <span className="text-[11px] text-blue-400 font-medium">
                  Statutory Rule: Finance Act 2018
                </span>
              </div>
            </div>

            {/* Right 1 Col: Interactive Fee Calculator */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Fee & Waiver Calculator</h3>
              </div>

              <p className="text-xs text-slate-400">
                Estimate net payable after statutory category waivers (SC/ST/EWS) and scholarship adjustments.
              </p>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Social Category (Statutory Concession):
                </label>
                <select
                  value={calculatorCategory}
                  onChange={(e: any) => setCalculatorCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General">General / Open (No automatic concession)</option>
                  <option value="OBC-NCL">OBC-NCL (Eligible for Post-Matric aid)</option>
                  <option value="EWS">EWS (50% Tuition Fee Concession)</option>
                  <option value="SC">SC (100% Tuition Fee Waiver under State Policy)</option>
                  <option value="ST">ST (100% Tuition Fee Waiver under State Policy)</option>
                </select>
              </div>

              {/* Optional Hostel checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
                <input
                  type="checkbox"
                  checked={includeHostel}
                  onChange={(e) => setIncludeHostel(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 bg-slate-800 border-slate-600"
                />
                <span>Include University Hostel & Mess Dues (+₹28,000)</span>
              </label>

              {/* Anticipated Scholarship input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Anticipated Scholarship Grant (INR):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={anticipatedScholarship}
                    onChange={(e) => setAnticipatedScholarship(Number(e.target.value))}
                    placeholder="e.g. 20000"
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Calculation Summary Card */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Semester Tariff:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(activeSchedule.totalAmount)}</span>
                </div>
                {tuitionConcession > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Category Fee Waiver ({calculatorCategory}):</span>
                    <span className="font-mono font-semibold">-{formatCurrency(tuitionConcession)}</span>
                  </div>
                )}
                {includeHostel && (
                  <div className="flex justify-between text-slate-400">
                    <span>Hostel & Mess Boarding:</span>
                    <span className="font-mono text-slate-200">+{formatCurrency(hostelFee)}</span>
                  </div>
                )}
                {anticipatedScholarship > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Scholarship Offset:</span>
                    <span className="font-mono font-semibold">-{formatCurrency(anticipatedScholarship)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Estimated Net Payable:</span>
                  <span className="text-emerald-400 font-mono text-base">
                    {formatCurrency(estimatedPayable)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveView('advisor')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find Matching Scholarships for My Profile</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GOVERNMENT & INSTITUTIONAL SCHOLARSHIP NOTICES */}
      <section id="scholarships-section" className="py-16 border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Section 2 • Live Notice Board</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Government & Institutional Scholarship Notices
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Active financial assistance schemes officially recognized for direct semester fee offset.
              </p>
            </div>

            <button
              onClick={() => setActiveView('advisor')}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Eligibility Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCHOLARSHIP_NOTICES.map((notice) => (
              <div
                key={notice.id}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {notice.categoryBadges[0]}
                    </span>
                    <span className="text-xs font-semibold font-mono text-emerald-400">
                      {notice.amountTag}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                    {notice.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Authority: {notice.authority}
                  </p>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {notice.eligibilitySnippet}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Deadline: <strong className="text-slate-200">{notice.deadline}</strong></span>
                  </div>

                  <a
                    href={notice.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS (3-STEP PIPELINE) */}
      <section id="how-it-works-section" className="py-16 border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Section 3 • Standard Operating Procedure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              How the Fee Remittance Portal Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              End-to-end digital lifecycle: from dues audit to instant cryptographic receipt generation.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 relative shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xl mb-4 font-mono">
                01
              </div>
              <h3 className="font-bold text-base text-white mb-2">Verify Semester Dues</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in using your Student Roll Number. Review the itemized breakdown across tuition,
                computing lab, examination fees, and any prior scholarship credits or late fines.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono">
                ✓ Automated ledger synchronization
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 relative shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xl mb-4 font-mono">
                02
              </div>
              <h3 className="font-bold text-base text-white mb-2">Pay Online / Upload Challan</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose between Instant Online Remittance (UPI QR, Credit/Debit Cards, NetBanking) or
                deposit physical cash at SBI campus counters and upload the stamped counterfoil.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono">
                ✓ Zero gateway convenience surcharge
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 relative shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xl mb-4 font-mono">
                03
              </div>
              <h3 className="font-bold text-base text-white mb-2">Download Verified Receipt</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instantly download or print an official, watermarked university e-receipt with QR code
                and Bursar digital signature, valid for IT Rebate 80E and education loan processing.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono">
                ✓ Rule 48 GFR compliant certificate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT US (BURSAR & ACCOUNTS DIVISION) */}
      <section id="about-us-section" className="py-16 border-b border-slate-800 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>Section 4 • Institutional Governance</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif leading-tight">
                About the Bursar & Academic Accounts Division
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                The Division of Finance & Accounts oversees the statutory fiscal administration of the
                National Institute of Science & Technology. We are committed to absolute financial
                transparency, zero bureaucratic delay in government scholarship disbursements, and
                providing students and parents with frictionless digital accounting services.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white">Statutory Financial Audit Compliance:</strong> Accounts
                    are annually audited by the Comptroller and Auditor General (CAG) panel and published
                    for academic scrutiny.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white">Direct Benefit Transfer (DBT) Integration:</strong> Real-time
                    linkage with Public Financial Management System (PFMS) for automatic scholarship fee adjustments.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white">Student Financial Grievance Resolution:</strong> Dedicated
                    clearing cell at Counter #2 for fee refunds, dual payments, and loan disbursal certificates.
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Profile Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256"
                  alt="Dr. S. K. Mukherjee"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow-md"
                />
                <div>
                  <h3 className="font-bold text-base text-white">Dr. S. K. Mukherjee</h3>
                  <p className="text-xs text-indigo-400 font-medium">Senior Bursar & Joint Accounts Officer</p>
                  <p className="text-[11px] text-slate-400">M.Com, Ph.D. (Public Finance), FICWA</p>
                </div>
              </div>

              <blockquote className="text-xs text-slate-300 italic border-l-2 border-indigo-500 pl-3 py-1 mb-4 leading-relaxed font-serif">
                &quot;No deserving student shall ever face disruption in their technical education due to
                delays in scholarship disbursement or fee reconciliation. Our digital desk guarantees
                immediate electronic receipt issuance and transparent dues accounting.&quot;
              </blockquote>

              <div className="pt-3 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Desk #2: Fee Audit & Disbursal Cell</span>
                <span className="font-mono text-slate-300">bursar.accounts@univ.ac.in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: STUDENT & PARENT TESTIMONIALS */}
      <section id="testimonials-section" className="py-16 border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Section 5 • Verified Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Trusted by 4,200+ Students & Parents
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real experiences with instant online fee clearance, challan processing, and scholarship adjustment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed italic mb-4 font-serif">
                    &quot;{t.text}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-xs">{t.author}</h4>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {t.verifiedReceiptNo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER & ACCOUNTS COUNTER TIMINGS */}
      <footer id="counters-section" className="bg-slate-950 text-slate-300 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Division & Campus info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
                <span className="font-bold text-white text-base">EduPay Desk</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                National Institute of Science & Technology
                <br />
                Division of Finance & Academic Accounts
                <br />
                Administrative Block, Ground Floor
                <br />
                Pune - 411007, Maharashtra, India
              </p>

              <div className="mt-4 text-xs space-y-1 text-slate-400">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Helpline: {ACCOUNTS_COUNTER_INFO.contacts.helpline}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{ACCOUNTS_COUNTER_INFO.contacts.email}</span>
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveView('help')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Open AI Bursar Help Desk & Chatbot →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Col 2: Counter Timings */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Physical Accounts Counters & Operating Hours</span>
              </h4>

              <div className="space-y-2 text-xs">
                {ACCOUNTS_COUNTER_INFO.timings.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block">{t.counter}</span>
                      <span className="text-[10px] text-slate-400">{t.officer}</span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-300 font-semibold shrink-0">
                      {t.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Official Bank Partners */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Campus Bank Partners</span>
              </h4>

              <div className="space-y-3 text-xs">
                {ACCOUNTS_COUNTER_INFO.bankingPartners.map((b, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <strong className="text-white text-xs block">{b.bank}</strong>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      A/C: {b.accountNumber} • IFSC: {b.ifsc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} National Institute of Science & Technology. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Statutory Compliance: GFR 2017</span>
              <span>•</span>
              <span>ISO 9001:2015 Certified Accounts Division</span>
              <span>•</span>
              <button
                onClick={() => loginAsAdmin()}
                className="text-slate-400 hover:text-white underline cursor-pointer"
              >
                Accounts Officer Login
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
