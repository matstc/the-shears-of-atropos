import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceCollide,
  Simulation
} from "d3-force";
import { GraphNode, GraphEdge, GraphNodeWithPosition } from "./types.ts"

export function graphFactory(
  numNodes: number,
  numEdges: number,
  width: number = 1000,
  height: number = 1000
): {
  simulation: Simulation<GraphNode, undefined>;
  nodes: GraphNodeWithPosition[];
  edges: GraphEdge[];
} {

  const padding = 50;
  const nodes: GraphNodeWithPosition[] = Array.from({ length: numNodes }, (_, i) => ({ id: i }));
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

  for (let i = 0; i < numNodes; i++) {
    addEdge(i, (i + 1) % numNodes);
  }

  while (edges.length < numEdges) {
    addEdge(Math.floor(Math.random() * numNodes), Math.floor(Math.random() * numNodes));
  }

  const simulation = forceSimulation<GraphNodeWithPosition>(nodes)
    .force("link", forceLink<GraphNodeWithPosition, GraphEdge>(edges).id((d:GraphNodeWithPosition) => d.id).distance(180))
    .force("charge", forceManyBody().strength(-2500)) // repulsion
    .force("x", forceX(width / 2).strength(0.1))
    .force("y", forceY(height / 2).strength(0.1))
    .force("collide", forceCollide().radius(60))
    .stop();

  for (let i = 0; i < 300; i++) {
    simulation.tick();

    nodes.forEach(n => {
      n.x = Math.max(padding, Math.min(width - padding, n.x || 0));
      n.y = Math.max(padding, Math.min(height - padding, n.y || 0));
    });
  }

  return {
    simulation, nodes, edges
  }
}
