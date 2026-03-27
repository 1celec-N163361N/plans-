import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function ShapeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Get theme colors based on active theme
    const getGridColor = () => {
      switch (theme) {
        case 'light-elegant': return 'rgba(0,0,0,0.03)';
        case 'emerald-premium': return 'rgba(16, 185, 129, 0.05)';
        case 'midnight-blue': return 'rgba(77, 157, 224, 0.05)';
        case 'dark-luxury': 
        default: return 'rgba(201, 162, 39, 0.05)';
      }
    };

    const getHighlightColor = () => {
      switch (theme) {
        case 'light-elegant': return 'rgba(139, 105, 20, 0.1)';
        case 'emerald-premium': return 'rgba(16, 185, 129, 0.15)';
        case 'midnight-blue': return 'rgba(77, 157, 224, 0.15)';
        case 'dark-luxury': 
        default: return 'rgba(201, 162, 39, 0.15)';
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      const gridSize = 60;
      const offsetX = (time * 20) % gridSize;
      const offsetY = (time * 20) % gridSize;

      ctx.strokeStyle = getGridColor();
      ctx.lineWidth = 1;

      // Draw grid
      ctx.beginPath();
      for (let x = -gridSize + offsetX; x < width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = -gridSize + offsetY; y < height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw moving highlights
      ctx.fillStyle = getHighlightColor();
      for (let i = 0; i < 20; i++) {
        const xOffset = Math.sin(time + i) * width * 0.5 + width / 2;
        const yOffset = Math.cos(time * 0.8 + i) * height * 0.5 + height / 2;
        
        // Snap to grid
        const gridX = Math.floor(xOffset / gridSize) * gridSize + offsetX;
        const gridY = Math.floor(yOffset / gridSize) * gridSize + offsetY;

        ctx.fillRect(gridX, gridY, gridSize, gridSize);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
    />
  );
}
