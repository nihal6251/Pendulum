import { useState } from 'react';
import { usePendulumPhysics } from './hooks/usePendulumPhysics';
import PendulumCanvas from './components/PendulumCanvas';
import ControlPanel from './components/ControlPanel';
import GraphPanel from './components/GraphPanel';
import CircularDiagram from './components/CircularDiagram';
import './App.css';

function App() {
  const [params, setParams] = useState({
    length: 1.5,
    mass: 1.0,
    gravity: 9.81,
    damping: 0.05,
    initialAngle: Math.PI / 4,
  });

  const physics = usePendulumPhysics(params);

  const handleParamsChange = (newParams) => {
    setParams(newParams);
    physics.updateParams(newParams);
  };

  const handleStart = () => {
    physics.start();
  };

  const handlePause = () => {
    physics.pause();
  };

  const handleReset = () => {
    physics.reset(params.initialAngle);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Pendulum Simulator</h1>
        <p>Interactive PhET-style Physics Simulation</p>
      </header>

      <div className="app-content">
        <div className="left-column">
          <PendulumCanvas 
            physics={physics} 
            params={params} 
            width={600} 
            height={500} 
          />
          
          <CircularDiagram physics={physics} />
        </div>

        <div className="right-column">
          <ControlPanel
            params={params}
            onParamsChange={handleParamsChange}
            physics={physics}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
          />
        </div>
      </div>

      <div className="app-graphs">
        <GraphPanel physics={physics} />
      </div>

      <footer className="app-footer">
        <p>Built with React, Pixi.js, and Matter.js | Physics simulation using RK4 integration</p>
      </footer>
    </div>
  );
}

export default App;
