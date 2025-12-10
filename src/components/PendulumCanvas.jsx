import { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js-legacy';
import { usePixiApp } from '../hooks/usePixiApp';

export default function PendulumCanvas({ physics, params, width, height }) {
  const viewContainerRef = useRef(null);
  const app = usePixiApp(viewContainerRef, width, height);
  const containerRef = useRef(null);
  const rodRef = useRef(null);
  const bobRef = useRef(null);
  const trailGraphicsRef = useRef(null);
  const trailPointsRef = useRef([]);
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef(null);

  const [viewSize, setViewSize] = useState({ w: width, h: height });
  const pivotX = viewSize.w / 2;
  const pivotY = 100;

  const roRef = useRef(null);
  useEffect(() => {
    if (!app) return;

    // Resize observer to keep PIXI view matching container width
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.floor(entry.contentRect.width);
          const h = height; // keep fixed height for stable aspect
          if (w > 0) {
            setViewSize({ w, h });
            app.renderer.resize(w, h);
            if (app.view) {
              app.view.style.width = `${w}px`;
              app.view.style.height = `${h}px`;
            }
          }
        }
      });
      roRef.current = ro;
      if (viewContainerRef.current) {
        ro.observe(viewContainerRef.current);
      }
    } else {
      // Fallback: use window resize to approximate container changes
      const onResize = () => {
        const w = Math.floor(viewContainerRef.current?.clientWidth || width);
        const h = height;
        setViewSize({ w, h });
        app.renderer.resize(w, h);
        if (app.view) {
          app.view.style.width = `${w}px`;
          app.view.style.height = `${h}px`;
        }
      };
      window.addEventListener('resize', onResize);
      onResize();
      roRef.current = { disconnect: () => window.removeEventListener('resize', onResize) };
    }

    const container = new PIXI.Container();
    containerRef.current = container;
    app.stage.addChild(container);

    // Pivot point
    const pivot = new PIXI.Graphics();
    pivot.beginFill(0x888888);
    pivot.drawCircle(0, 0, 8);
    pivot.endFill();
    pivot.position.set(pivotX, pivotY);
    container.addChild(pivot);

    // Rod
    const rod = new PIXI.Graphics();
    rodRef.current = rod;
    container.addChild(rod);

    // Trail
    const trail = new PIXI.Graphics();
    trailGraphicsRef.current = trail;
    container.addChild(trail);

    // Bob - try to create a sprite, fallback to circle
    const bob = new PIXI.Graphics();
    bob.beginFill(0xff6b6b);
    bob.drawCircle(0, 0, 20);
    bob.endFill();
    bob.interactive = true;
    bob.cursor = 'pointer';
    bobRef.current = bob;
    container.addChild(bob);

    // Dragging logic
    const onDragStart = (event) => {
      if (physics.isRunning.current) return;
      isDraggingRef.current = true;
      bob.alpha = 0.8;
    };

    const onDragMove = (event) => {
      if (!isDraggingRef.current || physics.isRunning.current) return;
      
      const pos = event.global;
      const dx = pos.x - pivotX;
      const dy = pos.y - pivotY;
      const angle = Math.atan2(dx, dy);
      
      physics.setAngle(angle);
    };

    const onDragEnd = () => {
      isDraggingRef.current = false;
      bob.alpha = 1;
    };

    bob.on('pointerdown', onDragStart);
    bob.on('pointermove', onDragMove);
    bob.on('pointerup', onDragEnd);
    bob.on('pointerupoutside', onDragEnd);

    return () => {
      container.destroy({ children: true });
    };
  }, [app, physics, width, height]);

  useEffect(() => {
    if (!app || !physics) return;

    const animate = () => {
      const state = physics.step();
      
      if (state || !physics.isRunning.current) {
  const angle = physics.getState()?.angle || 0;
  // Dynamically scale to keep the bob within the canvas bounds
  const margin = 20;
  const scaleX = (width / 2 - margin) / Math.max(params.length, 0.001);
  const scaleY = (height - pivotY - margin) / Math.max(params.length, 0.001);
  const pixelsPerMeter = Math.min(scaleX, scaleY);
  const length = params.length * pixelsPerMeter;

        const bobX = pivotX + length * Math.sin(angle);
        const bobY = pivotY + length * Math.cos(angle);

        // Update rod
        if (rodRef.current) {
          rodRef.current.clear();
          rodRef.current.lineStyle(4, 0x4a90e2, 1);
          rodRef.current.moveTo(pivotX, pivotY);
          rodRef.current.lineTo(bobX, bobY);
        }

        // Update bob
        if (bobRef.current) {
          bobRef.current.position.set(bobX, bobY);
        }

        // Update trail
        if (physics.isRunning.current) {
          trailPointsRef.current.push({ x: bobX, y: bobY, alpha: 1 });
          if (trailPointsRef.current.length > 50) {
            trailPointsRef.current.shift();
          }

          // Fade trail
          trailPointsRef.current = trailPointsRef.current.map((point, index) => ({
            ...point,
            alpha: index / trailPointsRef.current.length,
          }));

          if (trailGraphicsRef.current) {
            trailGraphicsRef.current.clear();
            for (let i = 1; i < trailPointsRef.current.length; i++) {
              const p1 = trailPointsRef.current[i - 1];
              const p2 = trailPointsRef.current[i];
              trailGraphicsRef.current.lineStyle(2, 0x00ffc8, p2.alpha * 0.6);
              trailGraphicsRef.current.moveTo(p1.x, p1.y);
              trailGraphicsRef.current.lineTo(p2.x, p2.y);
            }
          }
        } else if (trailPointsRef.current.length > 0 && trailGraphicsRef.current) {
          trailGraphicsRef.current.clear();
          trailPointsRef.current = [];
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (roRef.current && typeof roRef.current.disconnect === 'function') {
        roRef.current.disconnect();
      }
    };
  }, [app, physics, params, height]);

  return (
  <div style={{ background: '#0f0f1e', borderRadius: '8px', overflow: 'hidden', width: '100%', height }}>
      {!app && (
        <div style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b8b8d0'
        }}>
          Initializing canvas...
        </div>
      )}
      <div ref={viewContainerRef} style={{ width: '100%', height }} />
    </div>
  );
}
