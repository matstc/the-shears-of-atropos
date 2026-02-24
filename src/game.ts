import { GameObj, KAPLAYCtx } from "kaplay";
import { makeRandomMoveForCpu } from "./ai";
import { edgeFactory } from "./edge";
import { dotsAndBoxesFactory } from "./graph";
import { createHud } from "./hud";
import { nodeFactory } from "./node";
import { addBackground, playerColors } from "./styles";
import { ExtendedEdge, GraphNode, Player1OrPlayer2, Scores } from "./types";

export const createNewGame = function(k: KAPLAYCtx<any, never>, boardDimension:number, misere:boolean, vsCpu:boolean) {
  addBackground(k)
  let currentPlayer:Player1OrPlayer2 = 1;
  const scores:Scores = { 1: 0, 2: 0 };
  const hud = createHud(k, misere)
  const minScreenDimension = Math.min(width(), height())
  const xOffset = (width() - minScreenDimension) / 2;
  const nodeRadius = Math.floor(minScreenDimension / boardDimension / (55 / boardDimension))
  const { simulation, nodes: simulationNodes, edges: simulationEdges } = dotsAndBoxesFactory(boardDimension, minScreenDimension, minScreenDimension)

  const onRemoveNode = (sNode:GraphNode, node:GameObj) => {
    const idx = simulationNodes.indexOf(sNode);
    if (idx > -1) simulationNodes.splice(idx, 1);

    const objIdx = nodeInstances.indexOf(node);
    if (objIdx > -1) nodeInstances.splice(objIdx, 1);
  }

  const onRemoveEdge = (sEdge: ExtendedEdge, edge: GameObj) => {
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

    if (vsCpu && currentPlayer === 2) {
      makeRandomMoveForCpu(edgeInstances, misere);
    }
  };

  const nodeInstances = simulationNodes.map(n => nodeFactory({ x: n.x! + xOffset, y: n.y!, nodeRadius, boardDimension, onRemove: onRemoveNode.bind(null, n) }));
  const edgeInstances = simulationEdges.map(e => {
    const sIdx = (e.source as GraphNode).id;
    const tIdx = (e.target as GraphNode).id;
    return edgeFactory(nodeInstances[sIdx], nodeInstances[tIdx], nodeRadius, onRemoveEdge.bind(null, e), () => playerColors[currentPlayer]);
  });

  function checkGameOver() {
    if (edgeInstances.length === 0) {
      let winner:Player1OrPlayer2|null;
      if (misere) {
        winner = scores[1] < scores[2] ? 1 : 2;
        if (scores[1] === scores[2]) winner = null;
      } else {
        winner = scores[1] > scores[2] ? 1 : 2;
      }

      hud.showGameOver(winner)
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
      const diff = n2.pos.sub(n1.pos);
      const dist = diff.len();
      const dir = diff.unit();
      edgeObj.pos = n1.pos.add(dir.scale(nodeRadius));
      edgeObj.angle = dir.angle();
      edgeObj.width = dist - 2 * nodeRadius;
    });
  }

  return {
    onUpdate: () => {
      const edges = get("edge").filter(e => e.hovering);
      const nodes = get("node").filter(e => e.hovering);

      if (!vsCpu || currentPlayer == 1) {
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
    }
  }
}
