import { useRef, useEffect } from 'react';
import { drawGraph, drawPhaseSpace } from '../utils/graphUtils';
import './GraphPanel.css';

export default function GraphPanel({ physics }) {
  const angleCanvasRef = useRef(null);
  const velocityCanvasRef = useRef(null);
  const energyCanvasRef = useRef(null);
  const phaseCanvasRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      const graphData = physics.getGraphData();
      const state = physics.getState();

      if (!state) {
        requestAnimationFrame(animate);
        return;
      }

      const width = 300;
      const height = 200;

      // Angle vs Time
      if (angleCanvasRef.current) {
        const ctx = angleCanvasRef.current.getContext('2d');
        const timeRange = graphData.angle.length > 0 
          ? [
              Math.max(0, state.time - 10),
              state.time + 1
            ]
          : [0, 10];
        drawGraph(
          ctx,
          graphData.angle,
          width,
          height,
          '#00ffc8',
          timeRange,
          [-Math.PI, Math.PI]
        );

        // Labels
        ctx.fillStyle = '#b8b8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time (s)', width / 2 - 20, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Angle (rad)', -30, 0);
        ctx.restore();
      }

      // Angular Velocity vs Time
      if (velocityCanvasRef.current) {
        const ctx = velocityCanvasRef.current.getContext('2d');
        const maxVel = Math.max(
          5,
          ...graphData.angularVelocity.map(p => Math.abs(p.y))
        );
        const timeRange = graphData.angularVelocity.length > 0
          ? [
              Math.max(0, state.time - 10),
              state.time + 1
            ]
          : [0, 10];
        drawGraph(
          ctx,
          graphData.angularVelocity,
          width,
          height,
          '#ff6b6b',
          timeRange,
          [-maxVel, maxVel]
        );

        ctx.fillStyle = '#b8b8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time (s)', width / 2 - 20, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('ω (rad/s)', -30, 0);
        ctx.restore();
      }

      // Energy vs Time (showing both PE and KE)
      if (energyCanvasRef.current) {
        const ctx = energyCanvasRef.current.getContext('2d');
        
        // Clear and draw background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        if (graphData.potentialEnergy && graphData.kineticEnergy && 
            graphData.potentialEnergy.length > 0 && graphData.kineticEnergy.length > 0) {
          
          // Find the range for both energies combined
          const allEnergies = [
            ...graphData.potentialEnergy.map(p => p.y),
            ...graphData.kineticEnergy.map(p => p.y),
            ...graphData.energy.map(p => p.y)
          ];
          const minEnergy = Math.min(...allEnergies);
          const maxEnergy = Math.max(...allEnergies);
          
          const energyRange = maxEnergy - minEnergy;
          const yMin = energyRange < 1 ? Math.max(0, minEnergy - 2) : Math.max(0, minEnergy - energyRange * 0.1);
          const yMax = energyRange < 1 ? maxEnergy + 2 : maxEnergy + energyRange * 0.1;
          
          const timeRange = [
            Math.max(0, state.time - 10),
            state.time + 1
          ];
          
          // Draw grid first
          const padding = 40;
          ctx.strokeStyle = '#2a2a3e';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i <= 5; i++) {
            const x = padding + (i * (width - 2 * padding)) / 5;
            const y = padding + (i * (height - 2 * padding)) / 5;
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
          }
          ctx.stroke();
          
          // Draw axes
          ctx.strokeStyle = '#4a4a5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padding, padding);
          ctx.lineTo(padding, height - padding);
          ctx.lineTo(width - padding, height - padding);
          ctx.stroke();
          
          // Helper function to draw energy line
          const drawEnergyLine = (data, color, lineWidth = 2) => {
            if (!data || data.length < 2) return;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            
            const xMin = timeRange[0];
            const xMax = timeRange[1];
            
            data.forEach((point, index) => {
              const x = padding + ((point.x - xMin) / (xMax - xMin)) * (width - 2 * padding);
              const y = height - padding - ((point.y - yMin) / (yMax - yMin)) * (height - 2 * padding);
              
              if (index === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            });
            
            ctx.stroke();
          };
          
          // Draw total energy (light yellow, thin line)
          drawEnergyLine(graphData.energy, '#ffd93d', 1.5);
          
          // Draw potential energy (blue)
          drawEnergyLine(graphData.potentialEnergy, '#4a90e2', 2.5);
          
          // Draw kinetic energy (red/orange)
          drawEnergyLine(graphData.kineticEnergy, '#ff6b6b', 2.5);
          
          // Add legend
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#4a90e2';
          ctx.fillText('PE', width - 100, 25);
          ctx.fillStyle = '#ff6b6b';
          ctx.fillText('KE', width - 70, 25);
          ctx.fillStyle = '#ffd93d';
          ctx.fillText('Total', width - 40, 25);
        }

        ctx.fillStyle = '#b8b8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time (s)', width / 2 - 20, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Energy (J)', -30, 0);
        ctx.restore();
      }

      // Phase Space
      if (phaseCanvasRef.current) {
        const ctx = phaseCanvasRef.current.getContext('2d');
        drawPhaseSpace(ctx, graphData.phaseSpace, width, height);

        ctx.fillStyle = '#b8b8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText('θ (rad)', width / 2 - 20, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('ω (rad/s)', -35, 0);
        ctx.restore();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [physics]);

  return (
    <div className="graph-panel">
      <h2>Real-Time Graphs</h2>
      <div className="graphs-grid">
        <div className="graph-container">
          <h3>Angle vs Time</h3>
          <canvas ref={angleCanvasRef} width={300} height={200} />
        </div>

        <div className="graph-container">
          <h3>Angular Velocity vs Time</h3>
          <canvas ref={velocityCanvasRef} width={300} height={200} />
        </div>

        <div className="graph-container">
          <h3>Energy vs Time</h3>
          <canvas ref={energyCanvasRef} width={300} height={200} />
        </div>

        <div className="graph-container">
          <h3>Phase Space (θ vs ω)</h3>
          <canvas ref={phaseCanvasRef} width={300} height={200} />
        </div>
      </div>
    </div>
  );
}
