import React, { useState } from 'react';
import {
  HelpCircle,
  Bot,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Send,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatAssistant } from './ChatAssistant';
import { ACCOUNTS_COUNTER_INFO } from '../data/mockData';

interface FAQItem {
  id: string;
  category: 'payment' | 'challan' | 'scholarship' | 'receipt' | 'fines' | 'counters';
  question: string;
  answer: string;
  relevantLinks?: { label: string; action: string }[];
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'payment',
    question: 'How do I pay my semester fees online using UPI or Credit Card?',
    answer:
      'Log into the Student Dashboard using your registered Roll Number. Click on "Pay Online or Upload Challan" from the top banner. Select "Instant Online Remittance" to pay via any UPI app (Google Pay, PhonePe, Paytm), NetBanking (SBI, HDFC, ICICI, etc.), or Credit/Debit card. All online payments are cleared with zero convenience surcharge, and a digitally stamped receipt is immediately generated.',
  },
  {
    id: 'faq-2',
    category: 'challan',
    question: 'How does the offline SBI Bank Challan payment process work?',
    answer:
      'To pay offline, click "Make New Remittance" on the Student Dashboard and select "Offline Bank Challan". Download and print the pre-filled 3-fold challan slip. Deposit cash or transfer funds via NEFT/RTGS at the on-campus SBI Branch (NIST Campus Branch #04128, IFSC: SBIN0004128). Afterwards, upload a photograph or PDF scan of the stamped counterfoil slip along with the 12-digit UTR/Scroll Number. Counter #3 cashier scroll verifies and clears it within 24 to 48 business hours.',
  },
  {
    id: 'faq-3',
    category: 'scholarship',
    question: 'How are scholarship grants adjusted against semester tuition fees?',
    answer:
      'The University operates a 4-Stage Clearance Pipeline: (1) Department Academic Scrutiny, (2) Bursar Ledger Reconciliation, (3) State Nodal / Central Sponsoring Body Clearance, and (4) Direct Benefit Transfer (DBT) or Ledger Fee Offset. Once approved at Stage 2, sanctioned grant amounts (e.g., NSP CSSS, AICTE Pragati, Post-Matric) are credited directly as fee concessions on your semester challan demand note.',
  },
  {
    id: 'faq-4',
    category: 'fines',
    question: 'What is the late fee policy if I pay after the scheduled deadline?',
    answer:
      'If semester fees are not paid before the regular due date, a 10 to 15-day extended grace window applies. Beyond the extended deadline, a statutory demurrage surcharge of ₹50 per calendar day accrues automatically under University Finance Committee regulations (Finance Act 2018). If you face financial hardship, you may submit Form F-14 (Hardship Exemption) at Counter #2 for penalty waiver consideration.',
  },
  {
    id: 'faq-5',
    category: 'receipt',
    question: 'Are EduPay digital receipts valid for Income Tax Section 80E deduction?',
    answer:
      'Yes. Every payment receipt issued by EduPay complies with General Financial Rules (GFR) 2017 Rule 48. Receipts contain a high-resolution QR verification code, the Institute PAN/TAN, fee head breakdowns (Tuition, Lab, Exam), and the electronic signature stamp of Senior Bursar Dr. S. K. Mukherjee. They are accepted by employers and tax authorities for Section 80E interest deductions and corporate allowances.',
  },
  {
    id: 'faq-6',
    category: 'counters',
    question: 'Where are the physical Accounts Counters located and what are their hours?',
    answer:
      'All Accounts Counters are located on the Ground Floor of the Administrative Block. Counter #1 (Online Fee Reconcile) operates 09:30 AM – 01:30 PM. Counter #2 (Scholarship & Category Waivers) operates 10:00 AM – 03:30 PM. Counter #3 (Bank Challan Verification) operates 11:00 AM – 02:00 PM. For telephonic inquiries, the Bursar Desk can be reached at (020) 2590-4421.',
  },
  {
    id: 'faq-7',
    category: 'scholarship',
    question: 'Do SC/ST or EWS students receive automatic tuition waivers?',
    answer:
      'Yes, in accordance with state government guidelines: SC and ST students admitted under respective quotas receive a 100% Tuition Fee Waiver upon submitting valid caste credentials and domicile certificates at Counter #2. Economically Weaker Section (EWS) students with validated parental income below ₹8 Lakhs receive a 50% Tuition Fee Concession.',
  },
  {
    id: 'faq-8',
    category: 'payment',
    question: 'What happens if my bank account is debited but the receipt is not generated?',
    answer:
      'Online transactions are synced via automatic webhook callbacks. In rare cases of network timeouts between your bank and the gateway, our server runs an automated reconciliation scroll every 15 minutes. If your balance is not cleared within 2 hours, visit Counter #1 or email bursar.accounts@univ.ac.in with your bank UTR number and transaction screenshot for immediate manual ledger update.',
  },
];

