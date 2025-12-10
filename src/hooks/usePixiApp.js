import { useEffect, useState } from 'react';
import * as PIXI from 'pixi.js-legacy';

export function usePixiApp(containerRef, width, height) {
  const [app, setApp] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Allow performance caveat and enable legacy fallback
    PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;

    const pixiApp = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x0f0f1e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      powerPreference: 'high-performance',
    });

    // Append the canvas view created by PIXI into our container
    try {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(pixiApp.view);
      // Ensure the canvas element has explicit size
      pixiApp.view.width = width;
      pixiApp.view.height = height;
      pixiApp.view.style.width = `${width}px`;
      pixiApp.view.style.height = `${height}px`;
      pixiApp.view.style.display = 'block';
    } catch (e) {
      console.error('Failed to attach PIXI view:', e);
    }

    setApp(pixiApp);

    return () => {
      pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
      setApp(null);
    };
  }, [containerRef, width, height]);

  return app;
}
