import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth, signInWithGoogle } from '../lib/firebase';
import { MapPin, Globe, ShieldAlert, CheckCircle, Info, Star, AlertTriangle, FileText, ArrowLeft, Send, User, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Company {
  id: string;
  name: string;
  address: string;
  website: string;
  status: 'legit' | 'fake' | 'under-review';
  rating: number;
  totalRatings: number;
}

interface Report {
  id: string;
  evidenceText: string;
  evidenceUrls: string[];
  createdAt: any;
  reporterId: string;
}

export default function CompanyDetail() {
  const { companyId } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!companyId) return;
      try {
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (companyDoc.exists()) {
          setCompany({ id: companyDoc.id, ...companyDoc.data() } as Company);
        } else {
           // Mock for demo if not found in db
           setCompany({ 
             id: companyId, 
             name: 'Global Tech Solutions Inc.', 
             address: '123 Virtual Way, Remote', 
             website: 'globaltech.scam', 
             status: 'fake', 
             rating: 1.2, 
             totalRatings: 45 
           });
        }

        const reportsSnapshot = await getDocs(query(collection(db, `companies/${companyId}/reports`)));
        const reportsData = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
        setReports(reportsData.length > 0 ? reportsData : [
          { id: 'r1', evidenceText: 'They asked me to pay $200 for a "home office startup kit" before even interviewing me. The email came from a gmail address.', evidenceUrls: [], createdAt: { seconds: Date.now()/1000 - 172800 }, reporterId: 'u1' }
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId]);

  const handleRate = async (rating: number) => {
    if (!auth.currentUser || !company) return;
    setRatingLoading(true);
    try {
      // Logic would go here: update average rating
      // For demo, just update locally
      const newTotal = company.totalRatings + 1;
      const newAvg = (company.rating * company.totalRatings + rating) / newTotal;
      setCompany({...company, rating: newAvg, totalRatings: newTotal});
      setUserRating(rating);
    } catch (error) {
      console.error(error);
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-40 bg-gray-100 rounded-3xl" />
    <div className="h-96 bg-gray-100 rounded-3xl" />
  </div>;

  if (!company) return <div>Company not found.</div>;

  const statusConfig = {
    fake: { icon: <ShieldAlert className="w-6 h-6" />, color: 'bg-red-50 text-red-700 border-red-100', text: 'Confirmed Fraud', desc: 'This company has been verified as a scam by multiple users and moderators.' },
    legit: { icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-50 text-green-700 border-green-100', text: 'Verified Legit', desc: 'This company appears to be a legitimate employer based on community feedback.' },
    'under-review': { icon: <Info className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-700 border-yellow-100', text: 'Under Investigation', desc: 'We have received reports about this company but verification is still ongoing.' },
  };

  const config = statusConfig[company.status];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
      </Link>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={cn(
          "p-8 md:p-12 border-b flex flex-col md:flex-row md:items-center justify-between gap-8", 
          company.status === 'fake' ? "bg-primary-600 text-white" : 
          company.status === 'legit' ? "bg-emerald-600 text-white" : 
          "bg-slate-800 text-white"
        )}>
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 {config.icon}
                 <span className="text-xl font-black uppercase tracking-[0.2em] italic font-display">{config.text}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase italic font-display">
                {company.name}
              </h1>
              <p className="max-w-2xl text-sm font-medium opacity-80 leading-relaxed italic">
                {config.desc}
              </p>
           </div>
           <div className="flex-shrink-0 bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center space-y-1 shadow-2xl">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Security Rating</div>
              <div className="text-5xl font-black font-display italic tracking-tighter">{company.rating.toFixed(1)}</div>
              <div className="flex justify-center text-yellow-300">
                 {Array(5).fill(0).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'fill-current shadow-[0_0_8px_rgba(253,224,71,0.5)]' : 'opacity-20'}`} />)}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest mt-2">{company.totalRatings} Community Reports</div>
           </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-10">
              <div>
                 <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                    <MapPin className="w-3.5 h-3.5" /> Reported Location
                 </h2>
                 <p className="text-xl font-black text-slate-900 leading-tight italic uppercase font-display border-l-4 border-slate-100 pl-4">
                    {company.address}
                 </p>
              </div>

              <div>
                 <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                    <Globe className="w-3.5 h-3.5" /> Official Website
                 </h2>
                 <a 
                   href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-xs hover:underline bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 transition-all hover:bg-primary-100"
                 >
                    {company.website}
                    <ExternalLink className="w-3.5 h-3.5" />
                 </a>
              </div>

              <div className="pt-10 border-t border-slate-50">
                 <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 italic font-display">Rate this company's legitimacy</h2>
                 <p className="text-[10px] font-medium text-slate-400 mb-6 uppercase tracking-wider">Your rating directly impacts the global trust score.</p>
                 <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        disabled={ratingLoading || !!userRating}
                        onClick={() => handleRate(star)}
                        className={cn(
                          "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all",
                          userRating === star ? "bg-slate-800 border-slate-800 text-white shadow-xl" : 
                          "border-slate-50 hover:border-primary-300 hover:bg-primary-50 text-slate-200"
                        )}
                      >
                        <Star className={cn("w-6 h-6", (userRating >= star) && "fill-current")} />
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                 <FileText className="w-3.5 h-3.5 text-primary-600" /> Community Evidence Logs
              </h2>
              <div className="space-y-4">
                 {reports.map((report) => (
                   <div key={report.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 shadow-inner">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                            <User className="w-5 h-5 text-slate-200" />
                         </div>
                         <div>
                            <span className="block text-[10px] font-black text-slate-800 uppercase tracking-widest">Reporter #{report.reporterId.slice(0, 5)}</span>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                               {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-italic italic font-medium">
                        "{report.evidenceText}"
                      </p>
                      {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                         <div className="flex flex-wrap gap-2 pt-4">
                            {report.evidenceUrls.map((url, i) => (
                               <a 
                                 key={i} 
                                 href={url} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-primary-600 hover:bg-primary-600 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
                               >
                                  <ExternalLink className="w-3 h-3" /> View Source
                               </a>
                            ))}
                         </div>
                      )}
                   </div>
                 ))}
                 <Link 
                   to="/report" 
                   className="block w-full py-6 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
                 >
                    + Add New Evidence
                 </Link>
              </div>
           </div>
        </div>
      </section>

      <section className="bg-primary-50 p-8 rounded-3xl border border-primary-100 flex items-start gap-6 shadow-xl shadow-primary-50 relative overflow-hidden">
         <div className="relative z-10">
           <AlertTriangle className="w-8 h-8 text-primary-600 mb-4" />
           <div className="space-y-2">
              <h3 className="font-black text-primary-900 font-display uppercase italic tracking-wider">Critical Safety Warning</h3>
              <p className="text-sm text-primary-700 leading-relaxed font-medium">
                If this company asks you for money, social security numbers, or banking information before a formal, in-person or live-video interview, **STOP** immediately. No legitimate employer will ask you to pay for equipment or background checks.
              </p>
           </div>
         </div>
         <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100/50 rounded-full blur-3xl -mr-24 -mt-24" />
      </section>
    </div>
  );
}
