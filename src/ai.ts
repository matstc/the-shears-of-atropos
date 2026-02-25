import { GameObj } from "kaplay";

const preThinkDelay = 0.2;
const thinkDelay = 1;

const shuffleArray = function(array:any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

const play = async function(edge:GameObj) {
  await wait(preThinkDelay);
  edge.activate()
  await wait(thinkDelay);
  edge.pluck()
}

const isCapturable = (node:GameObj) => {
  return !node.isGround && node.edges.length === 1;
}

export async function makeRandomMoveForCpu(edgeInstances: GameObj[], _isMisere: boolean) {
  if (edgeInstances.length === 0) return;

  const randomIndex = Math.floor(Math.random() * edgeInstances.length);
  const targetEdge = edgeInstances[randomIndex];

  await play(targetEdge);
}

export async function makeAverageMoveForCpu(edgeInstances: GameObj[], isMisere:boolean) {
  if (edgeInstances.length === 0) return;

  const list = shuffleArray([...edgeInstances])

  for (const edge of list) {
    if (!isMisere && (isCapturable(edge.node1) || isCapturable(edge.node2))) {
      play(edge);
      return
    }

    if (isMisere && !isCapturable(edge.node1) && !isCapturable(edge.node2)) {
      play(edge);
      return
    }
  }

  // Have not found a good move
  play(list[0]);
}
