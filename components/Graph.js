"use client";
import dynamic from 'next/dynamic';
import { useRef, useEffect, useState, useCallback } from 'react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function Graph({ graphData }) {
    const graphRef = useRef();
    const [hoveredNode, setHoveredNode] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.d3ReheatSimulation();
        }
    }, [graphData]);
    const handleMouseMove = useCallback((e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    }, []);
    const handleNodeHover = useCallback((node) => {
        setHoveredNode(node || null);
    }, []);

    return (
        <div className="relative w-full h-full cursor-crosshair " onMouseMove={handleMouseMove}>
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                backgroundColor="rgba(0,0,0,0)"

                // FIX 2: You MUST pass the function here
                onNodeHover={handleNodeHover}

                nodeColor={node => node.color || '#3b82f6'}
                nodeRelSize={8}
                linkColor={() => '#1e293b'}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}

                // This ensures the canvas object doesn't block hover events
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false); // Match size to RelSize
                    ctx.fill();
                }}

                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 14 / globalScale;
                    ctx.font = `${fontSize}px Inter, sans-serif`;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);

                    // Check if it is the one being hovered
                    const isHovered = hoveredNode && hoveredNode.id === node.id;

                    if (node.isHighlighted || isHovered) {
                        ctx.shadowColor = '#60a5fa';
                        ctx.shadowBlur = 15;
                        ctx.fillStyle = '#60a5fa';
                    } else {
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = node.color || '#1e293b';
                    }

                    ctx.fill();

                    if (node.isHighlighted || isHovered || globalScale > 2) {
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = (node.isHighlighted || isHovered) ? '#ffffff' : '#475569';
                        ctx.fillText(label, node.x, node.y + 10);
                    }
                }}
            />

            {/* FLOATING CARD */}
            {hoveredNode && (
                <div
                    className="fixed z-9999 pointer-events-none" // Increased z-index
                    style={{
                        left: mousePos.x + 20,
                        top: mousePos.y + 20
                    }}
                >
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 p-5 rounded-2xl shadow-2xl w-72 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-lg">
                                {hoveredNode.name?.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-white font-extrabold text-base leading-tight">{hoveredNode.name}</h4>
                                <p className="text-blue-400 text-xs font-mono tracking-widest uppercase">{hoveredNode.roll || 'Explorer'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-slate-300 text-xs leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
                                {hoveredNode.bio || 'Creating the invisible...'}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {(hoveredNode.skills || []).map(skill => (
                                    <span key={skill} className="bg-blue-500/10 text-blue-300 text-[10px] px-2.5 py-1 rounded-md border border-blue-500/20 font-medium uppercase">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}