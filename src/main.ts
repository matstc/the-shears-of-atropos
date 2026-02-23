import kaplay from "kaplay";
import { nodeFactory } from "./node";
import { edgeFactory } from "./edge";

const k = kaplay({
  background: [222, 222, 222],
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

let winner = null
const world:any = {
  nodes: [],
  edges: []
}

const node1 = nodeFactory({ x: 60, y: 40 })
const node2 = nodeFactory({ x: 34, y: 120 })
const node3 = nodeFactory({ x: 134, y: 120 })
const node4 = nodeFactory({ x: 64, y: 220 })
const edge1 = edgeFactory(node1, node2)
const edge3 = edgeFactory(node2, node3)
const edge2 = edgeFactory(node3, node4)

world.nodes.push(node1)
world.nodes.push(node2)
world.nodes.push(node3)
world.nodes.push(node4)
world.edges.push(edge1)
world.edges.push(edge2)
world.edges.push(edge3)

const handleKeyDown = function () {

}

onUpdate(() => {
  if (!winner) {
    handleKeyDown()
  }
})
