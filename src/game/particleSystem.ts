import { Particle, FloatingText } from './tetrisConstants';

export function createLineClearParticles(
  clearedRows: number[],
  cellSize: number,
  boardOffsetX: number,
  boardOffsetY: number,
  rowColors: string[][]
): Particle[] {
  const particles: Particle[] = [];

  clearedRows.forEach((rowIdx, rowListIdx) => {
    const colors = rowColors[rowListIdx] || [];
    for (let col = 0; col < 10; col++) {
      const cellColor = colors[col] || '#06b6d4';
      const cellCenterX = boardOffsetX + col * cellSize + cellSize / 2;
      const cellCenterY = boardOffsetY + (rowIdx - 2) * cellSize + cellSize / 2;

      // Spawn 4-6 spark/block fragments per cell
      for (let k = 0; k < 4; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
          id: Math.random().toString(36).substring(2, 9),
          x: cellCenterX + (Math.random() - 0.5) * cellSize * 0.8,
          y: cellCenterY + (Math.random() - 0.5) * cellSize * 0.8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 3 + Math.random() * 4,
          color: cellColor,
          alpha: 1,
          life: 0,
          maxLife: 25 + Math.random() * 20, // frames
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
        });
      }
    }
  });

  return particles;
}

export function createHardDropParticles(
  pieceX: number,
  pieceY: number,
  cellSize: number,
  boardOffsetX: number,
  boardOffsetY: number,
  color: string
): Particle[] {
  const particles: Particle[] = [];
  const baseCenterX = boardOffsetX + pieceX * cellSize + cellSize * 1.5;
  const baseBottomY = boardOffsetY + (pieceY - 2) * cellSize + cellSize * 2;

  for (let i = 0; i < 16; i++) {
    const angle = -Math.PI * (0.1 + Math.random() * 0.8); // upward flare
    const speed = 2 + Math.random() * 5;
    particles.push({
      id: Math.random().toString(36).substring(2, 9),
      x: baseCenterX + (Math.random() - 0.5) * cellSize * 2,
      y: baseBottomY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3.5,
      color: color,
      alpha: 1,
      life: 0,
      maxLife: 18 + Math.random() * 12,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
    });
  }

  return particles;
}

export function updateParticles(particles: Particle[]): Particle[] {
  const updated: Particle[] = [];
  const gravity = 0.18;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.life += 1;
    if (p.life >= p.maxLife) continue;

    p.x += p.vx;
    p.y += p.vy;
    p.vy += gravity;
    p.vx *= 0.98;
    p.rotation += p.vRot;
    p.alpha = Math.max(0, 1 - p.life / p.maxLife);

    updated.push(p);
  }

  return updated;
}

export function updateFloatingTexts(texts: FloatingText[]): FloatingText[] {
  const updated: FloatingText[] = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    t.life += 1;
    if (t.life >= t.maxLife) continue;

    t.y -= 1.2; // Float upward
    t.opacity = Math.max(0, 1 - Math.pow(t.life / t.maxLife, 1.5));
    t.scale = 1 + (t.life / t.maxLife) * 0.15;

    updated.push(t);
  }

  return updated;
}
