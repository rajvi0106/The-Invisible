"use client";
import { useState, useMemo, useEffect } from 'react';
import { Search, Zap, X, CheckCircle2, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Graph from '@/components/Graph';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard({ initialData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [networkData, setNetworkData] = useState(initialData);
  const [myId, setMyId] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    roll_no: '',
    batch_year: '2026',
    bio: '',
    skills: []
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth'); // Redirect if not logged in
        setMyId(null);
      } else {
        setMyId(session.user.id);
        setLoading(false); // Only show the dashboard if logged in
      }
    };
    checkAuth();
    // Also listen for auth changes (like signing out)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setMyId(session.user.id);
      } else {
        setMyId(null);
        router.push('/auth');
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const filteredData = useMemo(() => {
    return {
      nodes: networkData.nodes.map(node => {
        const skills = Array.isArray(node.skills) ? node.skills : [];
        const isMatch = searchQuery && skills.some(s => s.toLowerCase().includes(searchQuery));
        return {
          ...node,
          isHighlighted: isMatch,
          color: isMatch ? '#3b82f6' : (searchQuery ? '#0f172a' : '#3b82f6')
        };
      }),
      links: networkData.links.map(link => ({
        ...link,
        opacity: searchQuery ? 0.1 : 1
      }))
    };
  }, [searchQuery, networkData]);

  if (loading) return <div className="h-screen bg-[#020617] text-white flex items-center justify-center">Verifying Session...</div>;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Make sure we use the ID from the logged-in user if available
    if (!myId) {
      alert("You must be logged in to join the network.");
      setIsSubmitting(false);
      return;
    }
    const { data, error } = await supabase
      .from('users') // Changed to 'users' to match your previous setup
      .upsert([{
        id: myId, // If logged in, update their specific record
        full_name: formData.full_name,
        roll_no: formData.roll_no,
        batch_year: formData.batch_year,
        bio: formData.bio,
        skills_with_levels: formData.skills.reduce((acc, s) => ({ ...acc, [s]: 'Beginner' }), {})
      }])
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else {
      const newNode = {
        id: data.id,
        name: data.full_name,
        skills: Object.keys(data.skills_with_levels || {}),
        val: 15
      };

      setNetworkData(prev => ({
        nodes: [...prev.nodes.filter(n => n.id !== data.id), newNode],
        links: [...prev.links, { source: newNode.id, target: prev.nodes[0]?.id || newNode.id }]
      }));

      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const handleSearch = () => {
    setSearchQuery(inputValue.trim().toLowerCase());
  };



  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(',', '');
      if (newSkill && !formData.skills.includes(newSkill)) {
        setFormData({ ...formData, skills: [...formData.skills, newSkill] });
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">

      {/* NAVIGATION */}
      <nav className="p-5 flex justify-between items-center border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-500" fill="currentColor" />
          <span className="text-xl font-bold tracking-tighter uppercase">The Invisible</span>
        </div>

        <div className="flex items-center gap-4">
          {myId ? (
            <>
              <Link href={`/profile/${myId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-medium">
                <User size={16} /> My Profile
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-2 text-red-500/80 hover:text-red-400 text-sm border border-red-500/20 px-3 py-1.5 rounded-xl transition-all"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="text-blue-500 text-sm font-bold hover:text-blue-400">Sign In</Link>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
          >
            Join Network
          </button>
        </div>
      </nav>

      {/* HERO & SEARCH */}
      <main className="flex-1 flex flex-col items-center pt-20 px-6">
        <div className="text-center mb-12 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Find the <span className="text-blue-500 text-glow">Unseen</span> Talent.
          </h2>
          <div className="relative max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                placeholder="Search skills (e.g. React)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button onClick={handleSearch} className="bg-blue-600 px-8 rounded-2xl font-bold hover:bg-blue-500 transition-all">
              Search
            </button>
          </div>
        </div>

        <div className="w-full max-w-6xl h-150 border border-slate-800/50 rounded-3xl bg-slate-900/10 relative overflow-hidden">
          <Graph graphData={filteredData} />
        </div>
      </main>

      {/* MODAL (Signup Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            {success ? (
              <div className="text-center py-10">
                <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Profile Updated!</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold">Join Network</h3>
                  <X className="cursor-pointer text-slate-500" onClick={() => setIsModalOpen(false)} />
                </div>
                <input required placeholder="Full Name" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                <input required placeholder="Roll Number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })} />
                <textarea placeholder="Bio" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 h-24" onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />

                <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      {skill} <X size={12} className="cursor-pointer" onClick={() => removeSkill(skill)} />
                    </span>
                  ))}
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Add skills..." className="bg-transparent outline-none text-sm p-1 flex-1" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold disabled:opacity-50 transition-all">
                  {isSubmitting ? "Syncing..." : "Add me to the Graph"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}