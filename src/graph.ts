import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceCollide,
  Simulation
} from "d3-force";
import { GraphNode, GraphEdge } from "./types.ts"

export function graphFactory(
  numNodes: number,
  numEdges: number,
  width: number = 1000,
  height: number = 1000
): {
  simulation: Simulation<GraphNode, undefined>;
  nodes: GraphNode[];
  edges: GraphEdge[];
} {

  const padding = 50;

  // 1. Initialize Nodes
  const nodes: GraphNode[] = Array.from({ length: numNodes }, (_, i) => ({ id: i }));

  // 2. Build Connectivity (Ring + Random Fill)
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  const addEdge = (u: number, v: number): boolean => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (!edgeSet.has(key) && u !== v) {
      edges.push({ source: u, target: v });
      edgeSet.add(key);
      return true;
    }
    return false;
  };

  // Ensure "At least 2 edges" per node via Ring
  for (let i = 0; i < numNodes; i++) {
    addEdge(i, (i + 1) % numNodes);
  }

  // Fill remaining edges
  while (edges.length < numEdges) {
    addEdge(Math.floor(Math.random() * numNodes), Math.floor(Math.random() * numNodes));
  }

  // 3. Physics Simulation
  const simulation = forceSimulation<GraphNode>(nodes)
    .force("link", forceLink<GraphNode, GraphEdge>(edges).id(d => d.id).distance(180))
    .force("charge", forceManyBody().strength(-2500)) // Heavy repulsion for space
    .force("x", forceX(width / 2).strength(0.1))
    .force("y", forceY(height / 2).strength(0.1))
    .force("collide", forceCollide().radius(60))
    .stop();

  // 4. Execute and Clamp
  for (let i = 0; i < 300; i++) {
    simulation.tick();

    // Clamp within canvas during simulation for better stability
    nodes.forEach(n => {
      n.x = Math.max(padding, Math.min(width - padding, n.x || 0));
      n.y = Math.max(padding, Math.min(height - padding, n.y || 0));
    });
  }

  return {
    simulation, nodes, edges
  }
}
