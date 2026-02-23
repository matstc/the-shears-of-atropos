import kaplay, { GameObj } from "kaplay";
import { nodeFactory } from "./node";
import { edgeFactory } from "./edge";
import { graphFactory } from "./graph";
import { GraphEdge, GraphNode, Player1OrPlayer2, Scores } from "./types";
import { backgroundColor, PLAYER_COLORS } from "./styles";
import { createHud } from "./hud";

const k = kaplay({
  background: backgroundColor,
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

let currentPlayer:Player1OrPlayer2 = 1;
const scores:Scores = { 1: 0, 2: 0 };
const misere = true;
const hud = createHud(k)

const { simulation, nodes: simulationNodes, edges: simulationEdges } = graphFactory(12, 20)

const onRemoveNode = (sNode:GraphNode, node:GameObj) => {
  const idx = simulationNodes.indexOf(sNode);
  if (idx > -1) simulationNodes.splice(idx, 1);

  const objIdx = nodeInstances.indexOf(node);
  if (objIdx > -1) nodeInstances.splice(objIdx, 1);
}

const onRemoveEdge = (sEdge: GraphEdge, edge: GameObj) => {
  const idx = simulationEdges.indexOf(sEdge);
  if (idx > -1) simulationEdges.splice(idx, 1);
  const objIdx = edgeInstances.indexOf(edge);
  if (objIdx > -1) edgeInstances.splice(objIdx, 1);

  let nodesCaptured = 0;
  if (!edge.node1.exists()) nodesCaptured++;
  if (!edge.node2.exists()) nodesCaptured++;

  if (nodesCaptured > 0) {
    scores[currentPlayer] += nodesCaptured;
    shake(5);
  } else {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  hud.update(currentPlayer, scores);
  simulation.alpha(1).restart();
};

const nodeInstances = simulationNodes.map(n => nodeFactory({ x: n.x!, y: n.y! }, onRemoveNode.bind(null, n)));
const edgeInstances = simulationEdges.map(e => {
  const sIdx = (e.source as GraphNode).id;
  const tIdx = (e.target as GraphNode).id;
  return edgeFactory(nodeInstances[sIdx], nodeInstances[tIdx], onRemoveEdge.bind(null, e), () => PLAYER_COLORS[currentPlayer]);
});

function checkGameOver() {
  if (edgeInstances.length === 0) {
    let winner;
    if (misere) {
      winner = scores[1] < scores[2] ? "Player 1" : "Player 2";
      if (scores[1] === scores[2]) winner = "Draw";
    } else {
      winner = scores[1] > scores[2] ? "Player 1" : "Player 2";
    }

    add([
      text(`Game Over! ${winner} Wins!`, { size: 48 }),
      pos(width() / 2, height() / 2),
      anchor("center"),
      fixed(),
    ]);
  }
}

onUpdate(() => {
  if (simulation.alpha() < simulation.alphaMin()) return;

  simulation.tick();

  nodeInstances.forEach((obj, i) => {
    const simNode = simulationNodes[i];
    obj.pos.x = simNode.x!;
    obj.pos.y = simNode.y!;
  });

  edgeInstances.forEach((edgeObj) => {
    const n1 = edgeObj.node1;
    const n2 = edgeObj.node2;

    const dx = n2.pos.x - n1.pos.x;
    const dy = n2.pos.y - n1.pos.y;

    edgeObj.pos = vec2(n1.pos.x, n1.pos.y);
    edgeObj.angle = Math.atan2(dy, dx) * (180 / Math.PI);

    edgeObj.width = Math.sqrt(dx * dx + dy * dy);
  });

  checkGameOver()
});
