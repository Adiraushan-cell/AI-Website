import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  CreditCard,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Calendar,
  Flame,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import { StudentProfile, SemesterFeeSchedule } from '../types';

interface UrgentPaymentAlertBannerProps {
  student: StudentProfile;
  schedule: SemesterFeeSchedule | undefined;
  pendingBalance: number;
  totalFee: number;
  regularDueDate: string;
  extendedDueDate: string;
  lateFeePerDay: number;
  isOverdue: boolean;
  daysOverdue: number;
  daysRemaining: number;
  isUrgentDue: boolean;
  onOpenPaymentModal: () => void;
  onOpenAdvisor: () => void;
  simulatedDaysOffset: number;
  onUpdateSimulatedDaysOffset: (offset: number) => void;
}

export const UrgentPaymentAlertBanner: React.FC<UrgentPaymentAlertBannerProps> = ({
  student,
  schedule,
  pendingBalance,
  totalFee,
  regularDueDate,
  extendedDueDate,
  lateFeePerDay,
  isOverdue,
  daysOverdue,
  daysRemaining,
  isUrgentDue,
  onOpenPaymentModal,
  onOpenAdvisor,
  simulatedDaysOffset,
  onUpdateSimulatedDaysOffset,
}) => {
  // Push alert visual local state
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPushToastVisible, setIsPushToastVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushPermission, setPushPermission] = useState<'granted' | 'prompt' | 'denied'>('granted');
  const [showSimControls, setShowSimControls] = useState(false);

  // Local state for urgent checklist items
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-check-breakdown': true,
    'task-pay-online': false,
    'task-ack-latefine': false,
    'task-scholarship-waiver': false,
  });

  // Play push notification sound chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Trigger push-style popup when component mounts or urgency activates
  useEffect(() => {
    if (isUrgentDue && pendingBalance > 0 && !isDismissed) {
      setIsPushToastVisible(true);
      playChime();
    }
  }, [isUrgentDue, pendingBalance, student.id, simulatedDaysOffset]);

  // Toggle task in local state
  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Calculate task completion progress
  const taskKeys = Object.keys(completedTasks);
  const completedCount = taskKeys.filter((k) => completedTasks[k]).length;
  const progressPercent = Math.round((completedCount / taskKeys.length) * 100);

  // Determine urgency tier
  const isCritical = daysRemaining <= 2 && daysRemaining >= 0 && pendingBalance > 0;
  const isOverdueState = isOverdue || daysRemaining < 0;

  // Don't render anything if there is zero balance or not urgent
  if (pendingBalance <= 0 || (!isUrgentDue && !isOverdueState)) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-white">Tuition Due Date Status: Clear / Not Urgent</p>
            <p className="text-[11px] text-slate-400">
              Regular Due Date: {regularDueDate} ({daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Cleared'}). Push alert triggers when due date is within 7 days.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSimControls(!showSimControls)}
          className="text-blue-400 hover:text-blue-300 font-medium text-xs flex items-center gap-1 cursor-pointer"
        >
          <span>Simulate Due Date</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 1. FLOATING PUSH-NOTIFICATION STYLE TOAST (SLIDES IN TOP-RIGHT) */}
      {isPushToastVisible && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-bounce-in shadow-2xl">
          <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/70 rounded-2xl p-4 shadow-amber-500/20 shadow-lg text-slate-100 relative overflow-hidden">
            {/* Top gradient highlight strip */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isOverdueState ? 'bg-red-500' : isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isOverdueState
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : isCritical
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Bursar Push Alert
                    </span>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">
                    {isOverdueState
                      ? `Overdue Notice: Tuition Dues Overdue (${daysOverdue} Days)`
                      : isCritical
                      ? `Urgent Action Required: Due in ${daysRemaining <= 0 ? 'Less than 24h' : `${daysRemaining} Days`}!`
                      : `Tuition Due in ${daysRemaining} Days (Within 7-Day Window)`}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    Outstanding balance of ₹{pendingBalance.toLocaleString('en-IN')} for Semester {student.semester}. Pay before {regularDueDate} to prevent late fine accrual.
                  </p>
                </div>
              </div>

              {/* Toast Close Button */}
              <button
                onClick={() => setIsPushToastVisible(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Dismiss push toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions in Toast */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playChime();
                    setSoundEnabled(!soundEnabled);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] text-slate-400">
                  {soundEnabled ? 'Push Chime On' : 'Chime Muted'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsPushToastVisible(false);
                    // scroll to dashboard alert card
                    const el = document.getElementById('urgent-payment-desk');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  View Tasks
                </button>
                <button
                  onClick={() => {
                    setIsPushToastVisible(false);
                    onOpenPaymentModal();
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. IN-DASHBOARD HIGH-VISIBILITY URGENT TASKS ALERT DESK */}
      <div
        id="urgent-payment-desk"
        className={`relative rounded-2xl border-2 transition-all duration-300 shadow-xl overflow-hidden ${
          isOverdueState
            ? 'bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-900 border-red-500/80 shadow-red-950/40'
            : isCritical
            ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/80 shadow-rose-950/40'
            : 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/80 shadow-amber-950/30'
        }`}
      >
        {/* Animated Top Pulse Banner */}
        <div className={`px-4 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-950 ${
          isOverdueState
            ? 'bg-red-500 text-white'
            : isCritical
            ? 'bg-rose-500 text-white'
            : 'bg-amber-400 text-slate-950'
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span>
              {isOverdueState
                ? `CRITICAL OVERDUE NOTICE • ${daysOverdue} DAYS PAST DEADLINE`
                : isCritical
                ? `CRITICAL DUE DATE ALERT • ${daysRemaining} DAYS REMAINING`
                : `URGENT PAYMENT TASK • DEADLINE WITHIN 7 DAYS (${daysRemaining} DAYS LEFT)`}
            </span>
          </div>

          <div className="flex items-center gap-3 lowercase first-letter:uppercase font-normal">
            <span className="text-[11px] opacity-90 hidden sm:inline">
              Daily fine after regular due: ₹{lateFeePerDay}/day
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-black/10 rounded cursor-pointer transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-white font-serif flex items-center gap-2">
                  <Flame className={`w-5 h-5 ${isOverdueState ? 'text-red-400' : 'text-amber-400'}`} />
                  Tuition Due Date Alert: Semester {student.semester} Fees
                </h3>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                  isOverdueState
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : isCritical
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  ⏱️ {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} Days Left`}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Due: <strong className="text-white">{regularDueDate}</strong>
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {isOverdueState ? (
                  <>
                    The regular submission deadline of <strong className="text-red-300">{regularDueDate}</strong> has expired. 
                    A demurrage late fine of ₹{lateFeePerDay}/day has been initiated. Complete settlement before extended deadline{' '}
                    <strong className="text-white">{extendedDueDate}</strong> to avoid hall ticket suspension.
                  </>
                ) : (
                  <>
                    Tuition fees for Semester {student.semester} are within the <strong className="text-amber-300">7-day urgent window</strong>.
                    You have an outstanding balance of <strong className="text-white font-mono">₹{pendingBalance.toLocaleString('en-IN')}</strong>. 
                    Review the highlighted tasks below to settle dues before late fine accrual.
                  </>
                )}
              </p>
            </div>

            {/* Right side balance counter */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 min-w-[240px] shrink-0 text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Pending Payable Balance
              </span>
              <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
                ₹{pendingBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1.5">
                <span>Total Semester Fee:</span>
                <span className="font-mono text-slate-300">₹{totalFee.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={onOpenPaymentModal}
                className="w-full mt-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Outstanding Balance Now</span>
              </button>
            </div>
          </div>

          {/* Collapsible Urgent Task Checklist */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <span>Urgent Action Checklist (Local Readiness State)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Check off tasks as you complete them to clear your urgent payment queue.
                  </p>
                </div>

                {/* Progress Meter */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-mono">{completedCount} of {taskKeys.length} Completed</span>
                    <span className="text-[10px] text-slate-400 block">{progressPercent}% Ready</span>
                  </div>
                  <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Task 1 */}
                <div
                  onClick={() => toggleTask('task-pay-online')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    completedTasks['task-pay-online']
                      ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-800/80 border-amber-500/40 hover:border-amber-400 text-white shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-amber-400 hover:text-amber-300 shrink-0"
                  >
                    {completedTasks['task-pay-online'] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-amber-400 animate-pulse" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">1. Remit Balance via Instant UPI / NetBanking</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                        Urgent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Clear ₹{pendingBalance.toLocaleString('en-IN')} instantly. Verified digital counterfoil generated in 2 seconds.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPaymentModal();
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Pay Online Now</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task 2 */}
                <div
                  onClick={() => toggleTask('task-check-breakdown')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    completedTasks['task-check-breakdown']
                      ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-white'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-amber-400 hover:text-amber-300 shrink-0"
                  >
                    {completedTasks['task-check-breakdown'] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">2. Verify Itemized Fee Structure</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-medium">
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Check tuition, lab fees, central library, and insurance line items in the approved tariff below.
                    </p>
                  </div>
                </div>

                {/* Task 3 */}
                <div
                  onClick={() => toggleTask('task-scholarship-waiver')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    completedTasks['task-scholarship-waiver']
                      ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-white'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-amber-400 hover:text-amber-300 shrink-0"
                  >
                    {completedTasks['task-scholarship-waiver'] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">3. Check AI Scholarship Offset / Waiver</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        AI Advisor
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Match state schemes & corporate grants against your annual family income (₹{student.annualFamilyIncome.toLocaleString('en-IN')}) and CGPA ({student.cgpa}).
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAdvisor();
                        }}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Run AI Advisor</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task 4 */}
                <div
                  onClick={() => toggleTask('task-ack-latefine')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    completedTasks['task-ack-latefine']
                      ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-white'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-amber-400 hover:text-amber-300 shrink-0"
                  >
                    {completedTasks['task-ack-latefine'] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">4. Acknowledge Late Fine Regulations</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                        Policy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      I understand that after <strong className="text-slate-200">{regularDueDate}</strong>, a daily fine of ₹{lateFeePerDay}/day is automatically applied by the Bursar's ledger.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Simulation & Test Controls Panel */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsPushToastVisible(true);
                  playChime();
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                title="Trigger simulated push notification toast"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-trigger Push Notification</span>
              </button>

              <button
                onClick={() => setShowSimControls(!showSimControls)}
                className="text-blue-400 hover:text-blue-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Due Date Simulator ({daysRemaining}d)</span>
                {showSimControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Push Notification Status:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active (Triggered &lt;= 7 Days)
              </span>
            </div>
          </div>

          {/* Simulation buttons dropdown */}
          {showSimControls && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Test Thresholds:</span>
              <button
                onClick={() => onUpdateSimulatedDaysOffset(0)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  simulatedDaysOffset === 0
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Default Schedule (5 Days Left)
              </button>
              <button
                onClick={() => onUpdateSimulatedDaysOffset(3)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  simulatedDaysOffset === 3
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Critical Window (2 Days Left)
              </button>
              <button
                onClick={() => onUpdateSimulatedDaysOffset(8)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  simulatedDaysOffset === 8
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Overdue Simulation (+3 Days Overdue)
              </button>
              <button
                onClick={() => onUpdateSimulatedDaysOffset(-10)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  simulatedDaysOffset === -10
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Safe Period (15 Days Left - Outside 7-Day Window)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
