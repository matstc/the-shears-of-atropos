import kaplay, { GameObj } from "kaplay";
import { nodeFactory } from "./node";
import { edgeFactory } from "./edge";
import { dotsAndBoxesFactory } from "./graph";
import { GraphEdge, GraphNode, Player1OrPlayer2, Scores } from "./types";
import { backgroundColor, PLAYER_COLORS } from "./styles";
import { createHud } from "./hud";
import { makeRandomMoveForCpu } from "./ai";

const k = kaplay({
  background: backgroundColor,
  pixelDensity: window.devicePixelRatio
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

let currentPlayer:Player1OrPlayer2 = 1;
const scores:Scores = { 1: 0, 2: 0 };
const misere = false;
const vsCPU = true;
const hud = createHud(k, misere)
const boardDimension = 4
const minScreenDimension = Math.min(width(), height())
const xOffset = (width() - minScreenDimension) / 2;
const { simulation, nodes: simulationNodes, edges: simulationEdges } = dotsAndBoxesFactory(boardDimension, minScreenDimension, minScreenDimension)

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
  simulation.alpha(0.03).restart();

  if (vsCPU && currentPlayer === 2) {
    makeRandomMoveForCpu(edgeInstances, misere);
  }
};

const nodeInstances = simulationNodes.map(n => nodeFactory({ x: n.x! + xOffset, y: n.y!, boardDimension, screenDimension: minScreenDimension, onRemove: onRemoveNode.bind(null, n) }));
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
      text(`Game Over: ${winner} wins`, { size: 48 }),
      pos(width() / 2, height() / 2),
      anchor("center"),
      fixed(),
    ]);
  }
}

const forwardSimulation = function(smoothness:number) {
  simulation.tick();
  const padding = 50;
  const w = width();
  const h = height();

  nodeInstances.forEach((obj, i) => {
    const simNode = simulationNodes[i];

    const targetX = (simNode.x || 0) + xOffset;
    const targetY = simNode.y || 0;

    obj.pos.x = lerp(obj.pos.x, Math.max(padding + xOffset, Math.min(width() - padding, targetX)), smoothness);
    obj.pos.y = lerp(obj.pos.y, Math.max(padding, Math.min(height() - padding, targetY)), smoothness);
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
}

onUpdate(() => {
  const edges = get("edge").filter(e => e.hovering);
  const nodes = get("node").filter(e => e.hovering);

  if (!vsCPU || currentPlayer == 1) {
    if (nodes.length > 0) {
      get("edge").filter(e => e.active).map(e => e.deactivate())
      setCursor("default");
    } else if (edges.length > 0) {
      const first = edges[0]
      get("edge").filter(e => e !== first && e.active).map(e => e.deactivate())
      first.activate()
      setCursor("pointer");
    } else {
      get("edge").filter(e => e.active).map(e => e.deactivate())
      setCursor("default");
    }
  }

  if (simulation.alpha() >= simulation.alphaMin()) {
    forwardSimulation(0.05)
  }

  checkGameOver();
});
