The Invisible 🕸️

The Invisible is a community-driven networking platform specifically designed for the IIITDMJ community. It visualizes the "unseen" connections between students and faculty across the entire college, allowing users to find peers with specific technical skills and contact them for collaborations, projects, or mentorship.

🚀 Purpose

1.In a large campus like IIITDMJ, talent is often siloed within branches or batches. The Invisible breaks these barriers by:

2.Skill Discovery: Finding that one person in a different batch who knows Rust or Figma.

3.Peer Networking: Visualizing how your skills bridge the gap between different technical clusters.

4.College-Wide Access: A unified directory to find and contact peers from across the campus based on what they can build.

🛠️ Tech Stack

Frontend: Next.js (App Router), Tailwind CSS

Visualization: D3.js via react-force-graph-2d

Backend/Database: Supabase (PostgreSQL)

Icons: Lucide-React

🚀 Getting Started
1. Clone & Install

Bash

    git clone https://github.com/rajvi0106/The-Invisible.git
    cd The-Invisible
    npm install

3. Environment Setup

Add your Supabase credentials to a .env.local file:
Code snippet

    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

3. Run Development

Bash

    npm run dev
