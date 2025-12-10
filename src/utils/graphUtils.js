export class GraphBuffer {
  constructor(maxPoints = 200) {
    this.maxPoints = maxPoints;
    this.data = [];
  }

  add(x, y) {
    this.data.push({ x, y });
    if (this.data.length > this.maxPoints) {
      this.data.shift();
    }
  }

  clear() {
    this.data = [];
  }

  get() {
    return this.data;
  }
}

export function drawGraph(ctx, data, width, height, color, xRange, yRange, padding = 40) {
  if (!data || data.length < 2) return;

  ctx.clearRect(0, 0, width, height);
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  // Grid
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

  // Axes
  ctx.strokeStyle = '#4a4a5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Data
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const xMin = xRange[0];
  const xMax = xRange[1];
  const yMin = yRange[0];
  const yMax = yRange[1];

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
}

export function drawPhaseSpace(ctx, data, width, height, padding = 40) {
  if (!data || data.length < 2) return;

  ctx.clearRect(0, 0, width, height);
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  // Grid circles
  ctx.strokeStyle = '#2a2a3e';
  ctx.lineWidth = 1;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - padding;
  
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (maxRadius * i) / 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#4a4a5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, centerY);
  ctx.lineTo(width - padding, centerY);
  ctx.moveTo(centerX, padding);
  ctx.lineTo(centerX, height - padding);
  ctx.stroke();

  // Find ranges
  let maxTheta = 0;
  let maxOmega = 0;
  data.forEach((point) => {
    maxTheta = Math.max(maxTheta, Math.abs(point.x));
    maxOmega = Math.max(maxOmega, Math.abs(point.y));
  });
  
  const scale = maxRadius / Math.max(maxTheta, maxOmega, 0.1);

  // Draw trail with gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(0, 255, 200, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 255, 200, 0.8)');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = centerX + point.x * scale;
    const y = centerY - point.y * scale;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Current point
  if (data.length > 0) {
    const last = data[data.length - 1];
    const x = centerX + last.x * scale;
    const y = centerY - last.y * scale;
    
    ctx.fillStyle = '#00ffc8';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
