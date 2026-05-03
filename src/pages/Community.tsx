import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MessageSquare, ThumbsUp, MessageCircle, User, Plus, Clock, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  type: 'scam-alert' | 'discussion';
  createdAt: any;
  commentCount: number;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scam-alert' | 'discussion'>('all');

  // New Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'scam-alert' | 'discussion'>('discussion');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setPosts(data);
      } catch (error) {
        console.error(error);
        // Mock data
        setPosts([
          { id: 'p1', authorId: 'u1', authorName: 'Sarah J.', title: 'I received a weird email from "Global Talent Hub"', content: 'They asked me to pay for background check fees via Bitcoin. Is this normal?', type: 'scam-alert', createdAt: { seconds: Date.now()/1000 - 3600 }, commentCount: 12 },
          { id: 'p2', authorId: 'u2', authorName: 'Mike R.', title: 'Best practices for verifying remote companies', content: 'Always check if they use official domain emails and ask for an interview on camera.', type: 'discussion', createdAt: { seconds: Date.now()/1000 - 86400 }, commentCount: 5 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        title: newTitle,
        content: newContent,
        type: newType,
        createdAt: serverTimestamp(),
        commentCount: 0
      });
      
      const newPostObj: Post = {
        id: docRef.id,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        title: newTitle,
        content: newContent,
        type: newType,
        createdAt: { seconds: Date.now()/1000 },
        commentCount: 0
      };

      setPosts([newPostObj, ...posts]);
      setIsPosting(false);
      setNewTitle('');
      setNewContent('');
    } catch (error) {
       console.error(error);
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.type === filter);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categories</h2>
          <nav className="space-y-1">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Discussions</FilterButton>
            <FilterButton active={filter === 'scam-alert'} onClick={() => setFilter('scam-alert')} color="text-primary-600 bg-primary-50">Scam Alerts</FilterButton>
            <FilterButton active={filter === 'discussion'} onClick={() => setFilter('discussion')} color="text-slate-800 bg-slate-100">General Advice</FilterButton>
          </nav>
        </div>

        <div className="bg-slate-800 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden">
           <h3 className="font-bold font-display uppercase italic tracking-widest text-sm mb-4 relative z-10">Safe Harbor Rules</h3>
           <ul className="text-xs space-y-3 opacity-80 text-slate-300 font-medium relative z-10">
             <li className="flex gap-2"><span>•</span> No personal dox (phone/private info)</li>
             <li className="flex gap-2"><span>•</span> Be respectful to other victims</li>
             <li className="flex gap-2"><span>•</span> Link evidence where possible</li>
             <li className="flex gap-2"><span>•</span> No self-promotion or ads</li>
           </ul>
           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/50 rounded-full blur-3xl -mr-16 -mt-16" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black font-display uppercase italic tracking-tight">Community Forum</h1>
          <button 
            onClick={() => setIsPosting(!isPosting)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            {isPosting ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isPosting ? 'Cancel' : 'Start Discussion'}
          </button>
        </div>

        <AnimatePresence>
          {isPosting && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 overflow-hidden"
            >
              <h2 className="text-lg font-black font-display uppercase italic tracking-tight">Create New Post</h2>
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      required
                      type="text" 
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-primary-600 transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-primary-600 transition-all font-bold text-xs uppercase tracking-widest text-slate-600"
                    >
                      <option value="discussion">General</option>
                      <option value="scam-alert">Scam Alert</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content (Markdown supported)</label>
                  <textarea 
                    required
                    rows={5}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Share your experience or ask a question..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-primary-600 transition-all resize-none font-medium text-sm"
                  />
                </div>
                <div className="flex justify-end">
                   <button type="submit" className="px-8 py-3 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">Post Now</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="h-32 rounded-3xl bg-white border border-slate-50 animate-pulse" />)
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
               <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No discussions found in this category.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link to={`/community/${post.id}`} className="block group">
      <motion.div 
        whileHover={{ x: 4 }}
        className="bg-white p-6 rounded-3xl border border-transparent group-hover:border-blue-100 shadow-sm group-hover:shadow-md transition-all space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-1">
                {post.type === 'scam-alert' ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">Alert</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Discussion</span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}
                </span>
             </div>
             <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
               {post.title}
             </h3>
          </div>
        </div>

        <div className="text-gray-600 text-sm line-clamp-2">
          {post.content}
        </div>

        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 text-gray-500 text-xs font-semibold">
                <User className="w-3 h-3" />
                {post.authorName}
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <MessageSquare className="w-4 h-4" />
                {post.commentCount} Comments
              </div>
           </div>
           <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Read Full Post →</span>
        </div>
      </motion.div>
    </Link>
  );
}

function FilterButton({ children, active, onClick, color }: { children: React.ReactNode, active: boolean, onClick: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:translate-x-1",
        active ? (color || "bg-gray-900 text-white shadow-lg shadow-gray-200") : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      {children}
    </button>
  );
}

function X(props: any) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
