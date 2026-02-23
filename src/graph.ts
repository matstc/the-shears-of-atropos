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
  simulation: Simulation<GraphNodeWithPosition, undefined>;
  nodes: GraphNodeWithPosition[];
  edges: GraphEdge[];
} {
  const minNodes = 2;
  const minEdges = numNodes - 1; // Minimum for a connected spanning tree
  const maxEdges = (numNodes * (numNodes - 1)) / 2; // Maximum for a simple graph

  if (numNodes < minNodes) {
    throw new Error(`Graph must have at least ${minNodes} nodes.`);
  }
  if (numEdges < minEdges) {
    console.warn(`numEdges (${numEdges}) is too low for a connected graph. Adjusting to ${minEdges}.`);
    numEdges = minEdges;
  }
  if (numEdges > maxEdges) {
    console.warn(`numEdges (${numEdges}) exceeds max possible edges. Adjusting to ${maxEdges}.`);
    numEdges = maxEdges;
  }

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

  for (let i = 1; i < numNodes; i++) {
    const targetNode = Math.floor(Math.random() * i);
    addEdge(i, targetNode);
  }

  while (edges.length < numEdges) {
    addEdge(
      Math.floor(Math.random() * numNodes),
      Math.floor(Math.random() * numNodes)
    );
  }

  const simulation = forceSimulation<GraphNodeWithPosition>(nodes)
    .force("link", forceLink<GraphNodeWithPosition, GraphEdge>(edges).id((d) => d.id).distance(150))
    .force("charge", forceManyBody().strength(-2000))
    .force("x", forceX(width / 2).strength(0.05))
    .force("y", forceY(height / 2).strength(0.05))
    .force("collide", forceCollide().radius(40))
    .stop();

  for (let i = 0; i < 300; i++) {
    simulation.tick();
    nodes.forEach(n => {
      n.x = Math.max(padding, Math.min(width - padding, n.x || 0));
      n.y = Math.max(padding, Math.min(height - padding, n.y || 0));
    });
  }

  return { simulation, nodes, edges };
}
