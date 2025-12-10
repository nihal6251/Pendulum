import { useState } from 'react';
import './ControlPanel.css';

export default function ControlPanel({ 
  params, 
  onParamsChange, 
  physics,
  onStart,
  onPause,
  onReset,
  isRunning,
  hasStarted,
}) {
  const [timeScale, setTimeScale] = useState(1);

  const handleSliderChange = (param, value) => {
    onParamsChange({ ...params, [param]: value });
  };

  const handleTimeScale = (scale) => {
    setTimeScale(scale);
    physics.setTimeScale(scale);
  };

  const primaryLabel = isRunning ? '⏸ Pause' : (hasStarted ? '▶ Resume' : '▶ Start');

  return (
    <div className="control-panel">
      <h2>Controls</h2>
      
      <div className="button-group">
        <button 
          className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
          onClick={isRunning ? onPause : onStart}
        >
          {primaryLabel}
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          🔄 Reset
        </button>
      </div>

      <div className="control-section">
        <h3>Parameters</h3>
        
        <div className="slider-group">
          <label>
            Length: {params.length.toFixed(2)} m
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={params.length}
            onChange={(e) => handleSliderChange('length', parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <label>
            Gravity: {params.gravity.toFixed(2)} m/s²
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={params.gravity}
            onChange={(e) => handleSliderChange('gravity', parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <label>
            Mass: {params.mass.toFixed(2)} kg
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={params.mass}
            onChange={(e) => handleSliderChange('mass', parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <label>
            Damping: {params.damping.toFixed(3)}
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={params.damping}
            onChange={(e) => handleSliderChange('damping', parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <label>
            Initial Angle: {(params.initialAngle * 180 / Math.PI).toFixed(1)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={params.initialAngle * 180 / Math.PI}
            onChange={(e) => {
              const angle = parseFloat(e.target.value) * Math.PI / 180;
              handleSliderChange('initialAngle', angle);
              if (!isRunning) {
                physics.setAngle(angle);
              }
            }}
          />
        </div>
      </div>

      <div className="control-section">
        <h3>Time Scale</h3>
        <div className="button-group speed-control">
          <button 
            className={`btn-small ${timeScale === 0.25 ? 'active' : ''}`}
            onClick={() => handleTimeScale(0.25)}
          >
            0.25×
          </button>
          <button 
            className={`btn-small ${timeScale === 0.5 ? 'active' : ''}`}
            onClick={() => handleTimeScale(0.5)}
          >
            0.5×
          </button>
          <button 
            className={`btn-small ${timeScale === 1 ? 'active' : ''}`}
            onClick={() => handleTimeScale(1)}
          >
            1×
          </button>
          <button 
            className={`btn-small ${timeScale === 2 ? 'active' : ''}`}
            onClick={() => handleTimeScale(2)}
          >
            2×
          </button>
        </div>
      </div>
    </div>
  );
}
