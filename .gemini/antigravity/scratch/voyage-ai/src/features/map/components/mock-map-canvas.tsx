import React, { useState, useRef } from "react";
import { MapWaypoint } from "../providers/map-provider";
import { Icons } from "@/components/ui/icons";
import { GlassCard } from "@/components/ui/glass-card";

interface MockMapCanvasProps {
  waypoints: MapWaypoint[];
  activeWaypointId: string | null;
  onSelectWaypoint?: (id: string) => void;
}

export function MockMapCanvas({
  waypoints,
  activeWaypointId,
  onSelectWaypoint,
}: MockMapCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredWaypoint, setHoveredWaypoint] = useState<MapWaypoint | null>(null);

  const containerRef = useRef<SVGSVGElement>(null);

  // Map Width / Height (Internal Coordinate Space)
  const mapWidth = 800;
  const mapHeight = 600;

  // Handle Dragging / Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    setZoom(Math.min(3, Math.max(0.5, nextZoom)));
  };

  // 1. Map normalized waypoint coordinates to SVG coordinate space
  // We will distribute the waypoints nicely in the center of the map
  const getWaypointSVGCoords = (wp: MapWaypoint, idx: number) => {
    // Spread them in a winding path in the center
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    
    // Stable offset based on sequence number
    const angle = (wp.sequence * 75 * Math.PI) / 180;
    const radius = 120 + (wp.sequence * 35);
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius * 0.7,
    };
  };

  // 2. Generate Route Line Path
  const generateRoutePath = () => {
    if (waypoints.length === 0) return "";
    return waypoints
      .map((wp, idx) => {
        const coords = getWaypointSVGCoords(wp, idx);
        return `${idx === 0 ? "M" : "L"} ${coords.x} ${coords.y}`;
      })
      .join(" ");
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#070b19]">
      {/* Zoom / Pan Instructions */}
      <div className="absolute top-3 left-3 z-10 glass border border-white/5 px-2.5 py-1 rounded-lg text-[9px] text-muted-foreground uppercase font-bold tracking-wider pointer-events-none">
        Drag to Pan • Scroll to Zoom
      </div>

      {/* SVG Canvas */}
      <svg
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Decorative Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={mapWidth * 3} height={mapHeight * 3} x={-mapWidth} y={-mapHeight} fill="url(#grid)" />

          {/* Decorative Rivers/Coastline */}
          <path
            d="M -200 300 C 200 250, 400 450, 1000 350"
            fill="none"
            stroke="rgba(91, 140, 255, 0.06)"
            strokeWidth="30"
            strokeLinecap="round"
          />

          {/* Glowing Route Line */}
          {waypoints.length > 1 && (
            <>
              {/* Solid Background Line */}
              <path
                d={generateRoutePath()}
                fill="none"
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Glowing Foreground Line */}
              <path
                d={generateRoutePath()}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse-slow"
                style={{ filter: "drop-shadow(0px 0px 4px #8B5CF6)" }}
              />
            </>
          )}

          {/* Waypoints */}
          {waypoints.map((wp, idx) => {
            const coords = getWaypointSVGCoords(wp, idx);
            const isActive = activeWaypointId === wp.id;
            const isHovered = hoveredWaypoint?.id === wp.id;

            return (
              <g
                key={wp.id}
                onClick={() => onSelectWaypoint?.(wp.id)}
                onMouseEnter={() => setHoveredWaypoint(wp)}
                onMouseLeave={() => setHoveredWaypoint(null)}
                className="cursor-pointer pointer-events-auto"
              >
                {/* Pulsing ring for active node */}
                {isActive && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="15"
                    fill="none"
                    stroke="#5B8CFF"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isActive ? "7" : "5"}
                  fill={isActive ? "#5B8CFF" : "#1e293b"}
                  stroke={isActive ? "#ffffff" : "#8B5CF6"}
                  strokeWidth="2"
                  className="transition-all duration-300"
                  style={{ filter: isActive ? "drop-shadow(0px 0px 6px #5B8CFF)" : "none" }}
                />

                {/* Waypoint Label */}
                <text
                  x={coords.x}
                  y={coords.y - 12}
                  textAnchor="middle"
                  fill={isActive ? "#ffffff" : "rgba(255,255,255,0.6)"}
                  fontSize="8"
                  fontWeight={isActive ? "bold" : "normal"}
                  className="font-mono bg-black/80 pointer-events-none select-none"
                >
                  {wp.time}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover/Active Waypoint Details Card */}
      {(hoveredWaypoint || (activeWaypointId && waypoints.find((w) => w.id === activeWaypointId))) && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          {(() => {
            const wp = hoveredWaypoint || waypoints.find((w) => w.id === activeWaypointId)!;
            return (
              <GlassCard padding="sm" className="border-glow bg-slate-950/85 text-left flex gap-3 items-center pointer-events-auto shadow-glass animate-fade-in">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Icons.explore className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">
                      {wp.time}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">
                      Waypoint {wp.sequence}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-0.5">{wp.title}</p>
                </div>
              </GlassCard>
            );
          })()}
        </div>
      )}
    </div>
  );
}
