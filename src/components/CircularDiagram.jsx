import { useRef, useEffect } from 'react';
import './CircularDiagram.css';

export default function CircularDiagram({ physics }) {
  const phasorCanvasRef = useRef(null);
  const orbitCanvasRef = useRef(null);
  const orbitPointsRef = useRef([]);

  useEffect(() => {
    const animate = () => {
      const state = physics.getState();

      if (!state) {
        requestAnimationFrame(animate);
        return;
      }

      const width = 250;
      const height = 250;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 80;

      // Rotating Phasor
      if (phasorCanvasRef.current) {
        const ctx = phasorCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Outer circle
        ctx.strokeStyle = '#4a4a5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Reference circles
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (radius * i) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#3a3a4e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - radius - 10, centerY);
        ctx.lineTo(centerX + radius + 10, centerY);
        ctx.moveTo(centerX, centerY - radius - 10);
        ctx.lineTo(centerX, centerY + radius + 10);
        ctx.stroke();

        // Phasor vector
        const angle = state.angle;
        const phasorX = centerX + radius * Math.sin(angle);
        const phasorY = centerY + radius * Math.cos(angle);

        // Gradient for phasor
        const gradient = ctx.createLinearGradient(centerX, centerY, phasorX, phasorY);
        gradient.addColorStop(0, '#00ffc8');
        gradient.addColorStop(1, '#00b894');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(phasorX, phasorY);
        ctx.stroke();

        // Arrowhead
        const arrowSize = 10;
        const arrowAngle = Math.atan2(phasorX - centerX, phasorY - centerY);
        ctx.fillStyle = '#00ffc8';
        ctx.beginPath();
        ctx.moveTo(phasorX, phasorY);
        ctx.lineTo(
          phasorX - arrowSize * Math.sin(arrowAngle - Math.PI / 6),
          phasorY - arrowSize * Math.cos(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
          phasorX - arrowSize * Math.sin(arrowAngle + Math.PI / 6),
          phasorY - arrowSize * Math.cos(arrowAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Angle text
        ctx.fillStyle = '#b8b8d0';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `θ = ${(angle * 180 / Math.PI).toFixed(1)}°`,
          centerX,
          height - 20
        );
      }

      // Circular Orbit Visualization
      if (orbitCanvasRef.current) {
        const ctx = orbitCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Orbit circle
        ctx.strokeStyle = '#4a4a5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Reference circles
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (radius * i) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Add current point
        const angle = state.angle;
        const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const orbitX = centerX + radius * Math.sin(normalizedAngle);
        const orbitY = centerY + radius * Math.cos(normalizedAngle);

        if (physics.isRunning.current) {
          orbitPointsRef.current.push({ 
            x: orbitX, 
            y: orbitY,
            alpha: 1 
          });
          
          if (orbitPointsRef.current.length > 100) {
            orbitPointsRef.current.shift();
          }

          // Fade trail
          orbitPointsRef.current = orbitPointsRef.current.map((point, index) => ({
            ...point,
            alpha: index / orbitPointsRef.current.length
          }));
        } else {
          orbitPointsRef.current = [];
        }

        // Draw trail
        orbitPointsRef.current.forEach((point, index) => {
          if (index > 0) {
            const prev = orbitPointsRef.current[index - 1];
            ctx.strokeStyle = `rgba(255, 107, 107, ${point.alpha * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        });

        // Current position dot
        ctx.fillStyle = '#ff6b6b';
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Center dot
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Angular velocity text
        ctx.fillStyle = '#b8b8d0';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `ω = ${state.angularVelocity.toFixed(2)} rad/s`,
          centerX,
          height - 20
        );
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [physics]);

  return (
    <div className="circular-diagram">
      <h2>Circular Visualizations</h2>
      <div className="diagrams-grid">
        <div className="diagram-container">
          <h3>Rotating Phasor</h3>
          <canvas ref={phasorCanvasRef} width={250} height={250} />
        </div>

        <div className="diagram-container">
          <h3>Circular Orbit</h3>
          <canvas ref={orbitCanvasRef} width={250} height={250} />
        </div>
      </div>
    </div>
  );
}
