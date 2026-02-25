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
  const maxRotation = 15 * (Math.PI / 180);
  const angle = (Math.random() - 0.5) * 2 * maxRotation * jitterScale;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const rawX = c * cellSize + (Math.random() - 0.5) * 50 * jitterScale;
      const rawY = r * cellSize + (Math.random() - 0.5) * 50 * jitterScale;

      const dx = rawX - cx;
      const dy = rawY - cy;

      nodes.push({
        id: r * n + c,
        x: cx + (dx * cos - dy * sin),
        y: cy + (dx * sin + dy * cos)
      });
    }
  }

  let groundId = n * n;
  const groundMargin = 150;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 || r === n - 1 || c === 0 || c === n - 1) {
        let gx, gy;

        const hRatio = c / (n - 1);
        const vRatio = r / (n - 1);

        if (r === 0) { // Top Edge
          gy = -groundMargin;
          gx = (c === 0) ? -groundMargin : (c === n - 1) ? screenWidth + groundMargin : hRatio * screenWidth;
        } else if (r === n - 1) { // Bottom Edge
          gy = screenHeight + groundMargin;
          gx = (c === 0) ? -groundMargin : (c === n - 1) ? screenWidth + groundMargin : hRatio * screenWidth;
        } else if (c === 0) { // Left Edge
          gx = -groundMargin;
          gy = vRatio * screenHeight;
        } else { // Right Edge
          gx = screenWidth + groundMargin;
          gy = vRatio * screenHeight;
        }

        nodes.push({
          id: groundId,
          x: gx,
          y: gy,
          fx: gx,
          fy: gy,
          isGround: true
        });

        edges.push({ source: r * n + c, target: groundId });
        groundId++;
      }
    }
  }

  const addEdge = (u: number, v: number) => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (!edgeSet.has(key)) {
      edges.push({ source: u, target: v });
      edgeSet.add(key);
    }
  };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const current = r * n + c;
      if (c < n - 1) addEdge(current, r * n + (c + 1));
      if (r < n - 1) addEdge(current, (r + 1) * n + c);
    }
  }

  const simulation = forceSimulation<GraphNodeWithPosition>(nodes);

  const applyForces = function (coefficient:number, x:number, y:number) {
    const linkForce = forceLink<GraphNodeWithPosition, ExtendedEdge>(edges)
    .id(d => d.id)
    .distance(coefficient)
    .strength(d => {
      const isGroundEdge = (d.source as any).isGround || (d.target as any).isGround;
      return isGroundEdge ? 0.01 : 0.05;
    });

    const manyBody = forceManyBody().strength(-coefficient * 3.5);

    return simulation.force("link", linkForce)
    .force("charge", manyBody)
    .force("x", forceX(x).strength(0.12))
    .force("y", forceY(y).strength(0.12))
  }

  applyForces(cellSize, cx, cy).stop()

  return {
    simulation,
    nodes,
    edges,
    onResize: (newMinDimension: number, newCx: number, newCy: number) => {
      const newCellSize = newMinDimension / (n - 1 || 1);
      applyForces(newCellSize, newCx, newCy);
      simulation.alpha(0.3).restart();
    }
  };
}
