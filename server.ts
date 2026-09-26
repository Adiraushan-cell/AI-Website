import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // AI Scholarship Eligibility Advisor API Route
  app.post('/api/scholarship-advisor', async (req, res) => {
    try {
      const {
        familyIncome,
        branch,
        category,
        cgpa,
        domicileState,
        gender,
        firstGen,
        program,
        semester,
      } = req.body;

      if (!ai) {
        // Return fallback structured response if API key not available
        return res.json({
          success: true,
          source: 'local-engine',
          recommendations: generateLocalScholarshipMatches({
            familyIncome: Number(familyIncome) || 300000,
            branch: branch || 'Computer Science & Engineering',
            category: category || 'General',
            cgpa: Number(cgpa) || 8.0,
            domicileState: domicileState || 'Maharashtra',
            gender: gender || 'Female',
            firstGen: Boolean(firstGen),
            program: program || 'B.Tech',
          }),
        });
      }

      const prompt = `You are a Senior Academic Financial Aid & Scholarship Officer at a premier university.
Evaluate the student profile against real Indian and Institutional financial aid and scholarship schemes:

Student Profile:
- Program: ${program || 'B.Tech'} in ${branch || 'Engineering'}
- Current Semester: ${semester || 4}
- CGPA / Academic Score: ${cgpa || 8.2} / 10.0
- Annual Family Income: ₹${familyIncome ? Number(familyIncome).toLocaleString('en-IN') : '2,50,000'}
- Category: ${category || 'General'}
- Domicile State: ${domicileState || 'National / Any State'}
- Gender: ${gender || 'Not specified'}
- First-Generation Graduate: ${firstGen ? 'Yes' : 'No'}

Identify 3 to 4 best matching real scholarship schemes (e.g., National Scholarship Portal (NSP) Central Sector Scheme, Post-Matric Scholarship for SC/ST/OBC, AICTE Pragati for Girls, Saksham for Specially-abled, PM-USP, Reliance Foundation Undergraduate Scholarship, Tata Trust Merit-cum-Means, State Domicile Post-Matric Fee Waiver, Institutional Bursary Fund).

Return STRICT JSON matching the following schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a specialized university bursar scholarship advisor. Return purely valid JSON adhering to the specified schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              studentSummary: {
                type: Type.STRING,
                description: 'Brief 1-2 sentence evaluation of student profile eligibility.',
              },
              recommendedSchemes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    sponsoringBody: { type: Type.STRING },
                    schemeType: {
                      type: Type.STRING,
                      description: 'CENTRAL_GOVT, STATE_GOVT, INSTITUTIONAL, or CORPORATE',
                    },
                    matchScore: {
                      type: Type.INTEGER,
                      description: 'Estimated eligibility match percentage (0 to 100)',
                    },
                    estimatedGrantAmount: {
                      type: Type.STRING,
                      description: 'Grant or waiver amount, e.g. "₹50,000/year + 100% Tuition Waiver"',
                    },
                    numericalAmount: {
                      type: Type.NUMBER,
                      description: 'Estimated annual grant amount in rupees (e.g. 50000)',
                    },
                    eligibilityReason: {
                      type: Type.STRING,
                      description: 'Why this student specifically qualifies.',
                    },
                    requiredDocuments: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    applicationDeadline: { type: Type.STRING },
                    applicationUrl: { type: Type.STRING },
                    guidanceNotes: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'name',
                    'sponsoringBody',
                    'schemeType',
                    'matchScore',
                    'estimatedGrantAmount',
                    'numericalAmount',
                    'eligibilityReason',
                    'requiredDocuments',
                    'applicationDeadline',
                    'applicationUrl',
                  ],
                },
              },
            },
            required: ['studentSummary', 'recommendedSchemes'],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonText);

      return res.json({
        success: true,
        source: 'gemini-ai',
        recommendations: parsedData,
      });
    } catch (error: any) {
      console.error('Gemini Scholarship Advisor Error:', error);
      // Fallback smoothly to rule engine so the user experience never fails
      const { familyIncome, branch, category, cgpa, domicileState, gender, firstGen, program } =
        req.body;
      return res.json({
        success: true,
        source: 'fallback-engine',
        recommendations: generateLocalScholarshipMatches({
          familyIncome: Number(familyIncome) || 300000,
          branch: branch || 'Computer Science & Engineering',
          category: category || 'General',
          cgpa: Number(cgpa) || 8.0,
          domicileState: domicileState || 'Maharashtra',
          gender: gender || 'Female',
          firstGen: Boolean(firstGen),
          program: program || 'B.Tech',
        }),
      });
    }
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Assistant Chatbot API for Help Section & Floating Desk
  app.post('/api/chat-assistant', async (req, res) => {
    try {
      const { message, history = [], studentContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!ai) {
        // Return local bursar engine response
        const fallbackReply = generateLocalBursarResponse(message, studentContext);
        return res.json({
          reply: fallbackReply,
          source: 'local-knowledge-engine',
        });
      }

      // Format previous history for Gemini
      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-8)
            .map((h: { role: string; content: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }],
            }))
        : [];

      let contextPrompt = '';
      if (studentContext) {
        contextPrompt = `
Active Student Context:
- Name: ${studentContext.name || 'Student'}
- Roll No: ${studentContext.rollNo || 'N/A'}
- Program & Branch: ${studentContext.program || 'B.Tech'} in ${studentContext.branch || 'Engineering'}
- Semester: ${studentContext.semester || 'N/A'}
- Pending Balance: ₹${studentContext.pendingBalance != null ? Number(studentContext.pendingBalance).toLocaleString('en-IN') : '0'}
- Due Date: ${studentContext.regularDueDate || 'N/A'} (Days remaining: ${studentContext.daysRemaining ?? 'N/A'})
- Status: ${studentContext.isOverdue ? 'OVERDUE' : studentContext.isUrgentDue ? 'URGENT DUE (<7 days)' : 'ACTIVE'}
`;
      }

      const systemInstruction = `You are the official EduPay University Bursar & Academic Accounts Assistant for the National Institute of Science & Technology (NIST).
You provide friendly, accurate, highly professional, and authoritative guidance to students and parents regarding semester tuition fees, online payments, offline bank challans, scholarship adjustments, digital receipts, late fee policies, and physical counter operating hours.
Format your responses neatly with bullet points, bold highlights, and clear actionable steps.

Official University Bursar Policies & Details:
1. Payment Options:
   - Online Remittance: Instant clearance via UPI (QR code / VPA), NetBanking (SBI, HDFC, ICICI, Axis, Canara), Credit/Debit cards. Zero convenience surcharge. Generates instant digital receipt with cryptographic stamp (NIST/ACCTS/...).
   - Offline Bank Challan: Download/print the 3-fold challan slip from the portal, deposit cash or transfer via NEFT/RTGS at the on-campus SBI branch (Branch Code: 04128, IFSC: SBIN0004128, A/C: 38920199421). Upload the stamped counterfoil slip with UTR / scroll number in the portal. Counter #3 verifies and clears it within 24-48 business hours.
2. Accounts Counter Schedule (Ground Floor, Admin Block):
   - Counter #1 (Online Fee Reconcile & Student Accounts): 09:30 AM – 01:30 PM (Officer: Mr. R. V. Kulkarni)
   - Counter #2 (Scholarship & Category Fee Waivers Scrutiny): 10:00 AM – 03:30 PM (Officer: Mrs. Sunita Deshmukh)
   - Counter #3 (Bank Challan & Offline Verification): 11:00 AM – 02:00 PM (Officer: Mr. Arvind Rao)
   - Bursar Helpline Desk: (020) 2590-4421 | Email: bursar.accounts@univ.ac.in | Senior Bursar: Dr. S. K. Mukherjee.
3. Deadlines & Late Fines:
   - Regular deadline: As scheduled per semester tariff.
   - Extended deadline: 10-15 days grace period with fine.
   - Beyond extended deadline: ₹50/day late demurrage accrual under statutory Finance Act 2018 guidelines.
   - Fine waivers/installments: Available for documented financial hardship upon submitting Form F-14 at Counter #2 or emailing the Bursar.
4. Scholarships & Direct Benefit Transfer (DBT):
   - 4-Stage Verification Pipeline: Stage 1 (Departmental Academic Scrutiny) -> Stage 2 (Bursar Ledger Reconciliation) -> Stage 3 (State Nodal / Central Ministry Clearance) -> Stage 4 (Direct Benefit Transfer to bank or automatic semester dues deduction).
   - Category Waivers: SC/ST students are entitled to 100% tuition fee waiver; EWS students receive a 50% tuition waiver upon submitting income certificate (< ₹8 LPA).
5. Tax Exemption & Digital Receipts (Section 80E):
   - Official electronic receipts feature a QR code, University PAN/TAN, GFR Rule 48 compliance certificate, and Bursar electronic stamp. They are valid for Income Tax Section 80E interest deductions and corporate tuition reimbursement.
${contextPrompt}`;

      const contents = [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      });

      const replyText =
        response.text?.trim() ||
        'I am here to help you with fee payment, scholarship tracking, receipts, and counter schedules. How may I assist you today?';

      return res.json({
        reply: replyText,
        source: 'gemini-ai',
      });
    } catch (error: any) {
      console.error('Gemini Chat Assistant Error:', error);
      const fallbackReply = generateLocalBursarResponse(req.body.message, req.body.studentContext);
      return res.json({
        reply: fallbackReply,
        source: 'fallback-knowledge-engine',
      });
    }
  });

  // Dev server vs production static handler
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`EduPay Server is actively listening on http://0.0.0.0:${PORT}`);
  });
}

