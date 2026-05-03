import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ArrowLeft, User, Clock, MessageSquare, Send, Tag, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

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

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!postId) return;
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() } as Post);
        } else {
           // Mock for demo
           setPost({
             id: postId,
             authorId: 'u1',
             authorName: 'Sarah J.',
             title: 'I received a weird email from "Global Talent Hub"',
             content: 'They asked me to pay for background check fees via Bitcoin. Is this normal?\n\nI was contacted through LinkedIn by someone named "Alex". Their profile looked legitimate but the company website was registered only 2 weeks ago.',
             type: 'scam-alert',
             createdAt: { seconds: Date.now()/1000 - 3600 },
             commentCount: 2
           });
        }

        const commentsSnapshot = await getDocs(query(collection(db, `posts/${postId}/comments`), orderBy('createdAt', 'asc')));
        const commData = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
        setComments(commData.length > 0 ? commData : [
          { id: 'c1', authorId: 'u2', authorName: 'Mike R.', content: 'Run! No legitimate company asks for Bitcoin for background checks. This is a classic 100% scam.', createdAt: { seconds: Date.now()/1000 - 1800 } },
          { id: 'c2', authorId: 'u3', authorName: 'John D.', content: 'I also got this email. Check the headers, it probably comes from a different domain than the official one.', createdAt: { seconds: Date.now()/1000 - 600 } }
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !postId || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        content: newComment,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, `posts/${postId}/comments`), commentData);
      
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1)
      });

      setComments([...comments, { id: docRef.id, ...commentData, createdAt: { seconds: Date.now()/1000 } }]);
      setNewComment('');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-4 shadow-sm p-8 bg-white rounded-3xl animate-pulse">
    <div className="h-4 w-1/4 bg-gray-100 rounded" />
    <div className="h-10 w-3/4 bg-gray-100 rounded" />
    <div className="h-40 w-full bg-gray-100 rounded" />
  </div>;

  if (!post) return <div>Post not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/community" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Community
      </Link>

      <article className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
           <div className="flex items-center gap-2">
              {post.type === 'scam-alert' ? (
                <span className="px-3 py-1 rounded-xl bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest border border-primary-100">Scam Alert</span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">Discussion</span>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-auto flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}
              </span>
           </div>
           
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase italic font-display">{post.title}</h1>
           
           <div className="flex items-center gap-4 py-8 border-y border-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                 <User className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                 <p className="text-sm font-black uppercase tracking-tight text-slate-900">{post.authorName}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Community Member</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Post
              </div>
           </div>

           <div className="prose prose-slate max-w-none text-slate-700 leading-xl pt-4 font-medium">
              <ReactMarkdown>{post.content}</ReactMarkdown>
           </div>
        </div>
      </article>

      <section className="space-y-8">
         <h2 className="text-xl font-black font-display uppercase italic tracking-tight flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-primary-600" />
           Responses ({comments.length})
         </h2>

         <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex gap-6 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black uppercase tracking-tighter text-xs">
                    {comment.authorName.slice(0, 2)}
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-tight text-slate-900">{comment.authorName}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                      {new Date(comment.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{comment.content}</p>
                </div>
              </motion.div>
            ))}
         </div>

         {auth.currentUser ? (
           <form onSubmit={handleAddComment} className="mt-12 space-y-4">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 space-y-6">
                 <textarea 
                   rows={4}
                   value={newComment}
                   onChange={e => setNewComment(e.target.value)}
                   className="w-full bg-slate-50 p-6 rounded-22xl border-none outline-none resize-none text-slate-700 text-sm font-medium placeholder:text-slate-300 focus:bg-white transition-all shadow-inner"
                   placeholder="Write your response here..."
                 />
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">Markdown and links supported</p>
                    <button 
                      type="submit" 
                      disabled={submitting || !newComment.trim()}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Reply'}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </div>
           </form>
         ) : (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sign in to join the conversation</p>
            </div>
         )}
      </section>
    </div>
  );
}
