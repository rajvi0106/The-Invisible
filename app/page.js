import { supabase } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';

// This is a Server Component (No "use client" here!)
export default async function Home() {
  
  // 1. Fetch real data from Supabase
  // Change 'profiles' to 'users' if that's what your table is named
  const { data: dbProfiles } = await supabase.from('users').select('*');
  
  // 2. Mock Data for the Demo
  const mockNodes = [
    { 
      id: 'm1', 
      full_name: 'mahi Mehta', 
      roll_no: '22BCE001', 
      skills: ['React', 'Next.js', 'Tailwind'], 
      bio: 'Building the future of web apps.',
      batch_year: '2026'
    },
    { 
      id: 'm2', 
      full_name: 'Sara Khan', 
      roll_no: '22BCE045', 
      skills: ['Figma', 'UI Design'], 
      bio: 'Pixel perfect designs.',
      batch_year: '2026'
    }
  ];

  // 3. Combine Real + Mock Data
  const combinedProfiles = [...(dbProfiles || []), ...mockNodes];

  // 4. Format the nodes
  const nodes = combinedProfiles.map(p => {
    // Determine skills: handle both simple arrays AND our new JSON objects
    let skillList = [];
    if (Array.isArray(p.skills)) {
      skillList = p.skills;
    } else if (p.skills_with_levels) {
      skillList = Object.keys(p.skills_with_levels);
    }

    return {
      id: p.id,
      name: p.full_name,
      roll: p.roll_no,
      skills: skillList, 
      bio: p.bio,
      batch: p.batch_year,
      val: 15
    };
  });

  // 5. Initial Links
  const links = [
    { source: 'm1', target: 'm2' },
  ];

  const initialData = { nodes, links };

  return (
    <main>
      {/* Dashboard is a Client Component and will handle the Auth check */}
      <Dashboard initialData={initialData} />
    </main>
  );
}