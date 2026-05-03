import React, { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Shield, List, Info, ExternalLink, Activity } from 'lucide-react';
import { verifyCompanyLegitimacy } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VerificationResult {
  score: number;
  analysis: string;
  redFlags: string[];
  recommendations: string[];
}

export default function Verify() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyCompanyLegitimacy(companyName, website, details);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to complete verification. Please check your Gemini API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-600 text-white shadow-xl shadow-primary-100 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 font-display uppercase italic text-center">AI Legitimacy Check</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">
          Enter company details and our AI agent will analyze them for common recruitment scam patterns.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name *</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Acme Recruitment Services"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL (if any)</label>
              <input 
                type="url" 
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Details</label>
              <textarea 
                rows={4}
                placeholder="Mention suspicious behavior, weird emails, or how you were contacted..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 outline-none transition-all resize-none font-medium text-sm"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Verify Legitimacy
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-primary-50 text-primary-700 text-xs font-bold border border-primary-100 flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Results */}
        <section className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className={cn(
                  "p-8 rounded-3xl border text-center space-y-2 shadow-xl shadow-slate-200 relative overflow-hidden",
                  result.score >= 80 ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                  result.score >= 50 ? "bg-orange-50 border-orange-100 text-orange-800" :
                  "bg-primary-600 border-primary-700 text-white"
                )}>
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] opacity-60",
                    result.score < 50 && "text-white opacity-80"
                  )}>Legitimacy Score</div>
                  <div className="text-7xl font-black font-display italic tracking-tighter">{result.score}%</div>
                  <div className="text-xs font-bold uppercase tracking-widest pt-2">
                    {result.score >= 80 ? "Seems Trustworthy" : 
                     result.score >= 50 ? "Caution Advised" : "High Risk / Likely Scam"}
                  </div>
                  {result.score < 50 && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  )}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" /> AI Analysis
                    </h3>
                    <p className="text-slate-700 leading-relaxed italic text-sm font-medium">"{result.analysis}"</p>
                  </div>

                  {result.redFlags.length > 0 && (
                    <div className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
                      <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" /> Red Flags Detected
                      </h3>
                      <ul className="space-y-3">
                        {result.redFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-primary-800 font-bold flex gap-2">
                            <span className="text-primary-400">•</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Recommendations
                    </h3>
                    <ul className="space-y-3 font-medium">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 font-display uppercase italic">Ready to Analyze</h3>
                <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">
                  Fill out the form to get a comprehensive AI security assessment of the company.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <section className="bg-slate-800 rounded-3al p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-slate-200 overflow-hidden relative">
        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-3xl font-display italic relative z-10">?</div>
        <div className="relative z-10">
          <h3 className="text-white text-lg font-bold font-display uppercase tracking-wider mb-2 italic">How it works</h3>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Our AI analysis engine searches for patterns consistent with known job scams, such as "advance check fraud", "remote equipment fees", and "unprofessional email signatures". 
            <span className="text-primary-400 ml-1">Always conduct your own research before sending private information.</span>
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700/30 rounded-full blur-3xl -mr-32 -mt-32" />
      </section>
    </div>
  );
}
