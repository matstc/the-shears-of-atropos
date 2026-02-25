import {
  forceSimulation,
  forceLink,
  forceManyBody,
  Simulation,
  forceX,
  forceY
} from "d3-force";
import { ExtendedEdge, GraphNodeWithPosition } from "./types.ts"

export function createGraph(
  n: number,
  minWidthOrHeight: number,
  screenWidth: number,
  screenHeight: number
): {
  simulation: Simulation<GraphNodeWithPosition, undefined>
  nodes: GraphNodeWithPosition[]
  edges: ExtendedEdge[]
  onResize: Function
} {
  const nodes: GraphNodeWithPosition[] = [];
  const edges: ExtendedEdge[] = [];
  const edgeSet = new Set<string>();
  const cellSize = 0.9 * minWidthOrHeight / (n - 1 || 1);
  const cx = screenWidth / 2;
  const cy = screenHeight / 2;
  const jitterScale = minWidthOrHeight / 2000;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const rawX = c * cellSize + (Math.random() - 0.5) * 50 * jitterScale;
      const rawY = r * cellSize + (Math.random() - 0.5) * 50 * jitterScale;
      const dx = rawX - cx;
      const dy = rawY - cy;
      nodes.push({ id: r * n + c, x: cx + dx, y: cy + dy });
    }
  }

  let groundId = n * n;
  const groundMargin = 150;
  const getGroundPos = (r: number, c: number, w: number, h: number) => {
    const hRatio = c / (n - 1);
    const vRatio = r / (n - 1);
    let gx, gy;
    if (r === 0) { gy = -groundMargin; gx = (c === 0) ? -groundMargin : (c === n - 1) ? w + groundMargin : hRatio * w; }
    else if (r === n - 1) { gy = h + groundMargin; gx = (c === 0) ? -groundMargin : (c === n - 1) ? w + groundMargin : hRatio * w; }
    else if (c === 0) { gx = -groundMargin; gy = vRatio * h; }
    else { gx = w + groundMargin; gy = vRatio * h; }
    return { gx, gy };
  };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 || r === n - 1 || c === 0 || c === n - 1) {
        const { gx, gy } = getGroundPos(r, c, screenWidth, screenHeight);
        nodes.push({ id: groundId, x: gx, y: gy, fx: gx, fy: gy, isGround: true, gridR: r, gridC: c } as any);
        edges.push({ source: r * n + c, target: groundId });
        groundId++;
      }
    }
  }

  const addEdge = (u: number, v: number) => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (!edgeSet.has(key)) { edges.push({ source: u, target: v }); edgeSet.add(key); }
  };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const current = r * n + c;
      if (c < n - 1) addEdge(current, r * n + (c + 1));
      if (r < n - 1) addEdge(current, (r + 1) * n + c);
    }
  }

  const linkForce = forceLink<GraphNodeWithPosition, ExtendedEdge>(edges).id(d => d.id);
  const simulation = forceSimulation<GraphNodeWithPosition>(nodes);
  const manyBody = forceManyBody();
  const fX = forceX(cx).strength(0.1);
  const fY = forceY(cy).strength(0.1);

  simulation.force("link", linkForce).force("charge", manyBody).force("x", fX).force("y", fY);

  const applyForces = (coefficient: number, x: number, y: number) => {
    linkForce.distance(coefficient).strength(0.01);
    let manyBodyValue = - coefficient * 3.5
    if (coefficient < 100) {
      manyBodyValue = - coefficient * 2
    }
    manyBody.strength(manyBodyValue);
    fX.x(x);
    fY.y(y);

    return simulation;
  };

  applyForces(cellSize, cx, cy).stop();

  return {
    simulation,
    nodes,
    edges,
    onResize: (newMinDimension: number, newCx: number, newCy: number) => {
      const newW = width();
      const newH = height();
      const newCellSize = newMinDimension / (n - 1 || 1);

      nodes.forEach(node => {
        if ((node as any).isGround) {
          const { gx, gy } = getGroundPos((node as any).gridR, (node as any).gridC, newW, newH);
          node.fx = gx;
          node.fy = gy;
        }
      });

      applyForces(newCellSize, newCx, newCy);
      simulation.alpha(1).restart();
    }
  };
}
