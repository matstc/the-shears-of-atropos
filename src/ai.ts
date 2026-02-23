import { GameObj } from "kaplay";

const preThinkDelay = 0.2;
const thinkDelay = 1;

const play = async function(edge:GameObj) {
  await wait(preThinkDelay);
  edge.activate()
  await wait(thinkDelay);
  edge.pluck()
}

export async function makeRandomMoveForCpu(edgeInstances: GameObj[], _isMisere: boolean) {
  if (edgeInstances.length === 0) return;

  const randomIndex = Math.floor(Math.random() * edgeInstances.length);
  const targetEdge = edgeInstances[randomIndex];

  play(targetEdge)
}
