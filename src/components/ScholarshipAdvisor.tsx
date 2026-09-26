import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle,
  FileText,
  Building,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Loader2,
  DollarSign,
  Award,
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIScholarshipMatch } from '../types';

export const ScholarshipAdvisor: React.FC = () => {
  const { currentStudent, submitScholarshipApplication, setActiveView } = useApp();

  // Form input state pre-filled from active student if available
  const [familyIncome, setFamilyIncome] = useState<number>(
    currentStudent?.annualFamilyIncome || 240000
  );
  const [branch, setBranch] = useState<string>(
    currentStudent?.branch || 'Computer Science & Engineering'
  );
  const [program, setProgram] = useState<string>(currentStudent?.program || 'B.Tech');
  const [category, setCategory] = useState<string>(currentStudent?.category || 'OBC-NCL');
  const [cgpa, setCgpa] = useState<number>(currentStudent?.cgpa || 8.85);
  const [domicileState, setDomicileState] = useState<string>(
    currentStudent?.domicileState || 'Maharashtra'
  );
  const [gender, setGender] = useState<string>(currentStudent?.gender || 'Male');
  const [firstGen, setFirstGen] = useState<boolean>(currentStudent?.firstGen || false);

  // Results State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [studentSummary, setStudentSummary] = useState<string>('');
  const [recommendations, setRecommendations] = useState<AIScholarshipMatch[]>([]);
  const [appliedSchemeIds, setAppliedSchemeIds] = useState<Record<string, boolean>>({});
  const [apiSource, setApiSource] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string>('');

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleRunAdvisor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorNotice('');

    try {
      const response = await fetch('/api/scholarship-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyIncome,
          branch,
          program,
          category,
          cgpa,
          domicileState,
          gender,
          firstGen,
          semester: currentStudent?.semester || 4,
        }),
      });

      const data = await response.json();
      if (data.success && data.recommendations) {
        setStudentSummary(
          data.recommendations.studentSummary ||
            'Evaluated against Central, State, and Institutional financial aid guidelines.'
        );
        setRecommendations(data.recommendations.recommendedSchemes || []);
        setApiSource(data.source || 'gemini-ai');
      } else {
        setErrorNotice('Unable to fetch scholarship matches. Please try again.');
      }
    } catch (err) {
      console.error('Advisor fetch error:', err);
      setErrorNotice('Network error connecting to AI Advisor. Check server status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToDesk = async (match: AIScholarshipMatch) => {
    if (!currentStudent) {
      alert('Please log in with a student profile to save claims.');
      return;
    }

    try {
      await submitScholarshipApplication({
        student: currentStudent,
        schemeName: match.name,
        sponsoringBody: match.sponsoringBody,
        schemeType: (match.schemeType as any) || 'CENTRAL_GOVT',
        sanctionedAmount: match.numericalAmount || 25000,
        documents: match.requiredDocuments || ['Income Certificate', 'Academic Transcript'],
      });

      setAppliedSchemeIds((prev) => ({ ...prev, [match.id]: true }));
    } catch (err) {
      console.error('Failed to register claim:', err);
    }
  };

  // Run on mount once if not yet loaded
  React.useEffect(() => {
    handleRunAdvisor();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI BONUS (+10 M) • Autonomous Financial Aid Engine</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight leading-tight">
              Scholarship Eligibility Advisor
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Powered by server-side Gemini intelligence matching student annual family income,
              academic branch, social category, and state domicile to verified Central & State
              government schemes and corporate fellowships.
            </p>
          </div>
        </div>

        {/* 2-Column Layout: Parameters on Left, Matches on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Filter Parameters Form */}
          <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Student Eligibility Profile</span>
              </h2>
              {currentStudent && (
                <span className="text-[10px] text-blue-400 font-mono">
                  Synced: {currentStudent.rollNo}
                </span>
              )}
            </div>

            <form onSubmit={handleRunAdvisor} className="space-y-4 text-xs">
              {/* Family Income */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-300">Annual Family Income</label>
                  <span className="font-mono text-emerald-400 font-bold">
                    ₹{familyIncome.toLocaleString('en-IN')}/yr
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1200000"
                  step="25000"
                  value={familyIncome}
                  onChange={(e) => setFamilyIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>₹50K (BPL)</span>
                  <span>₹4.5L (NSP Threshold)</span>
                  <span>₹8L (Creamy Layer)</span>
                  <span>₹12L</span>
                </div>
              </div>

              {/* Branch & Program */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.05"
                    min="5.0"
                    max="10.0"
                    value={cgpa}
                    onChange={(e) => setCgpa(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Academic Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                </select>
              </div>

              {/* Category & Domicile */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Social Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="General">General / Open</option>
                    <option value="OBC-NCL">OBC-NCL</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker)</option>
                    <option value="Minority">Religious Minority</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Domicile State</label>
                  <select
                    value={domicileState}
                    onChange={(e) => setDomicileState(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>
              </div>

              {/* Gender & First-Gen */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={firstGen}
                      onChange={(e) => setFirstGen(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 bg-slate-900 border-slate-700"
                    />
                    <span>First-Gen Graduate</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Evaluating Guidelines with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Re-evaluate Matching Schemes</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Recommendations Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary Card */}
            {studentSummary && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">AI Eligibility Verdict</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Source: {apiSource === 'gemini-ai' ? 'Gemini 3.8 Flash' : 'Bursar Knowledge Graph'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{studentSummary}</p>
                </div>
              </div>
            )}

            {/* Error notice if any */}
            {errorNotice && (
              <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {/* Recommended Schemes List */}
            {isLoading ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">
                  Scanning Central & State Scholarship Repositories...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Matching family income limit (₹{familyIncome.toLocaleString('en-IN')}) and {category} category criteria.
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-xs">
                No matching schemes found for these criteria. Try adjusting income or category parameters.
              </div>
            ) : (
              <div className="space-y-5">
                {recommendations.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
                  >
                    {/* Header with match score badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-white">{scheme.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {scheme.schemeType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Authority: {scheme.sponsoringBody}
                        </p>
                      </div>

                      {/* Match score gauge */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Eligibility Match
                          </span>
                          <span className="text-lg font-black font-mono text-emerald-400">
                            {scheme.matchScore}%
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                          {scheme.matchScore}%
                        </div>
                      </div>
                    </div>

                    {/* Grant amount highlight */}
                    <div className="p-3 bg-slate-850 border border-slate-750 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Sanction Grant Value:</span>
                        <strong className="text-emerald-400 font-mono text-sm">
                          {scheme.estimatedGrantAmount}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[11px]">Portal Deadline:</span>
                        <span className="text-slate-200 font-semibold font-mono">
                          {scheme.applicationDeadline}
                        </span>
                      </div>
                    </div>

                    {/* AI rationale */}
                    <div className="text-xs">
                      <span className="font-semibold text-slate-300 block mb-1">
                        Why this student qualifies:
                      </span>
                      <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-750 leading-relaxed">
                        {scheme.eligibilityReason}
                      </p>
                    </div>

                    {/* Required Documents checklist */}
                    {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
                      <div className="text-xs">
                        <span className="font-semibold text-slate-400 block mb-1.5">
                          Mandatory Verification Documents:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {scheme.requiredDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-750 text-[11px] text-slate-300"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Guidance / Action Bar */}
                    <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {scheme.guidanceNotes && (
                        <p className="text-[11px] text-slate-400 italic">
                          💡 {scheme.guidanceNotes}
                        </p>
                      )}

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <a
                          href={scheme.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {appliedSchemeIds[scheme.id] ? (
                          <button
                            disabled
                            className="px-4 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Claim Linked to Desk</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyToDesk(scheme)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Apply & Track in My Desk</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
