import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, signInWithGoogle } from '../lib/firebase';
import { ShieldAlert, Image, Send, Link as LinkIcon, Info, CheckCircle2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Report() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleAddUrl = () => setEvidenceUrls([...evidenceUrls, '']);
  const handleUrlChange = (index: number, val: string) => {
    const newUrls = [...evidenceUrls];
    newUrls[index] = val;
    setEvidenceUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please sign in to report a scam.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the company document (if new, or we'd search first)
      // For simplicity in this demo, always create/update
      const companyRef = await addDoc(collection(db, 'companies'), {
        name,
        address,
        website,
        status: 'under-review',
        rating: 1.0,
        totalRatings: 1,
        createdAt: serverTimestamp(),
        reporterId: auth.currentUser.uid
      });

      // 2. Add the report/evidence
      await addDoc(collection(db, `companies/${companyRef.id}/reports`), {
        companyId: companyRef.id,
        reporterId: auth.currentUser.uid,
        evidenceText,
        evidenceUrls: evidenceUrls.filter(u => u !== ''),
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error("Error submitting report", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl border border-emerald-100 flex items-center justify-center mb-8 shadow-xl shadow-emerald-50"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 font-display uppercase italic mb-2 tracking-tight">Report Received</h2>
        <p className="text-slate-500 max-w-sm mb-12 leading-relaxed font-medium">
          Thank you for helping the community. Our moderators will review the evidence and update the company status.
        </p>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
           <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" />
           Redirecting to home page
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-primary-600">
          <ShieldAlert className="w-8 h-8" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 font-display uppercase italic">Report a Hiring Scam</h1>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed">
          Sharing your experience helps protect others. Please provide as much detail and evidence as possible.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Info className="w-3.5 h-3.5 text-primary-600" /> Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name *</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 font-medium outline-none transition-all placeholder:text-slate-300" placeholder="e.g. DreamJob LLC" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 font-medium outline-none transition-all placeholder:text-slate-300" placeholder="https://..." />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reported Address / Location *</label>
              <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 font-medium outline-none transition-all placeholder:text-slate-300" placeholder="Full address or 'Remote / Email-only'" />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Image className="w-3.5 h-3.5 text-primary-600" /> Evidence & Experience
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">What happened? *</label>
              <textarea 
                required
                rows={6}
                value={evidenceText}
                onChange={e => setEvidenceText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 font-medium outline-none transition-all resize-none text-sm placeholder:text-slate-300"
                placeholder="Describe the recruitment process, red flags you noticed, and why you believe it's a scam..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence Links (Screenshots, PDFs, Emails)</label>
              <div className="space-y-3">
                {evidenceUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      <input 
                        type="url" 
                        value={url} 
                        onChange={e => handleUrlChange(i, e.target.value)} 
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-600 outline-none transition-all placeholder:text-slate-300" 
                        placeholder="https://imgur.com/screenshot..." 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={handleAddUrl}
                className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 flex items-center gap-1.5 ml-2 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add another link
              </button>
            </div>
          </div>
        </section>

        {!auth.currentUser ? (
          <div className="p-8 rounded-3xl bg-slate-100 text-center border border-slate-200">
            <p className="text-slate-600 font-bold text-sm mb-4">Verification required to submit reports</p>
            <button 
              type="button"
              onClick={() => signInWithGoogle()}
              className="px-8 py-3 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary-100 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Submit Official Report
          </button>
        )}
      </form>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
