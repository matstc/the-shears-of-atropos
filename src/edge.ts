import { GameObj } from "kaplay"
import "kaplay/global"
import { edgeColor } from "./styles"

export const edgeFactory = (node1: GameObj, node2: GameObj, nodeRadius: number, onRemove: (edge: GameObj) => void, getCurrentColor: Function): GameObj => {
  const dx = node2.pos.x - node1.pos.x
  const dy = node2.pos.y - node1.pos.y
  const distance = Math.sqrt(dx * dx + dy * dy) - 2 * nodeRadius
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const animDuration = 0.2 // seconds

  const edge = add([
    rect(distance, 10),
    pos(node1.pos.x, node1.pos.y),
    rotate(angle),
    anchor("left"),
    area({ shape: new Rect(vec2(0, 0), distance, 30) }),
    color(Color.fromHex(edgeColor)),
    "edge",
    {
      node1,
      node2,
      currentTween: null,
      active: false,
      isDeleting: false,
      activate() {
        if (this.active) return;

        this.active = true
        const targetColor = Color.fromHex(getCurrentColor())

        if (this.currentTween) this.currentTween.cancel()

        this.currentTween = tween(
          this.color,
          targetColor,
          animDuration,
          (val) => this.color = val,
          easings.easeOutQuad
        )
      },
      deactivate() {
        if (!this.active) return;

        this.active = false
        if (this.currentTween) this.currentTween.cancel()

        this.currentTween = tween(
          this.color,
          Color.fromHex(edgeColor),
          animDuration,
          (val) => this.color = val,
          easings.easeOutQuad
        )
      },
      async pluck() {
        if (this.isDeleting) return;

        this.isDeleting = true;

        node1.removeEdge(this);
        node2.removeEdge(this);
        setCursor("default");
        onRemove(this);
        this.destroy();
      }
    },
  ])

  edge.onHover(async () => {
    edge.activate();
    if (isTouchscreen()) {
      await wait(0.3);
      edge.pluck()
    }
    setCursor("pointer");
  })
  edge.onHoverEnd(() => {
    if (isTouchscreen()) return

    edge.deactivate()
    setCursor("default");
  })

  node1.edges.push(edge)
  node2.edges.push(edge)

  return edge
}
