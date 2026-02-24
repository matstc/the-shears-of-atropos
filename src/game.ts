import { GameObj, KAPLAYCtx } from "kaplay";
import { makeRandomMoveForCpu } from "./ai";
import { edgeFactory } from "./edge";
import { createGraph } from "./graph";
import { createHud } from "./hud";
import { nodeFactory } from "./node";
import { addBackground, playerColors, playRandomSound } from "./styles";
import { ExtendedEdge, GraphNode, Player1OrPlayer2, Scores } from "./types";

export const createNewGame = async function(k: KAPLAYCtx<any, never>, boardDimension:number, misere:boolean, vsCpu:boolean) {
  addBackground(k)
  k.play("game-start", { volume: 0.5 })
  let isPaused = false;
  let destroyPauseMenu: (() => void) | null = null;
  let currentPlayer:Player1OrPlayer2 = 1;
  const scores:Scores = { 1: 0, 2: 0 };
  const hud = await createHud(k, misere, vsCpu)
  let minScreenDimension = Math.min(width(), height())
  let xOffset = (width() - minScreenDimension) / 2;
  const getNodeRadius = () => Math.max(Math.floor(Math.min(width(), height()) / boardDimension / (55 / boardDimension)), 10);
  let nodeRadius = getNodeRadius()
  const { simulation, nodes: simulationNodes, edges: simulationEdges, onResize: simulationOnResize } = createGraph(boardDimension, minScreenDimension, width(), height())
  let isGameOver = false;

  const togglePause = () => {
    if (isPaused) {
      isPaused = false;
      if (destroyPauseMenu) destroyPauseMenu();
      k.setCursor("default");
    } else {
      isPaused = true;
      destroyPauseMenu = hud.showPauseMenu(() => togglePause());
    }
  };

  k.onKeyPress("escape", togglePause);
  k.onKeyPress("p", togglePause);

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
  }

  const onRemoveEdge = (sEdge: ExtendedEdge, edge: GameObj) => {
    playRandomSound(k, "blade")

    const idx = simulationEdges.indexOf(sEdge);
    if (idx > -1) simulationEdges.splice(idx, 1);
    const objIdx = edgeInstances.indexOf(edge);
    if (objIdx > -1) edgeInstances.splice(objIdx, 1);

    let nodesCaptured = 0;
    if (edge.node1.isCaptured) nodesCaptured++;
    if (edge.node2.isCaptured) nodesCaptured++;

    if (nodesCaptured > 0) {
      playRandomSound(k, "capture", 0.1)
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

  const nodeInstances = simulationNodes.map(n => nodeFactory({ x: n.x!, y: n.y!, nodeRadius, boardDimension, onRemove: onRemoveNode.bind(null, n), getCurrentColor: () => playerColors[currentPlayer] }));
  const edgeInstances = simulationEdges.map(e => {
    const sIdx = (e.source as GraphNode).id;
    const tIdx = (e.target as GraphNode).id;
    return edgeFactory(nodeInstances[sIdx], nodeInstances[tIdx], nodeRadius, onRemoveEdge.bind(null, e), () => playerColors[currentPlayer]);
  });

  edgeInstances.map(edge => {
    edge.onClick(async () => {
      if (isPaused || isGameOver) return;
      if (vsCpu && currentPlayer === 2) return;

      if (isTouchscreen()) {
        edge.activate();
        await wait(0.3);
      }
      edge.pluck();
    });
  })

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
      k.play("game-over", { volume: 0.3 });
      await wait(1)
    }
  }

  const forwardSimulation = function(smoothness:number) {
    simulation.tick();
    const padding = 50;

    nodeInstances.forEach((obj, i) => {
      if (obj.isCaptured) return;

      const simNode = simulationNodes[i];

      const targetX = simNode.x || 0;
      const targetY = simNode.y || 0;

      obj.radius = nodeRadius;
      obj.pos.x = lerp(obj.pos.x, Math.max(padding, Math.min(width() - padding, targetX)), smoothness);
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
      const newWidth = dist - 2 * nodeRadius;
      edgeObj.width = newWidth;
      edgeObj.area.shape.width = newWidth;
    });
  }

  return {
    onResize: () => {
      hud.onResize()
      const newMin = Math.min(k.width(), k.height());
      xOffset = (k.width() - newMin) / 2;
      nodeRadius = getNodeRadius(); // will be used by forwardSimulation
      const cx = k.width() / 2;
      const cy = k.height() / 2;
      simulationOnResize(newMin, cx, cy);
    },
    onUpdate: () => {
      if (isPaused) return;
      if (isGameOver) return;

      if (simulation.alpha() >= simulation.alphaMin()) {
        forwardSimulation(0.05)
      }

      checkGameOver();
    }
  }
}
