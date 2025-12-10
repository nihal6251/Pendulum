import { useRef, useEffect } from 'react';
import { drawGraph, drawPhaseSpace } from '../utils/graphUtils';
import './GraphPanel.css';

export default function GraphPanel({ physics }) {
  const angleCanvasRef = useRef(null);
  const velocityCanvasRef = useRef(null);
  const energyCanvasRef = useRef(null);
  const waveformCanvasRef = useRef(null);
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

      // Energy vs Time
      if (energyCanvasRef.current) {
        const ctx = energyCanvasRef.current.getContext('2d');
        const maxEnergy = Math.max(
          50,
          ...graphData.energy.map(p => p.y)
        );
        const timeRange = graphData.energy.length > 0
          ? [
              Math.max(0, state.time - 10),
              state.time + 1
            ]
          : [0, 10];
        drawGraph(
          ctx,
          graphData.energy,
          width,
          height,
          '#ffd93d',
          timeRange,
          [0, maxEnergy * 1.2]
        );

        ctx.fillStyle = '#b8b8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time (s)', width / 2 - 20, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Energy (J)', -30, 0);
        ctx.restore();
      }

      // Waveform (Y-position vs Time)
      if (waveformCanvasRef.current) {
        const ctx = waveformCanvasRef.current.getContext('2d');
        const maxY = Math.max(
          3,
          ...graphData.waveform.map(p => Math.abs(p.y))
        );
        const timeRange = graphData.waveform.length > 0
          ? [
              Math.max(0, state.time - 10),
              state.time + 1
            ]
          : [0, 10];
        drawGraph(
          ctx,
          graphData.waveform,
          width,
          height,
          '#a29bfe',
          timeRange,
          [-maxY, maxY]
        );

        ctx.fillStyle = '#b8b8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time (s)', width / 2 - 20, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Y (m)', -20, 0);
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
          <h3>Waveform (Y-Position)</h3>
          <canvas ref={waveformCanvasRef} width={300} height={200} />
        </div>

        <div className="graph-container">
          <h3>Phase Space (θ vs ω)</h3>
          <canvas ref={phaseCanvasRef} width={300} height={200} />
        </div>
      </div>
    </div>
  );
}
