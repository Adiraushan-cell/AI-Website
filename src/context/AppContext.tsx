import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  StudentProfile,
  AdminProfile,
  SemesterFeeSchedule,
  PaymentTransaction,
  ScholarshipApplication,
  DefaulterStudent,
  ScholarshipStage,
  UrgentPaymentAlert,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_ADMIN,
  INITIAL_FEE_SCHEDULES,
  INITIAL_TRANSACTIONS,
  INITIAL_SCHOLARSHIPS,
} from '../data/mockData';

interface AppContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: 'landing' | 'student-dashboard' | 'admin-dashboard' | 'advisor' | 'auth' | 'help';
  setActiveView: (view: 'landing' | 'student-dashboard' | 'admin-dashboard' | 'advisor' | 'auth' | 'help') => void;

  // Authentication State
  isAuthenticated: boolean;
  currentUser: StudentProfile | AdminProfile | null;
  currentStudent: StudentProfile | null;
  adminProfile: AdminProfile;
  studentsList: StudentProfile[];
  loginAsStudent: (studentId: string) => void;
  loginAsAdmin: () => void;
  registerStudent: (newStudent: Omit<StudentProfile, 'id'>) => void;
  logout: () => void;
  switchStudentAccount: (studentId: string) => void;

  // Data
  feeSchedules: SemesterFeeSchedule[];
  transactions: PaymentTransaction[];
  scholarships: ScholarshipApplication[];
  selectedReceipt: PaymentTransaction | null;
  setSelectedReceipt: (tx: PaymentTransaction | null) => void;

  // Student Actions
  calculateStudentDues: (studentId: string) => {
    schedule: SemesterFeeSchedule | undefined;
    totalFee: number;
    amountPaid: number;
    pendingBalance: number;
    isOverdue: boolean;
    lateFeeAccrued: number;
    daysOverdue: number;
    daysRemaining: number;
    isUrgentDue: boolean;
    scholarshipAdjustments: number;
  };
  getUrgentPaymentAlert: (studentId: string) => UrgentPaymentAlert | null;
  makeOnlinePayment: (params: {
    student: StudentProfile;
    amount: number;
    method: 'ONLINE_UPI' | 'ONLINE_CARD' | 'ONLINE_NETBANKING';
    transactionRef: string;
    bankName: string;
    itemsPaid: { label: string; amount: number }[];
  }) => Promise<PaymentTransaction>;
  submitOfflineChallan: (params: {
    student: StudentProfile;
    amount: number;
    method: 'OFFLINE_CHALLAN' | 'NEFT_RTGS';
    transactionRef: string;
    bankName: string;
    depositBranch: string;
    challanSlipUrl?: string;
    itemsPaid: { label: string; amount: number }[];
    remarks?: string;
  }) => Promise<PaymentTransaction>;
  submitScholarshipApplication: (params: {
    student: StudentProfile;
    schemeName: string;
    sponsoringBody: string;
    schemeType: 'CENTRAL_GOVT' | 'STATE_GOVT' | 'INSTITUTIONAL' | 'CORPORATE';
    sanctionedAmount: number;
    documents: string[];
  }) => Promise<ScholarshipApplication>;

  // Admin Actions
  approveTransaction: (transactionId: string, remarks?: string) => void;
  rejectTransaction: (transactionId: string, reason: string) => void;
  updateScholarshipStage: (
    applicationId: string,
    newStage: ScholarshipStage,
    officerRemarks?: string,
    markDisbursed?: boolean
  ) => void;
  getDefaultersList: () => DefaulterStudent[];
  sendDefaulterReminder: (studentId: string) => void;
  reminderSentList: Record<string, string>; // studentId -> timestamp
  exportDefaulterCSV: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeView, setActiveView] = useState<
    'landing' | 'student-dashboard' | 'admin-dashboard' | 'advisor' | 'auth' | 'help'
  >('landing');

  // Authenticated State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('edupay_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    const saved = localStorage.getItem('edupay_active_student_id');
    return saved || 'std-001';
  });

  const [adminProfile] = useState<AdminProfile>(INITIAL_ADMIN);

  // Core Data Stores with LocalStorage Sync
  const [feeSchedules] = useState<SemesterFeeSchedule[]>(INITIAL_FEE_SCHEDULES);

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('edupay_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [scholarships, setScholarships] = useState<ScholarshipApplication[]>(() => {
    const saved = localStorage.getItem('edupay_scholarships');
    return saved ? JSON.parse(saved) : INITIAL_SCHOLARSHIPS;
  });

  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [reminderSentList, setReminderSentList] = useState<Record<string, string>>({});

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('edupay_students', JSON.stringify(studentsList));
  }, [studentsList]);

  useEffect(() => {
    localStorage.setItem('edupay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('edupay_scholarships', JSON.stringify(scholarships));
  }, [scholarships]);

  useEffect(() => {
    localStorage.setItem('edupay_active_student_id', currentStudentId);
  }, [currentStudentId]);

  const currentStudent = studentsList.find((s) => s.id === currentStudentId) || studentsList[0] || null;
  const currentUser = currentRole === 'student' ? currentStudent : adminProfile;

  // Auth Functions
  const loginAsStudent = (studentId: string) => {
    setCurrentRole('student');
    setCurrentStudentId(studentId);
    setIsAuthenticated(true);
    setActiveView('student-dashboard');
  };

  const loginAsAdmin = () => {
    setCurrentRole('admin');
    setIsAuthenticated(true);
    setActiveView('admin-dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveView('landing');
  };

  const switchStudentAccount = (studentId: string) => {
    setCurrentStudentId(studentId);
    if (currentRole === 'student' && activeView !== 'landing') {
      setActiveView('student-dashboard');
    }
  };

  const registerStudent = (newStudentData: Omit<StudentProfile, 'id'>) => {
    const newId = `std-${Date.now().toString().slice(-4)}`;
    const newStudent: StudentProfile = {
      ...newStudentData,
      id: newId,
      avatarUrl:
        newStudentData.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
    };
    setStudentsList((prev) => [newStudent, ...prev]);
    loginAsStudent(newId);
  };

  // Student Dues Calculation
  const calculateStudentDues = (studentId: string) => {
    const student = studentsList.find((s) => s.id === studentId);
    if (!student) {
      return {
        schedule: undefined,
        totalFee: 0,
        amountPaid: 0,
        pendingBalance: 0,
        isOverdue: false,
        lateFeeAccrued: 0,
        daysOverdue: 0,
        daysRemaining: 999,
        isUrgentDue: false,
        scholarshipAdjustments: 0,
      };
    }

    // Match fee schedule for student's branch and semester
    const schedule =
      feeSchedules.find(
        (fs) => fs.branch.toLowerCase() === student.branch.toLowerCase() && fs.semester === student.semester
      ) ||
      feeSchedules.find((fs) => fs.semester === student.semester) ||
      feeSchedules[0];

    const totalFee = schedule ? schedule.totalAmount : 65000;

    // Calculate verified payments for this semester
    const verifiedPayments = transactions
      .filter(
        (t) =>
          t.studentId === studentId &&
          t.semester === student.semester &&
          t.status === 'VERIFIED'
      )
      .reduce((sum, t) => sum + t.amountPaid, 0);

    // Calculate scholarship adjustments for this semester
    const scholarshipAdjustments = scholarships
      .filter(
        (s) =>
          s.studentId === studentId &&
          (s.status === 'ACCOUNTS_APPROVED' || s.status === 'SANCTIONED' || s.status === 'DISBURSED')
      )
      .reduce((sum, s) => sum + (s.adjustedAgainstFees || 0), 0);

    const paidTotal = verifiedPayments + scholarshipAdjustments;
    const pendingBalance = Math.max(0, totalFee - paidTotal);

    // Check overdue and due date proximity
    const dueDate = schedule ? new Date(schedule.regularDueDate) : new Date('2026-10-15');
    const today = new Date();
    const isPastDue = today > dueDate && pendingBalance > 0;
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = isPastDue ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
    const lateFeeAccrued = daysOverdue > 0 ? daysOverdue * (schedule?.lateFeePerDay || 50) : 0;

    // Days remaining until regular due date (positive = upcoming, negative = overdue)
    const diffRemaining = dueDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffRemaining / (1000 * 60 * 60 * 24));
    // Urgent due if pending balance > 0 and within 7 days (or already overdue)
    const isUrgentDue = pendingBalance > 0 && daysRemaining <= 7;

    return {
      schedule,
      totalFee,
      amountPaid: paidTotal,
      pendingBalance,
      isOverdue: isPastDue,
      lateFeeAccrued,
      daysOverdue,
      daysRemaining,
      isUrgentDue,
      scholarshipAdjustments,
    };
  };

  // Helper to generate full urgent payment alert
  const getUrgentPaymentAlert = (studentId: string): UrgentPaymentAlert | null => {
    const student = studentsList.find((s) => s.id === studentId);
    if (!student) return null;

    const dues = calculateStudentDues(studentId);
    if (dues.pendingBalance <= 0) return null;

    // Trigger when within 7 days or overdue
    if (dues.daysRemaining > 7 && !dues.isOverdue) return null;

    let urgencyLevel: UrgentPaymentAlert['urgencyLevel'] = 'warning';
    let title = '';
    let message = '';

    if (dues.isOverdue) {
      urgencyLevel = 'overdue';
      title = `Urgent: Semester ${student.semester} Tuition Dues Overdue (${dues.daysOverdue} Days)`;
      message = `Your regular fee deadline (${dues.schedule?.regularDueDate}) has passed. A daily demurrage late fine of ₹${dues.schedule?.lateFeePerDay || 50}/day is currently accruing. Clear outstanding dues before ${dues.schedule?.extendedDueDate || '31 Oct'} to prevent examination block.`;
    } else if (dues.daysRemaining <= 2) {
      urgencyLevel = 'critical';
      title = `Critical Alert: Tuition Due Date in ${dues.daysRemaining <= 0 ? 'Less than 24 hours' : `${dues.daysRemaining} days`}!`;
      message = `Your Semester ${student.semester} balance of ₹${dues.pendingBalance.toLocaleString('en-IN')} is due on ${dues.schedule?.regularDueDate}. Complete online remittance or deposit campus bank challan now to avoid late fines.`;
    } else {
      urgencyLevel = 'urgent';
      title = `Payment Reminder: ${dues.daysRemaining} Days Left to Pay Semester ${student.semester} Fees`;
      message = `Tuition deadline is ${dues.schedule?.regularDueDate}. Settle balance of ₹${dues.pendingBalance.toLocaleString('en-IN')} or verify your pending scholarship status with Accounts Counter #2.`;
    }

    const hasPendingApproval = transactions.some(
      (t) =>
        t.studentId === studentId &&
        t.semester === student.semester &&
        t.status === 'PENDING_APPROVAL'
    );

    const hasActiveScholarship = scholarships.some(
      (s) => s.studentId === studentId && s.status !== 'REJECTED'
    );

    const tasks: UrgentPaymentAlert['tasks'] = [
      {
        id: 'task-pay-online',
        label: `Pay remaining balance (₹${dues.pendingBalance.toLocaleString('en-IN')}) via Instant UPI / NetBanking`,
        completed: false,
        urgent: true,
        type: 'pay',
      },
      {
        id: 'task-upload-challan',
        label: hasPendingApproval
          ? 'Challan counterfoil uploaded (Under Accounts Desk #3 review)'
          : 'Alternatively, deposit physical challan at Campus SBI Branch & upload slip',
        completed: hasPendingApproval,
        urgent: !hasPendingApproval,
        type: 'challan',
      },
      {
        id: 'task-scholarship-waiver',
        label: hasActiveScholarship
          ? 'Scholarship claim linked to roll number for fee ledger offset'
          : 'Check State & AICTE scholarship schemes with AI Advisor to offset dues',
        completed: hasActiveScholarship,
        urgent: false,
        type: 'scholarship',
      },
      {
        id: 'task-receipt-verification',
        label: 'Download verified digital receipt with cryptographic stamp upon clearance',
        completed: false,
        urgent: false,
        type: 'verify',
      },
    ];

    return {
      id: `alert-due-${student.id}-sem${student.semester}-${dues.schedule?.regularDueDate}`,
      title,
      message,
      daysRemaining: dues.daysRemaining,
      dueDate: dues.schedule?.regularDueDate || '2026-10-15',
      extendedDueDate: dues.schedule?.extendedDueDate || '2026-10-31',
      outstandingBalance: dues.pendingBalance,
      urgencyLevel,
      semester: student.semester,
      finePerDay: dues.schedule?.lateFeePerDay || 50,
      tasks,
    };
  };

  // Student Payment Operations
  const makeOnlinePayment = async (params: {
    student: StudentProfile;
    amount: number;
    method: 'ONLINE_UPI' | 'ONLINE_CARD' | 'ONLINE_NETBANKING';
    transactionRef: string;
    bankName: string;
    itemsPaid: { label: string; amount: number }[];
  }): Promise<PaymentTransaction> => {
    const stampCode = `NIST/VERIFIED/${new Date().getFullYear()}/${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const receiptNum = `REC-${new Date().getFullYear()}-SEM${params.student.semester}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      receiptNo: receiptNum,
      studentId: params.student.id,
      studentRollNo: params.student.rollNo,
      studentName: params.student.name,
      branch: params.student.branch,
      program: params.student.program,
      semester: params.student.semester,
      academicSession: `Academic Session ${params.student.academicYear}`,
      amountPaid: params.amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: params.method,
      transactionRef: params.transactionRef,
      bankName: params.bankName,
      status: 'VERIFIED',
      verifiedBy: 'BURSAR-ONLINE-GATEWAY-AUTO',
      verifiedAt: new Date().toISOString(),
      feeBreakdown: params.itemsPaid,
      digitalStampCode: stampCode,
      remarks: 'Payment settled instantly via University Digital Payment Gateway.',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const submitOfflineChallan = async (params: {
    student: StudentProfile;
    amount: number;
    method: 'OFFLINE_CHALLAN' | 'NEFT_RTGS';
    transactionRef: string;
    bankName: string;
    depositBranch: string;
    challanSlipUrl?: string;
    itemsPaid: { label: string; amount: number }[];
    remarks?: string;
  }): Promise<PaymentTransaction> => {
    const challanNum = `CHAL-${new Date().getFullYear()}-SEM${params.student.semester}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      receiptNo: challanNum,
      studentId: params.student.id,
      studentRollNo: params.student.rollNo,
      studentName: params.student.name,
      branch: params.student.branch,
      program: params.student.program,
      semester: params.student.semester,
      academicSession: `Academic Session ${params.student.academicYear}`,
      amountPaid: params.amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: params.method,
      transactionRef: params.transactionRef,
      bankName: params.bankName,
      depositBranch: params.depositBranch,
      challanSlipUrl:
        params.challanSlipUrl ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
      status: 'PENDING_APPROVAL',
      feeBreakdown: params.itemsPaid,
      digitalStampCode: 'ACCOUNTS-SCRUTINY-QUEUED',
      remarks: params.remarks || 'Physical counterfoil uploaded via desk portal.',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const submitScholarshipApplication = async (params: {
    student: StudentProfile;
    schemeName: string;
    sponsoringBody: string;
    schemeType: 'CENTRAL_GOVT' | 'STATE_GOVT' | 'INSTITUTIONAL' | 'CORPORATE';
    sanctionedAmount: number;
    documents: string[];
  }): Promise<ScholarshipApplication> => {
    const appNum = `SCH-${Date.now().toString().slice(-6)}`;
    const newApp: ScholarshipApplication = {
      id: `sch-${Date.now()}`,
      applicationNo: appNum,
      studentId: params.student.id,
      studentRollNo: params.student.rollNo,
      studentName: params.student.name,
      schemeName: params.schemeName,
      sponsoringBody: params.sponsoringBody,
      schemeType: params.schemeType,
      sanctionedAmount: params.sanctionedAmount,
      adjustedAgainstFees: 0,
      disbursedToBank: 0,
      appliedDate: new Date().toISOString().split('T')[0],
      currentStage: 1,
      status: 'UNDER_REVIEW',
      lastUpdated: new Date().toISOString().split('T')[0],
      documentSummary: params.documents,
      stageHistory: [
        {
          stage: 1,
          title: 'Departmental Scrutiny & HOD Endorsement',
          completedAt: new Date().toISOString().split('T')[0],
          officerRemarks: 'Application received and registered for scrutiny.',
          status: 'in_progress',
        },
        {
          stage: 2,
          title: 'Accounts Section Ledger Reconciliation',
          officerRemarks: 'Pending departmental clearance.',
          status: 'pending',
        },
        {
          stage: 3,
          title: 'State/Central Portal Verification',
          officerRemarks: 'Awaiting bursar endorsement.',
          status: 'pending',
        },
        {
          stage: 4,
          title: 'Sanction & Fee Adjustment / Direct Disbursement',
          officerRemarks: 'Scheduled upon portal clearance.',
          status: 'pending',
        },
      ],
    };

    setScholarships((prev) => [newApp, ...prev]);
    return newApp;
  };

  // Admin Actions
  const approveTransaction = (transactionId: string, remarks?: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const stamp = `NIST/VERIFIED/${new Date().getFullYear()}/${Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

          return {
            ...t,
            status: 'VERIFIED',
            verifiedBy: adminProfile.officerId,
            verifiedAt: new Date().toISOString(),
            digitalStampCode: stamp,
            remarks: remarks || 'Counterfoil verified against university bank ledger scroll.',
          };
        }
        return t;
      })
    );
  };

  const rejectTransaction = (transactionId: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          return {
            ...t,
            status: 'REJECTED',
            verifiedBy: adminProfile.officerId,
            verifiedAt: new Date().toISOString(),
            rejectionReason: reason,
          };
        }
        return t;
      })
    );
  };

  const updateScholarshipStage = (
    applicationId: string,
    newStage: ScholarshipStage,
    officerRemarks?: string,
    markDisbursed?: boolean
  ) => {
    setScholarships((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          const updatedStages = app.stageHistory.map((s) => {
            if (s.stage < newStage) {
              return { ...s, status: 'completed' as const };
            } else if (s.stage === newStage) {
              return {
                ...s,
                status: (markDisbursed || newStage === 4 ? 'completed' : 'in_progress') as
                  | 'completed'
                  | 'in_progress',
                completedAt: markDisbursed ? new Date().toISOString().split('T')[0] : s.completedAt,
                officerRemarks: officerRemarks || s.officerRemarks,
              };
            }
            return { ...s, status: 'pending' as const };
          });

          let newStatus = app.status;
          let adjusted = app.adjustedAgainstFees;
          let disbursed = app.disbursedToBank;

          if (newStage === 2) newStatus = 'UNDER_REVIEW';
          if (newStage === 3) newStatus = 'ACCOUNTS_APPROVED';
          if (newStage === 4) {
            newStatus = markDisbursed ? 'DISBURSED' : 'SANCTIONED';
            if (markDisbursed && adjusted === 0 && disbursed === 0) {
              // Allocate 80% to fee adjustment, 20% to student bank allowance
              adjusted = Math.round(app.sanctionedAmount * 0.8);
              disbursed = app.sanctionedAmount - adjusted;
            }
          }

          return {
            ...app,
            currentStage: newStage,
            status: newStatus,
            lastUpdated: new Date().toISOString().split('T')[0],
            adjustedAgainstFees: adjusted,
            disbursedToBank: disbursed,
            stageHistory: updatedStages,
            disbursementDate: markDisbursed ? new Date().toISOString().split('T')[0] : app.disbursementDate,
          };
        }
        return app;
      })
    );
  };

  // Defaulters List
  const getDefaultersList = (): DefaulterStudent[] => {
    return studentsList
      .map((student) => {
        const dues = calculateStudentDues(student.id);
        return {
          studentId: student.id,
          rollNo: student.rollNo,
          name: student.name,
          branch: student.branch,
          semester: student.semester,
          totalFees: dues.totalFee,
          paidAmount: dues.amountPaid,
          outstandingBalance: dues.pendingBalance,
          dueDate: dues.schedule?.regularDueDate || '2026-10-15',
          daysOverdue: dues.daysOverdue,
          lateFineAccrued: dues.lateFeeAccrued,
          email: student.email,
          phone: student.phone,
          lastNoticeSentDate: reminderSentList[student.id],
        };
      })
      .filter((d) => d.outstandingBalance > 0);
  };

  const sendDefaulterReminder = (studentId: string) => {
    setReminderSentList((prev) => ({
      ...prev,
      [studentId]: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  };

  const exportDefaulterCSV = () => {
    const defaulters = getDefaultersList();
    const headers = [
      'Roll Number',
      'Student Name',
      'Branch',
      'Semester',
      'Total Semester Fee (INR)',
      'Paid Amount (INR)',
      'Outstanding Balance (INR)',
      'Due Date',
      'Days Overdue',
      'Late Fine (INR)',
      'Student Email',
      'Student Phone',
    ];

    const rows = defaulters.map((d) => [
      `"${d.rollNo}"`,
      `"${d.name}"`,
      `"${d.branch}"`,
      d.semester,
      d.totalFees,
      d.paidAmount,
      d.outstandingBalance,
      `"${d.dueDate}"`,
      d.daysOverdue,
      d.lateFineAccrued,
      `"${d.email}"`,
      `"${d.phone}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduPay_Defaulters_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        isAuthenticated,
        currentUser,
        currentStudent,
        adminProfile,
        studentsList,
        loginAsStudent,
        loginAsAdmin,
        registerStudent,
        logout,
        switchStudentAccount,
        feeSchedules,
        transactions,
        scholarships,
        selectedReceipt,
        setSelectedReceipt,
        calculateStudentDues,
        getUrgentPaymentAlert,
        makeOnlinePayment,
        submitOfflineChallan,
        submitScholarshipApplication,
        approveTransaction,
        rejectTransaction,
        updateScholarshipStage,
        getDefaultersList,
        sendDefaulterReminder,
        reminderSentList,
        exportDefaulterCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
