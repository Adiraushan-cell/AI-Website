import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowRight,
  Lock,
  Mail,
  Building,
  CheckCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryType, UserRole } from '../types';

export const AuthModal: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    currentRole,
    setCurrentRole,
    studentsList,
    adminProfile,
    loginAsStudent,
    loginAsAdmin,
    registerStudent,
    setActiveView,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Sign In State
  const [identifier, setIdentifier] = useState('CS2023-084');
  const [password, setPassword] = useState('••••••••');

  // Sign Up State
  const [newName, setNewName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newBranch, setNewBranch] = useState('Computer Science & Engineering');
  const [newProgram, setNewProgram] = useState<'B.Tech' | 'M.Tech' | 'MBA' | 'MCA'>('B.Tech');
  const [newSemester, setNewSemester] = useState<number>(1);
  const [newCategory, setNewCategory] = useState<CategoryType>('General');
  const [newIncome, setNewIncome] = useState<number>(300000);
  const [newDomicile, setNewDomicile] = useState('Maharashtra');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newFirstGen, setNewFirstGen] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'student') {
      const match = studentsList.find(
        (s) =>
          s.rollNo.toLowerCase() === identifier.trim().toLowerCase() ||
          s.email.toLowerCase() === identifier.trim().toLowerCase()
      );
      if (match) {
        loginAsStudent(match.id);
      } else {
        // default to first student if not exact match in demo
        loginAsStudent(studentsList[0].id);
      }
    } else {
      loginAsAdmin();
    }
    if (onClose) onClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRollNo) return;

    registerStudent({
      name: newName,
      rollNo: newRollNo,
      email: newEmail || `${newRollNo.toLowerCase()}@univ.ac.in`,
      phone: newPhone || '+91 98765 00000',
      program: newProgram,
      branch: newBranch,
      semester: newSemester,
      academicYear: '2024-2025',
      category: newCategory,
      annualFamilyIncome: Number(newIncome) || 250000,
      cgpa: 8.5,
      domicileState: newDomicile,
      gender: newGender,
      firstGen: newFirstGen,
      hostelResident: false,
    });

    if (onClose) onClose();
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
            EduPay & Scholarship Portal
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your student dues ledger or admin reconciliation desk
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-xl border border-slate-750 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setIdentifier('CS2023-084');
            }}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setIdentifier('BURSAR-OFF-09');
            }}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Accounts Admin</span>
          </button>
        </div>

        {/* Quick Demo Pre-Seeded Profiles Box */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {studentsList.map((std) => (
              <button
                key={std.id}
                type="button"
                onClick={() => {
                  loginAsStudent(std.id);
                  if (onClose) onClose();
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors cursor-pointer"
              >
                <span className="font-semibold text-white block truncate text-[11px]">
                  {std.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">{std.rollNo}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                loginAsAdmin();
                if (onClose) onClose();
              }}
              className="p-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 rounded-lg text-left transition-colors cursor-pointer col-span-2 sm:col-span-4"
            >
              <span className="font-semibold text-emerald-300 block text-[11px]">
                ⚡ Log in as Dr. S. K. Mukherjee (Chief Bursar)
              </span>
              <span className="text-[9px] text-emerald-400/80 font-mono">
                Full administrative access to reconciliation, approval queue & defaulter list
              </span>
            </button>
          </div>
        </div>

        {/* Mode Tabs: Sign In vs Sign Up */}
        {selectedRole === 'student' && (
          <div className="flex border-b border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`pb-2 px-4 border-b-2 transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Existing Student Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`pb-2 px-4 border-b-2 transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              New Student Registration
            </button>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' || selectedRole === 'admin' ? (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                {selectedRole === 'student' ? 'Student Permanent Roll Number' : 'Accounts Officer ID'}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={selectedRole === 'student' ? 'e.g. CS2023-084' : 'BURSAR-OFF-09'}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Portal Passcode</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all ${
                selectedRole === 'student'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              <span>Authenticate & Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanya Sen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Permanent Roll No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS2024-099"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Academic Program</label>
                <select
                  value={newProgram}
                  onChange={(e: any) => setNewProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Branch</label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Semester</label>
                <select
                  value={newSemester}
                  onChange={(e) => setNewSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Social Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="General">General</option>
                  <option value="OBC-NCL">OBC-NCL</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Family Income (INR)</label>
                <input
                  type="number"
                  step="25000"
                  value={newIncome}
                  onChange={(e) => setNewIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
            >
              <span>Register & Open Student Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Back to landing */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setActiveView('landing')}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            ← Return to Public Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
