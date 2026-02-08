"use client";
import { useState, useMemo } from 'react';
import { Search, UserPlus, Zap, Globe, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Graph from '@/components/Graph';

export default function Dashboard({ initialData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [networkData, setNetworkData] = useState(initialData);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    roll_no: '',
    batch_year: '2026',
    bio: '',
    skills: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Insert into Profiles table
    const { error } = await supabase
      .from('profiles')
      .insert([{
        full_name: formData.full_name,
        roll_no: formData.roll_no,
        batch_year: formData.batch_year,
        bio: formData.bio,
        skills: formData.skills
      }]).select().single();


    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      const newNode = {
        id: data.id,
        name: data.full_name,
        roll: data.roll_no,
        skills: data.skills,
        bio: data.bio,
        val: 15
      };
      setNetworkData(prev => ({
        nodes: [...prev.nodes, newNode],
        links: [...prev.links, { source: newNode.id, target: prev.nodes[0].id }]
      }))
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setFormData({ full_name: '', roll_no: '', batch_year: '2026', bio: '' });
      }, 2000);
    }
    setIsSubmitting(false);
  };
  const handleSearch = () => {
    setSearchQuery(inputValue.trim().toLowerCase());
  };
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return {
        nodes: networkData.nodes.map(node => ({
          ...node,
          isHighlighted: false,
          color: '#3b82f6' // Default Blue
        })),
        links: networkData.links.map(link => ({ ...link, opacity: 1 }))
      };
    }

    return {
      nodes: networkData.nodes.map(node => ({
        ...node,
        // Highlighting logic
        isHighlighted: node.skills.some(s => s.toLowerCase().includes(searchQuery)),
        color: node.skills.some(s => s.toLowerCase().includes(searchQuery))
          ? '#3b82f6' // Bright Blue for matches
          : '#0f172a'  // Dark Navy for non-matches
      })),
      links: networkData.links.map(link => ({
        ...link,
        // Dim the connections that aren't relevant
        opacity: searchQuery ? 0.1 : 1
      }))
    };
  }, [searchQuery, networkData]);

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
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30">

      {/* NAVIGATION */}
      <nav className="p-5 flex justify-between items-center border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={20} fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase">The Invisible</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-full transition-all font-semibold text-sm"
        >
          <UserPlus size={16} /> Join Network
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 relative flex flex-col items-center justify-start pt-20">
        <div className="z-20 text-center mb-12 px-6">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            Find the <span className="text-blue-500">Unseen</span> Talent.
          </h2>
          <div className="relative group max-w-2xl mx-auto mt-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
            <input
              type="text"
              placeholder="Search for skills or names..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg shadow-2xl"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        {/* GRAPH PLACEHOLDER */}
        <div className="w-full h-600px border border-slate-800/50 rounded-3xl bg-slate-900/10 relative overflow-hidden shadow-inner">
          <Graph graphData={filteredData} />
        </div>
      </main>

      {/* JOIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden">
            {success ? (
              <div className="text-center py-10 animate-in zoom-in">
                <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">You're in!</h3>
                <p className="text-slate-400">Welcome to the invisible network.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Create Profile</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                    <input
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. Rajvi Singh"
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Roll Number</label>
                    <input
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. 21BCE101"
                      onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Batch</label>
                      <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none"
                        onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                      >
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bio</label>
                    <textarea
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none focus:border-blue-500 transition-colors h-24"
                      placeholder="Tell us what you're building..."
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Skills (Press Enter to add)</label>
                    <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 mt-1 flex flex-wrap gap-2 min-h-48px focus-within:border-blue-500 transition-colors">
                      {formData.skills.map(skill => (
                        <span key={skill} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md text-sm flex items-center gap-1 border border-blue-500/30">
                          {skill}
                          <X size={14} className="cursor-pointer hover:text-white" onClick={() => removeSkill(skill)} />
                        </span>
                      ))}
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder={formData.skills.length === 0 ? "e.g. React, Python..." : ""}
                        className="bg-transparent outline-none flex-1 min-w-120px text-sm p-1"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Add me to the Graph"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
