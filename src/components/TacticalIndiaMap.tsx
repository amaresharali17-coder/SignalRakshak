"use client"

import React, { useMemo } from 'react'
import { RFSignal } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TacticalIndiaMapProps {
  signals: RFSignal[]
  onSignalClick?: (signal: RFSignal) => void
  className?: string
}

/**
 * A simplified SVG-based map of India with signal blip projection.
 * Coordinates are mapped from Lat/Lng to SVG coordinate space.
 */
export function TacticalIndiaMap({ signals, onSignalClick, className }: TacticalIndiaMapProps) {
  // India Bounding Box for SVG projection
  const minLat = 6.0;
  const maxLat = 38.0;
  const minLng = 68.0;
  const maxLng = 98.0;

  // Simplified path of India's border
  const indiaPath = "M46.7,91.8c0,0-1.7-1.3-1.4-2.7c0.2-1.3,0.3-2.9-0.5-3.6c-0.8-0.8-2.6-0.5-3.5-0.1c-0.9,0.3-1.6,1-2.5,1.4 c-0.8,0.4-1.9,0.2-2.8-0.1c-0.9-0.3-1.4-1.4-1.5-2.5c-0.1-1.1,1.1-1.9,1.7-2.8c0.6-0.8,0.2-2.1-0.1-3c-0.4-0.9-1.4-1.2-1.7-2.2 c-0.3-1.1,0.2-2.1,0.9-2.9c0.7-0.9,1.7-1.4,2.5-2.1c0.8-0.7,0.8-1.9,0.8-2.9c0-1.1-0.2-2.1,0-3.1c0.2-1.1,1.1-1.8,2-2.5 c0.9-0.7,1.7-1.4,2.2-2.4c0.4-1,0.2-2.2,0.1-3.2c-0.1-1.1,0-2.2,0.4-3.1c0.4-1,1.2-1.6,2-2.3c0.8-0.7,1.7-1.2,2.3-2 c0.6-0.8,0.6-1.9,0.7-2.9c0.1-1.1,0-2.1,0.4-3.1c0.4-1,1.3-1.7,2.2-2.4c0.9-0.7,1.8-1.5,2.4-2.5c0.5-1,0.5-2.1,0.8-3.1 c0.3-1,0.9-1.8,1.8-2.3c0.9-0.6,2-0.6,3.1-0.6s2.1,0,3.1,0.5c1,0.5,1.7,1.4,2.2,2.4c0.5,1,0.7,2.1,1,3.2c0.3,1.1,0.9,2,1.8,2.7 c0.9,0.7,2,1.1,3.1,1.5c1.1,0.4,2.2,0.8,3,1.5c0.8,0.7,1.2,1.8,1.3,2.9c0.1,1.1-0.2,2.1,0.1,3.1c0.3,1,1.2,1.7,2,2.4 c0.8,0.7,1.7,1.3,2.3,2c0.6,0.8,0.8,1.7,1.3,2.5c0.5,0.8,1.4,1.4,1.8,2.2c0.4,0.9,0.3,2,0,3c-0.3,1-1.1,1.7-1.8,2.5 c-0.7,0.8-1.1,1.7-1.4,2.7c-0.3,1-0.1,2.1,0.2,3.1c0.3,1,0.9,1.8,0.9,2.9c0,1.1-0.6,1.9-1.4,2.6c-0.8,0.7-1.7,1-2.5,1.6 c-0.8,0.5-1.4,1.3-1.8,2.2c-0.4,0.9-0.4,2,0,2.9c0.4,0.9,1.2,1.6,1.4,2.6c0.2,1-0.2,2-0.9,2.8c-0.7,0.8-1.7,1.2-2.6,1.7 c-0.9,0.4-1.7,0.9-2.3,1.7c-0.6,0.8-0.9,1.8-1.5,2.7c-0.6,0.9-1.6,1.4-2.6,1.8c-1,0.4-2.1,0.4-3.1,0.7c-1.1,0.3-2,1-2.7,1.9 c-0.7,0.9-1.1,1.9-1.8,2.8c-0.7,0.9-1.6,1.5-2.7,1.7c-1.1,0.2-2.2,0-3.3,0.1c-1.1,0.1-2.1,0.7-3,1.5c-0.9,0.8-1.4,2-2.3,2.7 c-0.9,0.7-2,1-3.1,1s-2.1-0.3-3.1-0.8c-1-0.5-1.7-1.4-2.5-2.1c-0.8-0.7-1.8-1.1-2.9-1.1S47.8,91.3,46.7,91.8z";

  const getProjection = (lat: number, lng: number) => {
    // Linear interpolation for SVG space (0-100 units)
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  return (
    <div className={cn("relative w-full aspect-[4/5] bg-primary/[0.02] border border-primary/10 rounded-sm overflow-hidden", className)}>
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      {/* India Outline */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full p-8"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={indiaPath}
          fill="rgba(34, 211, 238, 0.03)"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="0.5"
          className="glow-primary"
        />
        
        {/* Signal Blips */}
        {signals.map((sig) => {
          const { x, y } = getProjection(sig.location.lat, sig.location.lng);
          return (
            <g 
              key={sig.id} 
              className="cursor-pointer group" 
              onClick={(e) => {
                e.stopPropagation();
                onSignalClick?.(sig);
              }}
            >
              <circle
                cx={x}
                cy={y}
                r="1.2"
                className={cn(
                  "animate-pulse transition-all duration-500",
                  sig.classification === 'FRIENDLY' ? "fill-[#00FF41]" : 
                  sig.classification === 'UNKNOWN' ? "fill-[#FFD700]" : "fill-destructive"
                )}
              />
              <circle
                cx={x}
                cy={y}
                r="3"
                className={cn(
                  "animate-combat-pulse opacity-30",
                  sig.classification === 'FRIENDLY' ? "fill-[#00FF41]" : 
                  sig.classification === 'UNKNOWN' ? "fill-[#FFD700]" : "fill-destructive"
                )}
              />
              {/* Tactical Label on Hover */}
              <text
                x={x + 2}
                y={y - 2}
                fontSize="2"
                className="fill-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none"
              >
                {sig.source_ip}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Map Metadata */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Theater: Indian Subcontinent</span>
        <span className="text-[8px] font-mono text-primary/40 uppercase">Scale: 1:1,000,000 Tactical Grid</span>
      </div>
      
      <div className="absolute top-4 right-4 px-2 py-1 bg-primary/10 border border-primary/20 rounded-sm">
        <span className="text-[9px] font-mono text-primary font-bold animate-pulse">LIVE FEED: ACTIVE</span>
      </div>
    </div>
  )
}
