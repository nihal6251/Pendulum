export class PendulumIntegrator {
  constructor(length, mass, gravity, damping) {
    this.length = length;
    this.mass = mass;
    this.gravity = gravity;
    this.damping = damping;
    this.angle = 0;
    this.angularVelocity = 0;
    this.time = 0;
    this.energy = 0;
    this.potentialEnergy = 0;
    this.kineticEnergy = 0;
    this.updateEnergy();
  }

  setParams(length, mass, gravity, damping) {
    this.length = length;
    this.mass = mass;
    this.gravity = gravity;
    this.damping = damping;
  }

  setAngle(angle) {
    this.angle = angle;
    this.angularVelocity = 0;
    this.updateEnergy();
  }

  reset(angle = 0) {
    this.angle = angle;
    this.angularVelocity = 0;
    this.time = 0;
    this.updateEnergy();
  }

  updateEnergy() {
    // Calculate energy relative to the lowest point (angle = 0 is hanging down)
    // Height is measured from the pivot point, positive upward
    // At angle = 0 (straight down), height = -length (lowest point)
    // We want PE = 0 at the lowest point, so we add length to shift the reference
    const height = this.length * (1 - Math.cos(this.angle));
    this.potentialEnergy = this.mass * this.gravity * height;
    this.kineticEnergy =
      0.5 * this.mass * this.length * this.length * this.angularVelocity * this.angularVelocity;
    this.energy = this.potentialEnergy + this.kineticEnergy;
  }

  getAngularAcceleration(angle, angularVelocity) {
    return (
      (-this.gravity / this.length) * Math.sin(angle) -
      this.damping * angularVelocity
    );
  }

  step(dt) {
    // RK4 integration for accuracy
    const k1_v = this.getAngularAcceleration(this.angle, this.angularVelocity);
    const k1_theta = this.angularVelocity;

    const k2_v = this.getAngularAcceleration(
      this.angle + 0.5 * dt * k1_theta,
      this.angularVelocity + 0.5 * dt * k1_v
    );
    const k2_theta = this.angularVelocity + 0.5 * dt * k1_v;

    const k3_v = this.getAngularAcceleration(
      this.angle + 0.5 * dt * k2_theta,
      this.angularVelocity + 0.5 * dt * k2_v
    );
    const k3_theta = this.angularVelocity + 0.5 * dt * k2_v;

    const k4_v = this.getAngularAcceleration(
      this.angle + dt * k3_theta,
      this.angularVelocity + dt * k3_v
    );
    const k4_theta = this.angularVelocity + dt * k3_v;

  this.angle += (dt / 6) * (k1_theta + 2 * k2_theta + 2 * k3_theta + k4_theta);
  this.angularVelocity += (dt / 6) * (k1_v + 2 * k2_v + 2 * k3_v + k4_v);
    
    this.time += dt;

    // Update energy after each step
    this.updateEnergy();
  }

  getBobPosition(pivotX, pivotY) {
    return {
      x: pivotX + this.length * Math.sin(this.angle),
      y: pivotY + this.length * Math.cos(this.angle),
    };
  }
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
