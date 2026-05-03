import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle, MessageSquare, CheckCircle, Search, User, Menu, X, PlusCircle, Star, ThumbsUp, MapPin, ExternalLink } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, logout, isConfigured } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Components
import Home from './pages/Home';
import Report from './pages/Report';
import Verify from './pages/Verify';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import CompanyDetail from './pages/CompanyDetail';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        {!isConfigured && (
          <div className="bg-primary-50 border-b border-primary-100 p-2 text-center text-xs text-primary-800">
            Firebase is not yet configured. Some features may not work. 
            <a href="https://console.firebase.google.com" target="_blank" className="ml-2 underline">Setup Guide</a>
          </div>
        )}

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sticky top-0 z-50">
          <div className="bg-white px-4 md:px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 font-display">JobGuard<span className="text-primary-600">.</span></h1>
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                <NavLink to="/verify">Verify</NavLink>
                <NavLink to="/community">Community</NavLink>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{user.displayName}</p>
                    <button onClick={() => logout()} className="text-[10px] uppercase font-bold text-slate-400 hover:text-primary-600 transition-colors">Sign Out</button>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-xl border border-slate-100 p-0.5" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <Link to="/report" className="ml-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all">
                    Report Scam
                  </Link>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => signInWithGoogle()}
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 px-2"
                  >
                    Login
                  </button>
                  <Link to="/report" className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all">
                    Report Scam
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <Link to="/report" className="bg-primary-600 text-white p-2 rounded-lg shadow-lg shadow-primary-100">
                <AlertTriangle className="w-5 h-5" />
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-500">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden"
              >
                <div className="p-4 space-y-1">
                  <MobileNavLink to="/verify" onClick={() => setIsMenuOpen(false)}>Verify Company</MobileNavLink>
                  <MobileNavLink to="/community" onClick={() => setIsMenuOpen(false)}>Community Discussion</MobileNavLink>
                  {!user && (
                    <button 
                      onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-base font-bold text-primary-600"
                    >
                      Login with Google
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<Report />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:postId" element={<PostDetail />} />
              <Route path="/company/:companyId" element={<CompanyDetail />} />
            </Routes>
          </motion.div>
        </main>

        <footer className="footer-gradient bg-white border-t border-slate-100 py-16 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="bg-slate-100 p-3 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 font-display mb-2">JobGuard<span className="text-primary-600">.</span></h2>
            <p className="text-slate-500 text-sm font-medium">Empowering job seekers with truth.</p>
            <div className="flex gap-6 mt-8">
               <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800">Privacy</a>
               <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800">Terms</a>
               <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800">Contact</a>
            </div>
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-12">© 2024 JOBGUARD COMMUNITY PROJECT</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
        isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string, children: React.ReactNode, onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "block px-4 py-3 rounded-xl text-base font-bold",
        isActive ? "bg-slate-50 text-slate-900" : "text-slate-500"
      )}
    >
      {children}
    </Link>
  );
}

export default App;
