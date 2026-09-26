export type UserRole = 'student' | 'admin';

export type CategoryType = 'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS' | 'Minority';

export interface StudentProfile {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  program: 'B.Tech' | 'M.Tech' | 'MBA' | 'MCA';
  branch: string;
  semester: number;
  academicYear: string;
  category: CategoryType;
  annualFamilyIncome: number;
  cgpa: number;
  domicileState: string;
  gender: 'Male' | 'Female' | 'Other';
  firstGen: boolean;
  hostelResident: boolean;
  roomNo?: string;
  avatarUrl?: string;
}

export interface AdminProfile {
  id: string;
  officerId: string;
  name: string;
  designation: string;
  email: string;
  department: string;
  deskCounter: string;
  phone: string;
  avatarUrl?: string;
}

export type FeeCategory = 'academic' | 'facility' | 'statutory' | 'penalty';

export interface FeeItem {
  id: string;
  title: string;
  code: string;
  amount: number;
  category: FeeCategory;
  description: string;
  mandatory: boolean;
}

export interface SemesterFeeSchedule {
  id: string;
  program: 'B.Tech' | 'M.Tech' | 'MBA' | 'MCA';
  branch: string;
  semester: number;
  academicSession: string;
  regularDueDate: string;
  extendedDueDate: string;
  lateFeePerDay: number;
  items: FeeItem[];
  totalAmount: number;
}

export type PaymentMethod =
  | 'ONLINE_UPI'
  | 'ONLINE_CARD'
  | 'ONLINE_NETBANKING'
  | 'OFFLINE_CHALLAN'
  | 'NEFT_RTGS';

export type PaymentStatus = 'VERIFIED' | 'PENDING_APPROVAL' | 'REJECTED';

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  branch: string;
  program: string;
  semester: number;
  academicSession: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  bankName?: string;
  depositBranch?: string;
  challanSlipUrl?: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  feeBreakdown: { label: string; amount: number }[];
  digitalStampCode: string;
  remarks?: string;
}

export type ScholarshipStage = 1 | 2 | 3 | 4;

export type ScholarshipStatus =
  | 'UNDER_REVIEW'
  | 'ACCOUNTS_APPROVED'
  | 'SANCTIONED'
  | 'DISBURSED'
  | 'REJECTED';

export interface ScholarshipApplication {
  id: string;
  applicationNo: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  schemeName: string;
  sponsoringBody: string;
  schemeType: 'CENTRAL_GOVT' | 'STATE_GOVT' | 'INSTITUTIONAL' | 'CORPORATE';
  sanctionedAmount: number;
  adjustedAgainstFees: number;
  disbursedToBank: number;
  appliedDate: string;
  currentStage: ScholarshipStage;
  stageHistory: {
    stage: ScholarshipStage;
    title: string;
    completedAt?: string;
    officerRemarks?: string;
    status: 'completed' | 'in_progress' | 'pending' | 'rejected';
  }[];
  status: ScholarshipStatus;
  lastUpdated: string;
  disbursementDate?: string;
  documentSummary: string[];
}

export interface DefaulterStudent {
  studentId: string;
  rollNo: string;
  name: string;
  branch: string;
  semester: number;
  totalFees: number;
  paidAmount: number;
  outstandingBalance: number;
  dueDate: string;
  daysOverdue: number;
  lateFineAccrued: number;
  email: string;
  phone: string;
  lastNoticeSentDate?: string;
}

export interface ScholarshipNotice {
  id: string;
  title: string;
  authority: string;
  deadline: string;
  amountTag: string;
  eligibilitySnippet: string;
  categoryBadges: string[];
  portalUrl: string;
  active: boolean;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  branch: string;
  rating: number;
  text: string;
  year: string;
  verifiedReceiptNo: string;
}

export interface AIScholarshipMatch {
  id: string;
  name: string;
  sponsoringBody: string;
  schemeType: string;
  matchScore: number;
  estimatedGrantAmount: string;
  numericalAmount: number;
  eligibilityReason: string;
  requiredDocuments: string[];
  applicationDeadline: string;
  applicationUrl: string;
  guidanceNotes?: string;
}

export type AlertUrgencyLevel = 'critical' | 'urgent' | 'warning' | 'overdue' | 'info';

export interface UrgentPaymentAlert {
  id: string;
  title: string;
  message: string;
  daysRemaining: number; // <= 7 days or negative for overdue
  dueDate: string;
  extendedDueDate: string;
  outstandingBalance: number;
  urgencyLevel: AlertUrgencyLevel;
  semester: number;
  finePerDay: number;
  tasks: {
    id: string;
    label: string;
    completed: boolean;
    urgent: boolean;
    type: 'pay' | 'challan' | 'scholarship' | 'verify';
  }[];
}
