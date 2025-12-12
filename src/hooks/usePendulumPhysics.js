import { useRef, useEffect, useCallback } from 'react';
import { PendulumIntegrator } from '../utils/integrator';
import { GraphBuffer } from '../utils/graphUtils';

export function usePendulumPhysics(initialParams) {
  const integratorRef = useRef(null);
  const graphBuffersRef = useRef({
    angle: new GraphBuffer(200),
    angularVelocity: new GraphBuffer(200),
    energy: new GraphBuffer(200),
    potentialEnergy: new GraphBuffer(200),
    kineticEnergy: new GraphBuffer(200),
    phaseSpace: new GraphBuffer(400),
  });

  const isRunningRef = useRef(false);
  const timeScaleRef = useRef(1);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    integratorRef.current = new PendulumIntegrator(
      initialParams.length,
      initialParams.mass,
      initialParams.gravity,
      initialParams.damping
    );
    integratorRef.current.setAngle(initialParams.initialAngle);
  }, []);

  const updateParams = useCallback((params) => {
    if (integratorRef.current) {
      integratorRef.current.setParams(
        params.length,
        params.mass,
        params.gravity,
        params.damping
      );
    }
  }, []);

  const setAngle = useCallback((angle) => {
    if (integratorRef.current) {
      integratorRef.current.setAngle(angle);
    }
  }, []);

  const start = useCallback(() => {
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();
  }, []);

  const pause = useCallback(() => {
    isRunningRef.current = false;
  }, []);

  const reset = useCallback((angle = 0) => {
    if (integratorRef.current) {
      integratorRef.current.reset(angle);
    }
    Object.values(graphBuffersRef.current).forEach((buffer) => buffer.clear());
    isRunningRef.current = false;
  }, []);

  const setTimeScale = useCallback((scale) => {
    timeScaleRef.current = scale;
  }, []);

  const step = useCallback(() => {
    if (!integratorRef.current || !isRunningRef.current) return null;

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1) * timeScaleRef.current;
    lastTimeRef.current = now;

    integratorRef.current.step(dt);

    const integrator = integratorRef.current;
    const time = integrator.time;
    const angle = integrator.angle;
    const angularVelocity = integrator.angularVelocity;
    const energy = integrator.energy;
    const potentialEnergy = integrator.potentialEnergy;
    const kineticEnergy = integrator.kineticEnergy;

    graphBuffersRef.current.angle.add(time, angle);
    graphBuffersRef.current.angularVelocity.add(time, angularVelocity);
    graphBuffersRef.current.energy.add(time, energy);
    graphBuffersRef.current.potentialEnergy.add(time, potentialEnergy);
    graphBuffersRef.current.kineticEnergy.add(time, kineticEnergy);
    graphBuffersRef.current.phaseSpace.add(angle, angularVelocity);

    return {
      angle,
      angularVelocity,
      time,
      energy,
    };
  }, []);

  const getState = useCallback(() => {
    if (!integratorRef.current) return null;
    return {
      angle: integratorRef.current.angle,
      angularVelocity: integratorRef.current.angularVelocity,
      time: integratorRef.current.time,
      energy: integratorRef.current.energy,
      potentialEnergy: integratorRef.current.potentialEnergy,
      kineticEnergy: integratorRef.current.kineticEnergy,
    };
  }, []);

  const getGraphData = useCallback(() => {
    return {
      angle: graphBuffersRef.current.angle.get(),
      angularVelocity: graphBuffersRef.current.angularVelocity.get(),
      energy: graphBuffersRef.current.energy.get(),
      potentialEnergy: graphBuffersRef.current.potentialEnergy.get(),
      kineticEnergy: graphBuffersRef.current.kineticEnergy.get(),
      phaseSpace: graphBuffersRef.current.phaseSpace.get(),
    };
  }, []);

  return {
    integrator: integratorRef.current,
    isRunning: isRunningRef,
    updateParams,
    setAngle,
    start,
    pause,
    reset,
    setTimeScale,
    step,
    getState,
    getGraphData,
  };
}
