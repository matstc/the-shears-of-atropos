import kaplay, { GameObj } from "kaplay";
import { nodeFactory } from "./node";
import { edgeFactory } from "./edge";
import { graphFactory } from "./graph";
import { GraphEdge, GraphNode } from "./types";

const k = kaplay({
  background: [222, 222, 222],
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

const { simulation, nodes: simulationNodes, edges: simulationEdges } = graphFactory(12, 20)

const onRemoveNode = (sNode:GraphNode, node:GameObj) => {
  const idx = simulationNodes.indexOf(sNode);
  if (idx > -1) simulationNodes.splice(idx, 1);

  const objIdx = nodeInstances.indexOf(node);
  if (objIdx > -1) nodeInstances.splice(objIdx, 1);
}

const onRemoveEdge = (sEdge:GraphEdge, edge:GameObj) => {
  const idx = simulationEdges.indexOf(sEdge);
  if (idx > -1) simulationEdges.splice(idx, 1);

  const objIdx = edgeInstances.indexOf(edge);
  if (objIdx > -1) edgeInstances.splice(objIdx, 1);

  simulation.alpha(1).restart();
}

const nodeInstances = simulationNodes.map(n => nodeFactory({ x: n.x!, y: n.y! }, onRemoveNode.bind(null, n)));
const edgeInstances = simulationEdges.map(e => {
  const sIdx = (e.source as GraphNode).id;
  const tIdx = (e.target as GraphNode).id;
  return edgeFactory(nodeInstances[sIdx], nodeInstances[tIdx], onRemoveEdge.bind(null, e));
});

onUpdate(() => {
  if (simulation.alpha() < simulation.alphaMin()) return;

  simulation.tick();

  // 2. Update Node positions
  nodeInstances.forEach((obj, i) => {
    const simNode = simulationNodes[i];
    obj.pos.x = simNode.x!;
    obj.pos.y = simNode.y!;
  });

  // 3. Update Edge positions, angles, and lengths
  edgeInstances.forEach((edgeObj) => {
    const n1 = edgeObj.node1;
    const n2 = edgeObj.node2;

    const dx = n2.pos.x - n1.pos.x;
    const dy = n2.pos.y - n1.pos.y;

    edgeObj.pos = vec2(n1.pos.x, n1.pos.y);
    edgeObj.angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Use .width to update the rect component's size
    edgeObj.width = Math.sqrt(dx * dx + dy * dy);
  });
});
