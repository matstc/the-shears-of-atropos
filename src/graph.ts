import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  Simulation
} from "d3-force";
import { ExtendedEdge, GraphNodeWithPosition } from "./types.ts"

export function createGraph(
  n: number,
  minWidthOrHeight: number,
  screenWidth: number,
  screenHeight: number
): {
  simulation: Simulation<GraphNodeWithPosition, undefined>;
  nodes: GraphNodeWithPosition[];
  edges: ExtendedEdge[];
} {
  const nodes: GraphNodeWithPosition[] = [];
  const edges: ExtendedEdge[] = [];
  const edgeSet = new Set<string>();

  const cellSize = minWidthOrHeight / (n - 1 || 1);
  const cx = screenWidth / 2;
  const cy = screenHeight / 2;

  const maxRotation = 15 * (Math.PI / 180);
  const angle = (Math.random() - 0.5) * 2 * maxRotation;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const rawX = c * cellSize + (Math.random() - 0.5) * 50;
      const rawY = r * cellSize + (Math.random() - 0.5) * 50;

      const dx = rawX - cx;
      const dy = rawY - cy;

      nodes.push({
        id: r * n + c,
        x: cx + (dx * cos - dy * sin),
        y: cy + (dx * sin + dy * cos)
      });
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

  const simulation = forceSimulation<GraphNodeWithPosition>(nodes)
    .force("link", forceLink<GraphNodeWithPosition, ExtendedEdge>(edges)
      .id(d => d.id)
      .distance(cellSize * 0.65)
      .strength(0.8)
    )
    .force("charge", forceManyBody().strength(-cellSize))
    .force("center", forceCenter(cx, cy))
    .stop();

  return { simulation, nodes, edges };
}
