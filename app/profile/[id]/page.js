"use client";
import { useState, useEffect,use } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Award, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function UserProfile({ params }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams.id;
  const [userData, setUserData] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data on load
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) setUserData(data);
      setLoading(false);
    };
    if(userId) fetchUser();
  }, [userId]);

  if (loading) return <div className="p-20 text-center text-slate-500 font-mono">LOADING_PROFILE_DATA...</div>;
  
  if (!userData) return (
    <div className="p-20 text-center text-white">
      <h2 className="text-xl font-bold">User Not Found</h2>
      <p className="text-slate-400 mt-2">The ID "{userId}" does not exist in the database.</p>
      <a href="/" className="text-blue-500 underline mt-4 block">Go Back Home</a>
    </div>
  );

  const handleAddSkill = async () => {
    if (!newSkill.name) return;
    setIsUpdating(true);
    
    // Merge new skill into the existing JSONB object
    const updatedSkills = { 
      ...(userData.skills_with_levels || {}), 
      [newSkill.name]: newSkill.level 
    };
    
    const { error } = await supabase
      .from('users')
      .update({ skills_with_levels: updatedSkills })
      .eq('id', userData.id);

    if (!error) {
      setUserData({ ...userData, skills_with_levels: updatedSkills });
      setNewSkill({ name: '', level: 'Beginner' });
    }
    setIsUpdating(false);
  };

  const removeSkill = async (skillName) => {
    const updatedSkills = { ...userData.skills_with_levels };
    delete updatedSkills[skillName];

    const { error } = await supabase
      .from('users')
      .update({ skills_with_levels: updatedSkills })
      .eq('id', userData.id);

    if (!error) setUserData({ ...userData, skills_with_levels: updatedSkills });
  };

  if (!userData) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500 font-mono">
      LOADING_PROFILE_DATA...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* BACK BUTTON */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-10 transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Return to Network</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR: USER CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.full_name}`} 
                    alt="pfp"
                    className="w-32 h-32 rounded-3xl bg-slate-800 border-2 border-blue-500/30 p-1"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-lg shadow-lg">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                
                <h1 className="text-3xl font-black tracking-tighter">{userData.full_name}</h1>
                <p className="text-blue-500 font-mono text-xs mt-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  {userData.roll_no}
                </p>
                
                <div className="w-full h-px bg-slate-800 my-8" />
                
                <div className="text-left w-full">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Biography</p>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    {userData.bio || "No bio provided yet."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT: SKILLS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Award className="text-blue-500" /> Skill Proficiency
                </h3>
                <span className="text-slate-500 text-xs font-mono">
                  {Object.keys(userData.skills_with_levels || {}).length} Skills Added
                </span>
              </div>

              {/* SKILL ADDER */}
              <div className="flex flex-col md:flex-row gap-3 mb-12">
                <input 
                  placeholder="E.g. React, Docker, UI Design..."
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                />
                <select 
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 outline-none cursor-pointer text-sm font-bold"
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Hard</option>
                </select>
                <button 
                  onClick={handleAddSkill}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> {isUpdating ? 'Adding...' : 'Add Skill'}
                </button>
              </div>

              {/* SKILLS LIST */}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(userData.skills_with_levels || {}).length > 0 ? (
                  Object.entries(userData.skills_with_levels).map(([name, level]) => (
                    <div key={name} className="group flex items-center justify-between p-6 bg-slate-950/30 border border-slate-800/50 rounded-2xl hover:border-blue-500/30 transition-all">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold capitalize text-slate-100">{name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            level === 'Hard' ? 'text-red-400' : level === 'Intermediate' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {level}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {/* Visual Progress Bar */}
                        <div className="w-24 md:w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full transition-all duration-700 ${
                            level === 'Hard' ? 'w-full bg-red-500' : 
                            level === 'Intermediate' ? 'w-2/3 bg-yellow-500' : 
                            'w-1/3 bg-green-500'
                          }`} />
                        </div>
                        <button 
                          onClick={() => removeSkill(name)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                    <p className="text-slate-600 text-sm font-mono uppercase tracking-widest">No skills found in arsenal</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}