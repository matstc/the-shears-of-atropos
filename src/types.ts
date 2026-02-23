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
