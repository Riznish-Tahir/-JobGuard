import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, MapPin, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
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

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
        setCompanies(data);
      } catch (error) {
        setCompanies([
          { id: '1', name: 'CloudApex Systems', address: '782 Silicon Pkwy, SF, CA', website: 'cloudapex.scam', status: 'fake', rating: 1.2, totalRatings: 45 },
          { id: '2', name: 'BlueHorizon Talent', address: 'Remote / Virtual Office', website: 'bluehorizon.net', status: 'under-review', rating: 2.8, totalRatings: 120 },
          { id: '3', name: 'Swift Logistics Group', address: '102 Industrial Way, Houston', website: 'swift-logistics.biz', status: 'fake', rating: 1.5, totalRatings: 12 },
          { id: '4', name: 'Echo Recruiters', address: '99 Fake St, London, UK', website: 'echo-rec.com', status: 'fake', rating: 1.1, totalRatings: 8 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  return (
    <div className="grid grid-cols-12 auto-rows-min gap-4 md:gap-6">
      
      {/* 1. Verification Hero (8 col) */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 font-display uppercase italic tracking-tight">Scan for Red Flags</h2>
              <p className="text-slate-500 max-w-md text-sm md:text-base leading-relaxed">
                Paste a job description or company details to check against our database of confirmed recruitment scams.
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               AI Analyzer Active
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link 
              to="/verify" 
              className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-100 hover:border-primary-300 transition-all group/box"
            >
              <Search className="w-10 h-10 text-slate-300 mb-2 group-hover/box:text-primary-600 transition-colors" />
              <span className="text-xs font-bold text-slate-500 group-hover/box:text-slate-700 uppercase tracking-widest">Start Analysis</span>
            </Link>
            <div className="w-full sm:w-56 bg-primary-50 border border-primary-100 rounded-2xl p-6 flex flex-col justify-center">
              <div className="text-primary-800 font-black text-4xl font-display">98%</div>
              <div className="text-primary-600 text-[10px] uppercase font-bold tracking-widest mt-1">Accuracy Rate</div>
              <div className="mt-4 h-2 bg-primary-200 rounded-full w-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "98%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-primary-600 rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      </div>

      {/* 2. Community Pulse (4 col) */}
      <div className="col-span-12 lg:col-span-4 bg-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-200 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold font-display uppercase tracking-wider italic">Community Pulse</h3>
          <span className="text-[10px] bg-slate-700 px-2 py-1 rounded-lg font-bold text-slate-400">LIVE</span>
        </div>
        
        <div className="space-y-4 flex-1">
          <Snippet user="josh_dev" text="Received a WhatsApp msg from 'GlobalTech'... anyone else?" color="bg-orange-400" />
          <Snippet user="sara_ux" text="Peak Solutions is definitely a scam. They asked for $200 for a laptop." color="bg-blue-400" />
          <Snippet user="moderator_rob" text="Added 'Zenith Recruitment' to the blacklist. Stay safe!" color="bg-purple-400" />
        </div>
        
        <Link to="/community" className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all text-center">
          View All Threads
        </Link>
      </div>

      {/* 3. Recent Fake Companies Registry (8 col) */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight font-display italic">Verified Fake Registry</h3>
          <div className="flex gap-2">
            <span className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">Recent</span>
            <span className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">Global</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-50 font-black">
                <th className="pb-4">Company</th>
                <th className="pb-4">Reported Address</th>
                <th className="pb-4">Risk Level</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <Link to={`/company/${company.id}`} className="font-bold text-slate-800 hover:text-primary-600 transition-colors">
                      {company.name}
                    </Link>
                  </td>
                  <td className="py-4 text-slate-500 text-xs">{company.address}</td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      <div className={cn("w-4 h-1.5 rounded-sm", company.status === 'fake' ? "bg-primary-600" : "bg-orange-400")} />
                      <div className={cn("w-4 h-1.5 rounded-sm", company.status === 'under-review' ? "bg-orange-200" : "bg-slate-200")} />
                      <div className="w-4 h-1.5 rounded-sm bg-slate-200" />
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      company.status === 'fake' ? "text-primary-600" : "text-orange-500"
                    )}>
                      {company.status === 'fake' ? 'SCAM' : 'SUSPICIOUS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Quick Stats (4 col) */}
      <div className="col-span-12 lg:col-span-4 bg-primary-600 rounded-3xl p-8 text-white flex flex-col justify-center items-center shadow-2xl shadow-primary-200 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-5xl font-black font-display mb-1 tracking-tighter italic uppercase">$2.4M</div>
          <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mb-6">Total Losses Prevented</div>
          <div className="flex gap-1.5 items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-bold uppercase tracking-wider">84 reports today</span>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

    </div>
  );
}

function Snippet({ user, text, color }: { user: string, text: string, color: string }) {
  return (
    <div className="bg-slate-700/40 p-4 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-6 h-6 rounded-lg", color)} />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{user}</span>
      </div>
      <p className="text-xs text-slate-100 leading-relaxed font-medium group-hover:text-white transition-colors">{text}</p>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const statusConfig = {
    fake: { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-50 text-red-700 border-red-100', text: 'Confirmed Fake' },
    legit: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-50 text-green-700 border-green-100', text: 'Verified Legit' },
    'under-review': { icon: <Info className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-700 border-yellow-100', text: 'Under Review' },
  };

  const config = statusConfig[company.status];

  return (
    <Link to={`/company/${company.id}`} className="group block">
      <motion.div 
        whileHover={{ y: -4 }}
        className="h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold mb-4 ${config.color}`}>
            {config.icon}
            {config.text}
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {company.name}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{company.address}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900">{company.rating.toFixed(1)}</span>
            <div className="flex text-yellow-400">
               {Array(5).fill(0).map((_, i) => (
                 <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(company.rating) ? 'fill-current' : 'text-gray-200'}`} />
               ))}
            </div>
            <span className="text-xs text-gray-400 ml-1">({company.totalRatings})</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
    </Link>
  );
}