function generateLocalScholarshipMatches(student: {
  familyIncome: number;
  branch: string;
  category: string;
  cgpa: number;
  domicileState: string;
  gender: string;
  firstGen: boolean;
  program: string;
}) {
  const matches = [];

  // Scheme 1: NSP Central Sector Scheme
  if (student.familyIncome <= 450000 && student.cgpa >= 7.5) {
    matches.push({
      id: 'nsp-csss-01',
      name: 'NSP Central Sector Scheme of Scholarship (CSSS)',
      sponsoringBody: 'Ministry of Education, Govt. of India',
      schemeType: 'CENTRAL_GOVT',
      matchScore: student.familyIncome <= 250000 ? 96 : 88,
      estimatedGrantAmount: '₹20,000 / year direct bank credit',
      numericalAmount: 20000,
      eligibilityReason: `Family income (₹${student.familyIncome.toLocaleString('en-IN')}) is below ₹4.5 LPA threshold and CGPA (${student.cgpa}) exceeds the top 20th percentile threshold.`,
      requiredDocuments: [
        'Income Certificate from Competent Revenue Authority',
        'Previous Semester Grade Card / Marksheet',
        'Aadhaar-linked Bank Passbook copy',
        'Bursar Bonafide Student Certificate',
      ],
      applicationDeadline: '30 October 2026',
      applicationUrl: 'https://scholarships.gov.in',
      guidanceNotes: 'Submit verification code to University Accounts Desk Counter #2 for fast-track e-KYC approval.',
    });
  }

  // Scheme 2: AICTE Pragati (For Girls)
  if (student.gender.toLowerCase() === 'female' && student.familyIncome <= 800000) {
    matches.push({
      id: 'aicte-pragati-02',
      name: 'AICTE Pragati Scholarship for Girl Students',
      sponsoringBody: 'All India Council for Technical Education (AICTE)',
      schemeType: 'CENTRAL_GOVT',
      matchScore: 94,
      estimatedGrantAmount: '₹50,000 / annum toward Tuition & Contingency',
      numericalAmount: 50000,
      eligibilityReason: `Eligible girl student admitted to AICTE approved ${student.program} technical course with annual family income under ₹8 LPA.`,
      requiredDocuments: [
        'Family Income Certificate (< ₹8 Lakhs)',
        'Class 10 & 12 Board Certificates',
        'Fee Payment Receipt of Current Semester',
        'Director / Principal Bonafide Endorsement',
      ],
      applicationDeadline: '15 November 2026',
      applicationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
      guidanceNotes: 'Tuition fee adjustment is directly reconciled against pending college dues upon sanction.',
    });
  }

  // Scheme 3: Post-Matric SC/ST/OBC/EWS
  if (['SC', 'ST', 'OBC-NCL', 'EWS'].includes(student.category)) {
    const isFullWaiver = ['SC', 'ST'].includes(student.category);
    matches.push({
      id: 'state-post-matric-03',
      name: `${student.domicileState} State Post-Matric Fee Waiver Scheme`,
      sponsoringBody: `Department of Social Welfare & Backward Classes, Govt. of ${student.domicileState}`,
      schemeType: 'STATE_GOVT',
      matchScore: 92,
      estimatedGrantAmount: isFullWaiver
        ? '100% Tuition Fee Reversal + ₹12,000 Maintenance Allowance'
        : '60% Tuition Fee Concession + ₹8,000 Book Allowance',
      numericalAmount: isFullWaiver ? 65000 : 38000,
      eligibilityReason: `Registered under ${student.category} category with valid ${student.domicileState} domicile credentials.`,
      requiredDocuments: [
        'Valid Caste / Category Certificate with Barcode',
        'State Domicile / Residential Certificate',
        'Current Semester Fee Demand Note',
        'Self-declaration of non-receipt of duplicate grants',
      ],
      applicationDeadline: '31 December 2026',
      applicationUrl: 'https://scholarships.gov.in',
      guidanceNotes: 'Reimbursed funds are routed through university bursar ledger for automatic semester dues deduction.',
    });
  }

  // Scheme 4: Institutional Bursary / Merit-cum-Means
  if (student.cgpa >= 8.5 || student.firstGen) {
    matches.push({
      id: 'inst-mcm-04',
      name: 'University Bursar Merit-cum-Means (MCM) Endowment',
      sponsoringBody: 'Institute Board of Governors & Alumni Trust Fund',
      schemeType: 'INSTITUTIONAL',
      matchScore: 90,
      estimatedGrantAmount: '₹35,000 Direct Tuition Fee Offset',
      numericalAmount: 35000,
      eligibilityReason: `Outstanding academic record (CGPA ${student.cgpa}) ${
        student.firstGen ? 'and First-Generation college graduate status' : ''
      }.`,
      requiredDocuments: [
        'Academic Transcript signed by Dean (Academic Affairs)',
        'Recommendation from Head of Department',
        'Parental Income Affidavit',
      ],
      applicationDeadline: '20 October 2026',
      applicationUrl: 'https://edupay.univ.ac.in/scholarships/apply',
      guidanceNotes: 'Immediate credit adjustment onto next semester fee challan upon Dean approval.',
    });
  }

  // Scheme 5: Corporate STEM Excellence
  if (['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering'].includes(student.branch) && student.cgpa >= 8.0) {
    matches.push({
      id: 'corp-reliance-05',
      name: 'Reliance Foundation Undergraduate STEM Scholarship',
      sponsoringBody: 'Reliance Foundation Education & Research Wing',
      schemeType: 'CORPORATE',
      matchScore: 85,
      estimatedGrantAmount: 'Up to ₹2,00,000 over course duration',
      numericalAmount: 50000,
      eligibilityReason: `Enrolled in core technology branch (${student.branch}) with CGPA >= 8.0.`,
      requiredDocuments: [
        'Aptitude Test Scorecard',
        'Academic Transcripts',
        'Statement of Purpose & Career Goals',
        'Income Tax Return (ITR) or Tehsildar Certificate',
      ],
      applicationDeadline: '15 October 2026',
      applicationUrl: 'https://www.scholarships.reliancefoundation.org',
      guidanceNotes: 'High-value fellowship with mentoring workshops and industry immersion.',
    });
  }

  return {
    studentSummary: `Based on an annual family income of ₹${student.familyIncome.toLocaleString(
      'en-IN'
    )}, a CGPA of ${student.cgpa} in ${student.branch}, and category credentials (${student.category}), the student is strongly positioned for ${matches.length} government & institutional grants.`,
    recommendedSchemes: matches,
  };
}