export const HelpSection: React.FC = () => {
  const { setActiveView, currentStudent } = useApp();

  const [activeTab, setActiveTab] = useState<'assistant' | 'faqs' | 'counters'>('assistant');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Inquiry ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Filter FAQs
  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Help Center Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span>Division of Finance & Accounts • Bursar Help Desk</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
              Accounts Help Desk &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                AI Bursar Assistant
              </span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Instant answers on semester fee calculations, offline challan clearing, 4-stage scholarship
              tracking, and official digital receipts. Ask our live AI assistant or browse verified accounts guidelines.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveTab('assistant')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'assistant'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Interactive AI Bursar Chatbot</span>
              </button>

              <button
                onClick={() => setActiveTab('faqs')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'faqs'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions ({FAQS.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('counters')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'counters'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Counters & Contacts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Interactive AI Assistant Chatbot */}
        {activeTab === 'assistant' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: The Chat Assistant */}
            <div className="lg:col-span-2">
              <ChatAssistant compact={false} onNavigateToView={setActiveView} />
            </div>

            {/* Right 1 Col: Quick Help Reference & Counter Timings */}
            <div className="space-y-6">
              {/* Active Student Quick Stats */}
              {currentStudent && (
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentStudent.avatarUrl}
                      alt={currentStudent.name}
                      className="w-12 h-12 rounded-xl object-cover border border-blue-500"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{currentStudent.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {currentStudent.rollNo} • Sem {currentStudent.semester}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Program:</span>
                      <span className="font-semibold text-white">{currentStudent.program}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Category:</span>
                      <span className="font-semibold text-white">{currentStudent.category}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Family Income:</span>
                      <span className="font-mono text-emerald-400">
                        ₹{currentStudent.annualFamilyIncome.toLocaleString('en-IN')}/yr
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('student-dashboard')}
                    className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Student Fee Ledger</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Physical Accounts Counters Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Physical Accounts Counters</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ground Floor, Administrative Block • Open Monday to Friday
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-200 block text-xs">
                      Counter #1: Online Fee Reconcile
                    </span>
                    <span className="text-[10px] text-slate-400">Mr. R. V. Kulkarni</span>
                    <span className="font-mono text-[11px] text-amber-300 block font-semibold mt-0.5">
                      09:30 AM – 01:30 PM
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-200 block text-xs">
                      Counter #2: Scholarship & Waivers
                    </span>
                    <span className="text-[10px] text-slate-400">Mrs. Sunita Deshmukh</span>
                    <span className="font-mono text-[11px] text-amber-300 block font-semibold mt-0.5">
                      10:00 AM – 03:30 PM
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-200 block text-xs">
                      Counter #3: Bank Challan Clearing
                    </span>
                    <span className="text-[10px] text-slate-400">Mr. Arvind Rao</span>
                    <span className="font-mono text-[11px] text-amber-300 block font-semibold mt-0.5">
                      11:00 AM – 02:00 PM
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Helpline: (020) 2590-4421</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>bursar.accounts@univ.ac.in</span>
                  </p>
                </div>
              </div>

              {/* Direct Helpdesk Ticket Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Escalate to Accounts Officer</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Can&apos;t find what you need? Send an electronic grievance or inquiry ticket to Desk #2.
                </p>

                {ticketSubmitted ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-emerald-300">Ticket Dispatched!</p>
                    <p className="text-[10px] text-slate-300">
                      Assigned to Counter #2 Queue. Resolution estimate: 24 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-2.5 text-xs">
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Subject (e.g., Challan clearance delay)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <textarea
                      required
                      rows={3}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your query or provide transaction UTR..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Grievance Ticket</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Frequently Asked Questions */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQ keywords (e.g. UPI, challan, 80E)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'payment', label: 'Online Remittance' },
                  { id: 'challan', label: 'Offline Challans' },
                  { id: 'scholarship', label: 'Scholarships & Waivers' },
                  { id: 'receipt', label: 'Tax & Receipts' },
                  { id: 'fines', label: 'Fines & Deadlines' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion FAQ List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-2xl border border-slate-700/60">
                  <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No matching FAQs found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for different keywords or ask our AI Bursar Assistant in Tab 1.
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-750/50 transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-sm text-white flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>{faq.question}</span>
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-700/60 space-y-3 bg-slate-850/40">
                          <p>{faq.answer}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified by Accounts Section</span>
                            </span>
                            <span>•</span>
                            <button
                              onClick={() => {
                                setActiveTab('assistant');
                              }}
                              className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                            >
                              Ask follow-up question to AI Assistant
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Official Counters & Physical Directory */}
        {activeTab === 'counters' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Col 1: Counters Schedule */}
            <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Physical Accounts Counters & Services</h3>
              </div>

              <div className="space-y-4">
                {ACCOUNTS_COUNTER_INFO.timings.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{t.counter}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                          Desk #{idx + 1}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{t.officer}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ground Floor, Administrative Block
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-mono text-xs text-amber-300 font-bold block bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                        {t.time}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Monday – Friday</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Institutional Contact Directory */}
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-white">Division Directory</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-bold text-white">Dr. S. K. Mukherjee</h5>
                    <p className="text-slate-400 text-[11px]">Senior Bursar & Joint Accounts Officer</p>
                    <p className="text-indigo-400 font-mono text-[11px] mt-0.5">
                      bursar.accounts@univ.ac.in
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <h5 className="font-bold text-white">Accounts Helpline</h5>
                    <p className="text-slate-400 text-[11px]">EPABX Ext: 4421 / 4422</p>
                    <p className="text-amber-300 font-mono text-[11px] mt-0.5">
                      (020) 2590-4421
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <h5 className="font-bold text-white">Campus Bank Counter</h5>
                    <p className="text-slate-400 text-[11px]">State Bank of India (Branch #04128)</p>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">
                      IFSC: SBIN0004128
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
