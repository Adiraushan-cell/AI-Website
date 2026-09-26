import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  Loader2,
  FileText,
  Clock,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudentProfile, PaymentTransaction } from '../types';

interface PaymentModalProps {
  student: StudentProfile;
  onClose: () => void;
  onSuccess: (tx: PaymentTransaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ student, onClose, onSuccess }) => {
  const { calculateStudentDues, makeOnlinePayment, submitOfflineChallan } = useApp();
  const dues = calculateStudentDues(student.id);

  // Active payment mode tab: 'online' | 'offline_challan'
  const [activeTab, setActiveTab] = useState<'online' | 'offline_challan'>('online');

  // Online sub-method: 'upi' | 'card' | 'netbanking'
  const [onlineMethod, setOnlineMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Payment amount: 'full' or 'custom'
  const [amountType, setAmountType] = useState<'full' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState<number>(
    dues.pendingBalance > 0 ? dues.pendingBalance : 10000
  );

  const payableAmount = amountType === 'full' ? dues.pendingBalance : Number(customAmount) || 0;

  // Online Card State
  const [cardNumber, setCardNumber] = useState('4532 8910 2341 9924');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('812');
  const [cardHolder, setCardHolder] = useState(student.name);

  // Online UPI State
  const [upiId, setUpiId] = useState(`${student.rollNo.toLowerCase()}@okhdfcbank`);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('State Bank of India');

  // Offline Challan State
  const [challanBank, setChallanBank] = useState('State Bank of India (Campus Branch)');
  const [challanRefNumber, setChallanRefNumber] = useState('SBI-CHAL-894120');
  const [depositBranch, setDepositBranch] = useState('Campus Extension Counter Desk #3');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [challanFile, setChallanFile] = useState<File | null>(null);
  const [challanPreview, setChallanPreview] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400'
  );

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payableAmount <= 0) {
      setErrorMessage('Please specify an amount greater than 0.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Realistic 3-stage animated authorization
    try {
      setProcessingStep('Connecting to University Payment Gateway...');
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep('Authorizing funds with bank switch...');
      await new Promise((r) => setTimeout(r, 800));

      setProcessingStep('Auditing dues & cryptographically stamping receipt...');
      await new Promise((r) => setTimeout(r, 700));

      let methodKey: 'ONLINE_UPI' | 'ONLINE_CARD' | 'ONLINE_NETBANKING' = 'ONLINE_UPI';
      let ref = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}@univ`;
      let bank = 'State Bank of India';

      if (onlineMethod === 'card') {
        methodKey = 'ONLINE_CARD';
        ref = `CARD-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
        bank = 'Visa/MasterCard Multi-Option Gateway';
      } else if (onlineMethod === 'netbanking') {
        methodKey = 'ONLINE_NETBANKING';
        ref = `NETB-${selectedBank.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        bank = selectedBank;
      }

      const tx = await makeOnlinePayment({
        student,
        amount: payableAmount,
        method: methodKey,
        transactionRef: ref,
        bankName: bank,
        itemsPaid: [
          {
            label: `Semester ${student.semester} Tuition & Associated Dues Clearance`,
            amount: payableAmount,
          },
        ],
      });

      setIsProcessing(false);
      setPaymentSuccess(tx);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage('Payment simulation failed. Please try again.');
    }
  };

  const handleChallanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payableAmount <= 0) {
      setErrorMessage('Please enter valid deposited amount.');
      return;
    }
    if (!challanRefNumber.trim()) {
      setErrorMessage('Please enter the 12-digit UTR or Challan Counterfoil number.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      setProcessingStep('Uploading scanned counterfoil to Bursar scrutiny vault...');
      await new Promise((r) => setTimeout(r, 800));

      const tx = await submitOfflineChallan({
        student,
        amount: payableAmount,
        method: 'OFFLINE_CHALLAN',
        transactionRef: challanRefNumber.trim(),
        bankName: challanBank,
        depositBranch,
        challanSlipUrl: challanPreview,
        itemsPaid: [
          {
            label: `Offline Bank Remittance (Challan / NEFT Scroll)`,
            amount: payableAmount,
          },
        ],
        remarks: `Deposited at ${depositBranch} on ${depositDate}.`,
      });

      setIsProcessing(false);
      setPaymentSuccess(tx);
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('Failed to queue challan. Please verify details.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChallanFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setChallanPreview(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Semester Fee Remittance Portal</h2>
              <p className="text-xs text-slate-400">
                {student.name} • {student.rollNo} • Sem {student.semester}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {paymentSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {paymentSuccess.status === 'VERIFIED'
                ? 'Payment Cleared & Digitally Verified!'
                : 'Challan Submitted to Admin Queue!'}
            </h3>

            <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
              {paymentSuccess.status === 'VERIFIED'
                ? `Transaction reference ${paymentSuccess.transactionRef} has been recorded in the university cash ledger. Your verified digital e-receipt is ready.`
                : `Your challan voucher (${paymentSuccess.transactionRef}) has been routed to Accounts Section Counter #3 for bank scroll verification.`}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto my-6 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt / Voucher No:</span>
                <span className="font-mono font-bold text-slate-900">{paymentSuccess.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatCurrency(paymentSuccess.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    paymentSuccess.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {paymentSuccess.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onSuccess(paymentSuccess)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View & Print Official Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Dues Summary Banner */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase text-blue-900 tracking-wider">
                  Total Outstanding Balance (Semester {student.semester})
                </span>
                <div className="text-2xl font-bold font-mono text-blue-950 mt-0.5">
                  {formatCurrency(dues.pendingBalance)}
                </div>
                <div className="text-xs text-blue-700 mt-0.5">
                  Total Semester Fee: {formatCurrency(dues.totalFee)} • Already Paid: {formatCurrency(dues.amountPaid)}
                </div>
              </div>

              {/* Amount Choice */}
              <div className="bg-white border border-blue-200 rounded-lg p-1.5 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setAmountType('full')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    amountType === 'full'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Outstanding ({formatCurrency(dues.pendingBalance)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountType('custom')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    amountType === 'custom'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom Instalment
                </button>
              </div>
            </div>

            {amountType === 'custom' && (
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  Instalment Amount (INR):
                </label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1000"
                    max={dues.pendingBalance > 0 ? dues.pendingBalance : 100000}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500">Min. ₹1,000</span>
              </div>
            )}

            {/* Main Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('online')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'online'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Instant Online Remittance</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                  Instant
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('offline_challan')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'offline_challan'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload Bank Challan / NEFT</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                  Desk #3
                </span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: ONLINE GATEWAY */}
            {activeTab === 'online' && (
              <form onSubmit={handleOnlineSubmit} className="space-y-5">
                {/* Method selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlineMethod('upi')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      onlineMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-blue-600 mb-1" />
                    <div className="text-xs font-bold text-slate-900">UPI / QR Code</div>
                    <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlineMethod('card')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      onlineMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Debit / Credit Card</div>
                    <div className="text-[10px] text-slate-500">Visa, MasterCard, RuPay</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlineMethod('netbanking')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      onlineMethod === 'netbanking'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-5 h-5 text-emerald-600 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Net Banking</div>
                    <div className="text-[10px] text-slate-500">All Major Banks</div>
                  </button>
                </div>

                {/* UPI sub-view */}
                {onlineMethod === 'upi' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                      <QrCode className="w-24 h-24 text-slate-800" />
                      <span className="text-[9px] font-mono text-slate-400 mt-1">Scan & Pay</span>
                    </div>

                    <div className="space-y-2 text-xs flex-1 w-full">
                      <div className="font-semibold text-slate-800">
                        Scan with any UPI App or Enter Virtual Payment Address (VPA):
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Your UPI ID:</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Secured via 256-bit SBI Multi-Option Payment Gateway</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card sub-view */}
                {onlineMethod === 'card' && (
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1 font-semibold">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1 font-semibold">
                          Valid Thru (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1 font-semibold">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1 font-semibold">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* NetBanking sub-view */}
                {onlineMethod === 'netbanking' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <label className="text-[11px] text-slate-500 block font-semibold">
                      Select University Banking Partner or Other Scheduled Bank:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="State Bank of India">
                        State Bank of India (SBI Campus Branch Official Partner)
                      </option>
                      <option value="HDFC Bank Ltd">
                        HDFC Bank (University Extension Counter Official Partner)
                      </option>
                      <option value="ICICI Bank">ICICI Bank Ltd</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Canara Bank">Canara Bank</option>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      You will be securely redirected to the simulated corporate net banking gateway.
                    </p>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{processingStep || 'Processing Payment...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay {formatCurrency(payableAmount)} & Generate Receipt</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: OFFLINE CHALLAN UPLOAD */}
            {activeTab === 'offline_challan' && (
              <form onSubmit={handleChallanSubmit} className="space-y-4 text-xs">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px] leading-relaxed">
                  <strong>Instructions for Physical Challan / NEFT:</strong> Deposit fee at SBI / HDFC campus branch or transfer via NEFT to Account #389100234812 (IFSC: SBIN0004128). Enter the bank scroll/UTR number below and upload a clear photo of the bank stamped counterfoil.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Bank Name
                    </label>
                    <select
                      value={challanBank}
                      onChange={(e) => setChallanBank(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="State Bank of India (Campus Branch)">
                        State Bank of India (Campus Branch)
                      </option>
                      <option value="HDFC Bank (Extension Counter)">
                        HDFC Bank (Extension Counter)
                      </option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Other Commercial Bank">Other Commercial Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Bank Challan / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBI-CHAL-998231 or UTR..."
                      value={challanRefNumber}
                      onChange={(e) => setChallanRefNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Deposit Branch
                    </label>
                    <input
                      type="text"
                      value={depositBranch}
                      onChange={(e) => setDepositBranch(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Date of Deposit
                    </label>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Upload Slip Image */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Upload Bank Stamped Counterfoil Slip
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-3 text-center bg-slate-50 transition-colors">
                    {challanPreview ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={challanPreview}
                            alt="Challan Counterfoil"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-sm"
                          />
                          <div className="text-left">
                            <span className="font-semibold text-slate-800 text-xs block">
                              Bank_Challan_Counterfoil.jpg
                            </span>
                            <span className="text-[10px] text-emerald-600 block">
                              ✓ Stamped Counterfoil Attached
                            </span>
                          </div>
                        </div>
                        <label className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                          Change
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-2">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-indigo-600 block">
                          Click to upload challan receipt image
                        </span>
                        <span className="text-[10px] text-slate-500">PNG, JPG, PDF up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit to Admin Queue */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting to Counter #3 Scrutiny Queue...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Submit Challan Counterfoil for Admin Clearance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
