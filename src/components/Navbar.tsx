import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  ChevronDown,
  Building2,
  Clock,
  Menu,
  X,
  CreditCard,
  Bell,
  BellRing,
  Bot,
  HelpCircle,
  Check,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    isAuthenticated,
    currentUser,
    currentStudent,
    adminProfile,
    studentsList,
    switchStudentAccount,
    loginAsStudent,
    loginAsAdmin,
    logout,
    calculateStudentDues,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRoleDropdownOpen(false);
        setMoreDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const studentDues = currentStudent ? calculateStudentDues(currentStudent.id) : null;
  const isUrgentDue = studentDues ? studentDues.pendingBalance > 0 && studentDues.isUrgentDue : false;

  const navigateToSection = (sectionId: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      {/* Top emergency / counter notification bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-4 py-1.5 text-xs text-amber-300">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-semibold text-amber-200 shrink-0 hidden sm:inline">
              Academic Session 2024-2025 Even Sem:
            </span>
            <span className="truncate text-[11px] sm:text-xs">
              Fee portal active • Penalty waiver window open till 31 Oct
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 shrink-0 text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Counters #1–#3: 09:30 AM – 03:30 PM</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-mono text-[11px]">Bursar Desk: (020) 2590-4421</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Portal Branding */}
          <div
            onClick={() => {
              setActiveView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            title="EduPay Bursar Portal - Return to Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  EduPay
                </span>
                <span className="hidden sm:inline font-semibold text-slate-300 text-sm">
                  & Scholarship Desk
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  Bursar
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] xl:max-w-none">
                National Institute of Science & Technology • Accounts Division
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* 1. Portal Home / Fee Schedules */}
            <button
              onClick={() => {
                setActiveView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all ${
                activeView === 'landing'
                  ? 'text-white bg-slate-800 border border-slate-700 font-semibold shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Fee Schedules
            </button>

            {/* 2. Direct Role Dashboard Tab */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setActiveView(
                    currentRole === 'student' ? 'student-dashboard' : 'admin-dashboard'
                  );
                }}
                className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeView === 'student-dashboard' || activeView === 'admin-dashboard'
                    ? 'text-white bg-blue-600/30 border border-blue-500/50 font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {currentRole === 'student' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    <span>My Student Desk</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Accounts Ledger</span>
                  </>
                )}
              </button>
            )}

            {/* 3. Scholarships Section Anchor */}
            <button
              onClick={() => navigateToSection('scholarships-section')}
              className="px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
            >
              Scholarships
            </button>

            {/* 4. AI Advisor */}
            <button
              onClick={() => setActiveView('advisor')}
              className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 border ${
                activeView === 'advisor'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Advisor</span>
              <span className="px-1 text-[9px] font-bold bg-amber-400 text-slate-900 rounded font-mono">
                +10 M
              </span>
            </button>

            {/* 5. Help Desk & AI Assistant */}
            <button
              onClick={() => setActiveView('help')}
              className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 border ${
                activeView === 'help'
                  ? 'bg-blue-600 text-white font-semibold border-blue-400 shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span>Help Desk</span>
            </button>

            {/* 6. More Info Dropdown (Counters, How It Works) */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-2 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 ${
                  moreDropdownOpen ? 'bg-slate-800 text-white' : ''
                }`}
                title="More Resources"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-slate-200 text-xs">
                  <button
                    onClick={() => navigateToSection('how-it-works-section')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>How Fee Process Works</span>
                  </button>
                  <button
                    onClick={() => navigateToSection('counters-section')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Counters & Operating Hours</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('help');
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center gap-2 transition-colors text-blue-300"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bursar Contact Directory</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action / Role Switcher & Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Student Urgent Alert Bell */}
            {isAuthenticated && currentRole === 'student' && currentStudent && (
              <button
                onClick={() => {
                  setActiveView('student-dashboard');
                  setTimeout(() => {
                    const el = document.getElementById('urgent-payment-desk');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                  isUrgentDue
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 hover:bg-amber-500/25 ring-2 ring-amber-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={
                  isUrgentDue
                    ? `Urgent Due Date Alert: ${studentDues?.daysRemaining} days remaining! Click to view.`
                    : 'Fee Alert Notifications'
                }
                aria-label="Fee Notifications"
              >
                {isUrgentDue ? (
                  <>
                    <BellRing className="w-4 h-4 animate-bounce text-amber-400" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  </>
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </button>
            )}

            {/* User Profile & Role Switcher */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Active Role Selector Trigger Button */}
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                    roleDropdownOpen
                      ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                  }`}
                  aria-expanded={roleDropdownOpen}
                  aria-label="User Account and Role Switcher"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600 shrink-0">
                    {currentRole === 'student' && currentStudent?.avatarUrl ? (
                      <img
                        src={currentStudent.avatarUrl}
                        alt={currentStudent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold leading-tight text-white flex items-center gap-1.5">
                      <span className="truncate max-w-[90px] xl:max-w-[130px]">
                        {currentRole === 'student' ? currentStudent?.name : adminProfile.name}
                      </span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                          currentRole === 'student'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {currentRole}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px] xl:max-w-[150px]">
                      {currentRole === 'student'
                        ? `${currentStudent?.rollNo} • Sem ${currentStudent?.semester}`
                        : adminProfile.officerId}
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      roleDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu for Quick Role & Student Switching */}
                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] bg-slate-850 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800">
                    {/* Header: Current Active User Info */}
                    <div className="p-3 bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600 shrink-0">
                          {currentRole === 'student' && currentStudent?.avatarUrl ? (
                            <img
                              src={currentStudent.avatarUrl}
                              alt={currentStudent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-white truncate">
                              {currentRole === 'student' ? currentStudent?.name : adminProfile.name}
                            </p>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                                currentRole === 'student'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {currentRole}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {currentRole === 'student'
                              ? `${currentStudent?.branch} • ${currentStudent?.rollNo}`
                              : `${adminProfile.designation} (${adminProfile.department})`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">
                            {currentRole === 'student'
                              ? currentStudent?.email
                              : adminProfile.email}
                          </p>
                        </div>
                      </div>

                      {/* Fast Role Switch Toggle Buttons */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                        <button
                          onClick={() => {
                            setCurrentRole('student');
                            setActiveView('student-dashboard');
                            setRoleDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            currentRole === 'student'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Student Desk</span>
                        </button>
                        <button
                          onClick={() => {
                            loginAsAdmin();
                            setActiveView('admin-dashboard');
                            setRoleDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            currentRole === 'admin'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Ledger</span>
                        </button>
                      </div>
                    </div>

                    {/* Student Profiles Switcher (When in Student Mode) */}
                    {currentRole === 'student' && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                            <span>Select Student Profile:</span>
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Demo Accounts</span>
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {studentsList.map((std) => {
                            const isSelected = currentStudent?.id === std.id;
                            return (
                              <button
                                key={std.id}
                                onClick={() => {
                                  switchStudentAccount(std.id);
                                  setCurrentRole('student');
                                  setActiveView('student-dashboard');
                                  setRoleDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                                    : 'hover:bg-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="truncate min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold truncate">{std.name}</span>
                                    {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                                  </div>
                                  <p className="text-[10px] opacity-80 truncate">
                                    {std.rollNo} • {std.branch.split(' ')[0]} • Sem {std.semester}
                                  </p>
                                </div>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {std.category}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Navigation Shortcuts */}
                    <div className="p-2 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveView(
                            currentRole === 'student' ? 'student-dashboard' : 'admin-dashboard'
                          );
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Go to {currentRole === 'student' ? 'Student Fee Desk' : 'Admin Reconciliation Ledger'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('help');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                        <span>Bursar Help Desk & Chatbot</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('auth');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Sign In with another ID / Register</span>
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="p-2 bg-slate-900/60">
                      <button
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveView('auth')}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Login / Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Primary Action Button (Desk / Ledger) */}
            <button
              onClick={() => {
                if (currentRole === 'student') {
                  setActiveView('student-dashboard');
                } else {
                  setActiveView('admin-dashboard');
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                activeView === 'student-dashboard' || activeView === 'admin-dashboard'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-600/30'
              }`}
            >
              {currentRole === 'student' ? (
                <>
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Student Desk</span>
                  <span className="sm:hidden">Desk</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Admin Ledger</span>
                  <span className="sm:hidden">Admin</span>
                </>
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          {/* User Status Card */}
          {isAuthenticated && (
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600 shrink-0">
                  {currentRole === 'student' && currentStudent?.avatarUrl ? (
                    <img
                      src={currentStudent.avatarUrl}
                      alt={currentStudent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {currentRole === 'student' ? currentStudent?.name : adminProfile.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentRole === 'student'
                      ? `${currentStudent?.rollNo} • Sem ${currentStudent?.semester}`
                      : adminProfile.officerId}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const newRole = currentRole === 'student' ? 'admin' : 'student';
                    setCurrentRole(newRole);
                    setActiveView(
                      newRole === 'student' ? 'student-dashboard' : 'admin-dashboard'
                    );
                    setMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-slate-700 hover:bg-slate-650 text-slate-200 border border-slate-600"
                >
                  Switch to {currentRole === 'student' ? 'Admin' : 'Student'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveView('landing');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl flex items-center justify-between ${
                activeView === 'landing'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Fee Schedules & Portal Home</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setActiveView(
                  currentRole === 'student' ? 'student-dashboard' : 'admin-dashboard'
                );
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl flex items-center justify-between ${
                activeView === 'student-dashboard' || activeView === 'admin-dashboard'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {currentRole === 'student' ? (
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>{currentRole === 'student' ? 'My Student Fee Desk' : 'Accounts Admin Ledger'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setActiveView('advisor');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl flex items-center justify-between ${
                activeView === 'advisor'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Scholarship Advisor (+10 M)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setActiveView('help');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl flex items-center justify-between ${
                activeView === 'help'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold'
                  : 'text-blue-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Bursar Help Desk & Chatbot</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => navigateToSection('scholarships-section')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl flex items-center justify-between"
            >
              <span>Scholarships & Fee Concessions</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => navigateToSection('counters-section')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl flex items-center justify-between"
            >
              <span>Cashier Counters & Timings</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Quick Demo Student Switcher inside Mobile Menu */}
          {isAuthenticated && currentRole === 'student' && (
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Switch Demo Student:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {studentsList.slice(0, 4).map((std) => (
                  <button
                    key={std.id}
                    onClick={() => {
                      switchStudentAccount(std.id);
                      setActiveView('student-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-2 text-xs rounded-xl text-left border transition-all truncate ${
                      currentStudent?.id === std.id
                        ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <p className="truncate font-medium">{std.name.split(' ')[0]}</p>
                    <p className="text-[9px] opacity-75 truncate">{std.category} • {std.rollNo}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account Authentication Actions in Mobile Menu */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setActiveView('auth');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Sign In / Switch ID</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
