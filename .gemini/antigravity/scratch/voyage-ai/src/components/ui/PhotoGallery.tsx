"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "./icons";
import { Button } from "./button";

interface PhotoGalleryProps {
  images: string[];
}

export function PhotoGallery({ images }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation for fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-32 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-muted-foreground text-xs">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-2 pointer-events-auto">
      {/* Active Hero Image */}
      <div 
        className="w-full h-36 rounded-xl overflow-hidden relative group cursor-zoom-in"
        onClick={() => setIsFullscreen(true)}
      >
        <img 
          src={images[activeIndex]} 
          alt="Selected Location" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-white font-bold bg-primary/80 px-2 py-0.5 rounded">
            Click to expand
          </span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-1.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-10 rounded-lg overflow-hidden border transition-all ${
                activeIndex === idx 
                  ? "border-primary scale-95" 
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 transition-all duration-300">
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">
              {activeIndex + 1} / {images.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="text-white hover:bg-white/10"
            >
              <Icons.close className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Large Image */}
          <div className="relative max-w-4xl max-h-[75vh] w-full flex items-center justify-center">
            <img 
              src={images[activeIndex]} 
              alt="Fullscreen View" 
              className="max-w-full max-h-full object-contain rounded-lg select-none"
            />

            {/* Navigation buttons */}
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
            >
              <Icons.chevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
            >
              <Icons.chevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Footer Instruction */}
          <div className="mt-4 text-[10px] text-zinc-500 uppercase tracking-wider">
            Use Left / Right Arrows to navigate • Press Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
