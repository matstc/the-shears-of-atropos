import {
  SimulationNodeDatum,
  SimulationLinkDatum
} from "d3-force";

export interface GraphNode extends SimulationNodeDatum {
  id: number;
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  source: number | GraphNode;
  target: number | GraphNode;
}

export type Scores = Record<1 | 2, number>

export type Player1OrPlayer2 = 1|2

export type GraphNodeWithPosition = GraphNode & { x?: number, y?: number }

export interface ExtendedEdge {
  source: number;
  target: number;
}

export type CpuAlgorithm = "RND" | "AVG"
