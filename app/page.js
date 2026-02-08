import { supabase } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  // 1. Fetch real data from Supabase
  const { data: dbProfiles } = await supabase.from('profiles').select('*');
  
  // 2. Define High-Quality Mock Data for the Demo
  // This ensures the graph looks full even if your DB is empty
  const mockNodes = [
    { 
      id: 'm1', 
      full_name: 'Arjun Mehta', 
      roll_no: '22BCE001', 
      skills: ['React', 'Next.js', 'Tailwind'], 
      bio: 'Building the future of web apps.',
      batch_year: '2026'
    },
    { 
      id: 'm2', 
      full_name: 'Sara Khan', 
      roll_no: '22BCE045', 
      skills: ['Figma', 'UI Design', 'Adobe XD'], 
      bio: 'Pixel perfect designs are my passion.',
      batch_year: '2026'
    },
    { 
      id: 'm3', 
      full_name: 'Leo Das', 
      roll_no: '22BIT012', 
      skills: ['Python', 'FastAPI', 'PostgreSQL'], 
      bio: 'Backend architect and coffee lover.',
      batch_year: '2026'
    },
    { 
      id: 'm4', 
      full_name: 'Priya Sharma', 
      roll_no: '22BDS089', 
      skills: ['Python', 'Machine Learning', 'TensorFlow'], 
      bio: 'Turning data into insights.',
      batch_year: '2026'
    },
    { 
      id: 'm5', 
      full_name: 'Vikram Singh', 
      roll_no: '22BCS102', 
      skills: ['Flutter', 'Firebase', 'Dart'], 
      bio: 'Mobile apps that scale.',
      batch_year: '2026'
    }
  ];

  // 3. Combine Real + Mock Data
  const combinedProfiles = [...(dbProfiles || []), ...mockNodes];

  // 4. Format the nodes for the Force Graph
  const nodes = combinedProfiles.map(p => ({
    id: p.id,
    name: p.full_name,
    roll: p.roll_no,
    skills: p.skills || [], // Important: Ensure this is always an array
    bio: p.bio,
    batch: p.batch_year,
    val: 15 // This sets the size of the node
  }));

  // 5. Create some initial links between people who share skills
  // In a real app, you'd calculate this, but for a demo, we hardcode a few
  const links = [
    { source: 'm1', target: 'm2' }, // Dev meets Designer
    { source: 'm1', target: 'm3' }, // Frontend meets Backend
    { source: 'm3', target: 'm4' }, // Backend meets Data
    { source: 'm5', target: 'm1' }  // Mobile meets Frontend
  ];

  // 6. Pass everything to the Dashboard
  const initialData = { nodes, links };

  return (
    <main>
      <Dashboard initialData={initialData} />
    </main>
  );
}