function generateLocalBursarResponse(message: string, studentContext?: any): string {
  const query = message.toLowerCase().trim();

  // Greeting
  if (query.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
    const studentName = studentContext?.name ? ` ${studentContext.name}` : '';
    const pendingText = studentContext?.pendingBalance
      ? ` Your current pending balance is ₹${Number(studentContext.pendingBalance).toLocaleString('en-IN')}.`
      : '';
    return `Hello${studentName}! 👋 Welcome to the NIST EduPay Bursar & Accounts Help Desk.${pendingText}

How may I assist you today? You can ask me about:
• **Online Payment Options** (UPI, NetBanking, Cards)
• **Offline Bank Challan** deposition at SBI campus branch
• **Scholarship Direct Benefit Transfer** & 4-Stage verification
• **Accounts Counter Timings** & officer contacts
• **80E Tax Deduction Receipts** & duplicate copies
• **Late fee waiver or installment requests**`;
  }

  // Payment methods / UPI / NetBanking / Cards
  if (query.includes('upi') || query.includes('pay online') || query.includes('payment method') || query.includes('how to pay') || query.includes('card') || query.includes('netbanking')) {
    return `### 💳 Semester Fee Payment Modes

You can remit fees through two authorized paths:

1. **Instant Online Gateway (Zero Surcharge)**:
   • **UPI**: Pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM) via instant dynamic QR or VPA.
   • **NetBanking & Cards**: Supported across all major Indian banks (SBI, HDFC, ICICI, Axis, PNB).
   • **Receipt**: Instant verifiable digital receipt generated immediately upon payment with cryptographic timestamp.

2. **Offline SBI Bank Challan**:
   • Download the pre-filled 3-fold challan slip from the payment modal.
   • Deposit cash or wire transfer at the **SBI NIST Campus Branch** (Ground Floor, Admin Block).
   • Upload the stamped counterfoil slip with UTR number for cashier clearance at Counter #3.`;
  }

  // Challan / Offline / Bank
  if (query.includes('challan') || query.includes('offline') || query.includes('sbi') || query.includes('counterfoil') || query.includes('utr') || query.includes('cash')) {
    return `### 🏛️ Offline Bank Challan Process

If paying via cash or bank counter transfer:

1. **Generate Challan Slip**:
   • Click **"Make New Remittance"** on the Dashboard and choose **"Offline Bank Challan"**.
   • Print the 3-fold slip (Student Copy, Bank Copy, Accounts Copy).

2. **Deposit at Campus Branch**:
   • **Bank**: State Bank of India (Campus Branch)
   • **Branch Code**: #04128 | **IFSC**: SBIN0004128
   • **Account Number**: 38920199421 (NIST Central Fee Collection A/C)

3. **Upload & Verification**:
   • Upload a clear photo/scan of the bank-stamped counterfoil slip.
   • Enter the 12-digit UTR / Journal number.
   • **Verification Time**: Counter #3 validates against the daily SBI Cash Scroll within **24 to 48 hours**.`;
  }

  // Counters / Timing / Office Hours / Location / Officer
  if (query.includes('counter') || query.includes('timing') || query.includes('hour') || query.includes('where') || query.includes('office') || query.includes('location') || query.includes('officer')) {
    return `### ⏰ Accounts Counter Timings & Operating Hours

Located at **Ground Floor, Administrative Block**, National Institute of Science & Technology:

• **Counter #1 – Online Fee Reconciliation & Student Accounts**:
  - **Hours**: 09:30 AM – 01:30 PM (Mon–Fri)
  - **In-Charge**: Mr. R. V. Kulkarni
  - **Services**: Fee receipts, duplicate demand notes, dual-payment refunds.

• **Counter #2 – Scholarship & Category Waivers Scrutiny**:
  - **Hours**: 10:00 AM – 03:30 PM (Mon–Fri)
  - **In-Charge**: Mrs. Sunita Deshmukh
  - **Services**: NSP/AICTE/State scholarship endorsements, fee offset approvals, SC/ST/EWS concession scrutiny.

• **Counter #3 – Bank Challan & Cashier Scroll Verification**:
  - **Hours**: 11:00 AM – 02:00 PM (Mon–Fri)
  - **In-Charge**: Mr. Arvind Rao
  - **Services**: Physical counterfoil submission, bank scroll ledger entry.

**Helpline Desk**: (020) 2590-4421 | Email: \`bursar.accounts@univ.ac.in\``;
  }

  // Scholarships / Grants / Fee offset / 4-Stage
  if (query.includes('scholarship') || query.includes('waiver') || query.includes('dbt') || query.includes('nsp') || query.includes('pragati') || query.includes('stage')) {
    return `### 🎓 Scholarship Verification & Fee Offset Pipeline

The University processes financial aid through a **4-Stage Clearance Pipeline**:

1. **Stage 01 – Department Academic Scrutiny**:
   - Verification of student bonafide status, minimum 75% attendance, and passing CGPA by Head of Department.
2. **Stage 02 – Bursar Ledger Reconciliation**:
   - Examination of family income certificate and category credentials by Counter #2.
3. **Stage 03 – State Nodal / Ministry Clearance**:
   - Digital endorsement transmitted to the sponsoring ministry (NSP, AICTE, or Social Welfare Dept).
4. **Stage 04 – Direct Benefit Transfer (DBT) / Ledger Credit**:
   - Grant is either deposited directly into the student's Aadhaar-seeded bank account or adjusted against semester tuition.

💡 *Tip: SC/ST students receive 100% tuition waiver under state domicile guidelines; EWS students receive a 50% tuition concession.*`;
  }

  // Late fee / Overdue / Deadline / Penalty / Fine
  if (query.includes('late') || query.includes('fine') || query.includes('penalty') || query.includes('deadline') || query.includes('due date') || query.includes('overdue')) {
    const studentStatus = studentContext?.daysRemaining != null
      ? `\n\n📌 **Your Current Status**: You have **${studentContext.daysRemaining} days remaining** before the regular deadline (${studentContext.regularDueDate || 'upcoming'}).`
      : '';
    return `### ⏳ Tuition Deadlines & Late Fine Regulations

• **Regular Deadline**: Specified in your Semester Fee Schedule. Zero penalty if cleared by this date.
• **Extended Grace Window**: 10 to 15 days grace period with standard surcharge.
• **Demurrage Surcharge**: In accordance with the University Finance Committee regulations (Finance Act 2018), a statutory fine of **₹50 per calendar day** accrues automatically on the outstanding balance beyond the extended deadline.

**Need a Fine Waiver or Installment Plan?**
If you are experiencing documented medical or financial hardship, download **Form F-14 (Hardship Exemption)** from the portal and submit it at **Counter #2** before the extended deadline.${studentStatus}`;
  }

  // Receipts / Tax / 80E / Download / Stamp
  if (query.includes('receipt') || query.includes('tax') || query.includes('80e') || query.includes('download') || query.includes('stamp') || query.includes('it return')) {
    return `### 📄 Digital E-Receipts & IT Section 80E Compliance

Every successful payment on EduPay generates a **Digitally Certified Counterfoil**:

• **Legal Validity**: Compliant with **GFR 2017 Rule 48** governing government institution accounts.
• **Tax Deduction**: Fully valid for claiming tuition fee deductions under **Section 80E / 80C** of the Indian Income Tax Act.
• **Security Stamp**: Includes an instant QR verification code, University PAN/TAN, and electronic signature stamp of Senior Bursar Dr. S. K. Mukherjee.
• **How to Download**: Go to your **Student Dashboard > Payment History** and click **"Download Receipt"** next to any verified transaction.`;
  }

  // Balance / My dues / How much do I owe
  if (query.includes('balance') || query.includes('due') || query.includes('how much') || query.includes('owe') || query.includes('my fee')) {
    if (studentContext) {
      return `### 📊 Your Semester Dues Overview

• **Student**: ${studentContext.name || 'Student'} (${studentContext.rollNo || ''})
• **Program**: ${studentContext.program || 'B.Tech'} - Semester ${studentContext.semester || ''}
• **Total Semester Tariff**: ₹${studentContext.totalFee ? Number(studentContext.totalFee).toLocaleString('en-IN') : '68,500'}
• **Amount Cleared**: ₹${studentContext.amountPaid ? Number(studentContext.amountPaid).toLocaleString('en-IN') : '0'}
• **Outstanding Pending Balance**: **₹${studentContext.pendingBalance ? Number(studentContext.pendingBalance).toLocaleString('en-IN') : '0'}**
• **Due Date**: ${studentContext.regularDueDate || 'Upcoming'} (${studentContext.daysRemaining ?? 0} days remaining)

Click **"Pay Online or Upload Challan"** on your dashboard to clear your pending dues securely!`;
    }
  }

  // Contact / Help / Phone / Email / Bursar
  if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('call') || query.includes('bursar') || query.includes('complaint') || query.includes('grievance')) {
    return `### 📞 University Accounts Division Contacts

• **Senior Bursar & Joint Accounts Officer**:
  - Dr. S. K. Mukherjee, M.Com, Ph.D., FICWA
  - Office: Room 104, Administrative Block
  - Email: \`bursar.accounts@univ.ac.in\`
  - Direct Phone: (020) 2590-4421

• **Accounts Help Desk Counter**:
  - Inquiries & Refunds: (020) 2590-4422
  - Operating Hours: Monday to Friday, 09:30 AM – 03:30 PM

• **Postal Address**:
  - Division of Finance & Academic Accounts, National Institute of Science & Technology, Administrative Block Ground Floor, Pune – 411007, Maharashtra, India.`;
  }

  // General fallback
  return `Thank you for reaching out to the EduPay Bursar Help Desk.

Here is what I can assist you with:
• **Fee Payments**: Online via UPI/Cards/Netbanking or offline via SBI Bank Challan.
• **Deadlines & Fines**: Standard deadlines, extended window, and late fine calculation (₹50/day).
• **Scholarship Grants**: 4-stage tracking (Department, Bursar, State Nodal, DBT credit).
• **Counter Timings**: Operating hours for Counter #1 (Online), #2 (Scholarships), and #3 (Challans).
• **Official Receipts**: Instant QR-verified receipts valid for IT Section 80E tax deductions.

Please feel free to ask a specific question or select one of the suggested topics!`;
}

startServer();
