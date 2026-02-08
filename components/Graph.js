"use client";
import dynamic from 'next/dynamic';
import { useRef, useEffect } from 'react';

// Dynamically import to prevent SSR errors
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function Graph({ graphData }) {
  const graphRef = useRef();

  // This effect ensures the graph centers itself when data changes
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      backgroundColor="rgba(0,0,0,0)" // Transparent so our CSS bg shows
      nodeLabel="name"
      nodeColor={node => node.color || '#3b82f6'}
      nodeRelSize={6}
      // Link Styling
      linkColor={() => '#1e293b'}
      linkWidth={1.5}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
      
      // Advanced Node Rendering (The Glow)
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 14 / globalScale;
        ctx.font = `${fontSize}px Inter, sans-serif`;
        
        // Draw the Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
        
        if (node.isHighlighted) {
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#60a5fa';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = node.color || '#1e293b';
        }
        
        ctx.fill();

        // Draw Text Label only for highlighted nodes or when zoomed in
        if (node.isHighlighted || globalScale > 2) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.isHighlighted ? '#ffffff' : '#475569';
          ctx.fillText(label, node.x, node.y + 10);
        }
      }}
    />
  );
}