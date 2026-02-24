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
  k.play("start-game", { volume: 1 })
  let currentPlayer:Player1OrPlayer2 = 1;
  const scores:Scores = { 1: 0, 2: 0 };
  const hud = createHud(k, misere)
  const minScreenDimension = Math.min(width(), height())
  const xOffset = (width() - minScreenDimension) / 2;
  const nodeRadius = Math.floor(minScreenDimension / boardDimension / (55 / boardDimension))
  const { simulation, nodes: simulationNodes, edges: simulationEdges } = dotsAndBoxesFactory(boardDimension, minScreenDimension, minScreenDimension)
  let isGameOver = false;

  const onRemoveNode = (sNode:GraphNode, node:GameObj) => {
    const idx = simulationNodes.indexOf(sNode);
    if (idx > -1) simulationNodes.splice(idx, 1);

    const objIdx = nodeInstances.indexOf(node);
    if (objIdx > -1) nodeInstances.splice(objIdx, 1);

    const targetX = currentPlayer === 1 ? 0 : k.width();
    const targetY = k.height();

    // Remove the "node" tag so it's no longer interactive during flight
    node.unuse("node");
    const duration = 1
    k.tween(
      node.pos,
      k.vec2(targetX, targetY),
      duration,
      (val) => node.pos = val,
      k.easings.easeInCubic
    ).onEnd(() => {
      node.destroy();
    });

    k.tween(1, 0.3, duration, (val) => node.opacity = val, k.easings.easeInQuart);
    k.tween(node.radius, node.radius * 1.5, duration, (val) => node.radius = val, k.easings.easeInQuart);
  }

  const onRemoveEdge = (sEdge: ExtendedEdge, edge: GameObj) => {
    k.play("select", { volume: 1 })

    const idx = simulationEdges.indexOf(sEdge);
    if (idx > -1) simulationEdges.splice(idx, 1);
    const objIdx = edgeInstances.indexOf(edge);
    if (objIdx > -1) edgeInstances.splice(objIdx, 1);

    let nodesCaptured = 0;
    if (edge.node1.isCaptured) nodesCaptured++;
    if (edge.node2.isCaptured) nodesCaptured++;

    if (nodesCaptured > 0) {
      scores[currentPlayer] += nodesCaptured;
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

  async function checkGameOver() {
    if (edgeInstances.length === 0) {
      isGameOver = true;

      let winner:Player1OrPlayer2|null;
      if (misere) {
        winner = scores[1] < scores[2] ? 1 : 2;
        if (scores[1] === scores[2]) winner = null;
      } else {
        winner = scores[1] > scores[2] ? 1 : 2;
      }

      hud.showGameOver(winner)
      await wait(1)
      k.play("game-over", { volume: 0.9 });
    }
  }

  const forwardSimulation = function(smoothness:number) {
    simulation.tick();
    const padding = 50;
    const w = width();
    const h = height();

    nodeInstances.forEach((obj, i) => {
      if (obj.isCaptured) return;

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
      if (isGameOver) return;

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
