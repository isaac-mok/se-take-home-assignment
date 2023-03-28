import { DispatchEvent } from "../Event/types"
import { AcceptedOrder } from "../Order/types"
import CookingCompletedEventType from "./Events/CookingCompletedEvent"

export const cookingTimeMs = 10000

export default class CookingBot {
  protected dispatchEvent: DispatchEvent
  protected order?: AcceptedOrder
  protected timeoutId: number | undefined

  constructor (dispatchEvent: DispatchEvent) {
    this.dispatchEvent = dispatchEvent
  }

  public isCooking (): boolean {
    return this.order !== undefined
  }

  public cook (order: AcceptedOrder) {
    this.order = order

    this.timeoutId = setTimeout(() => {
      this.complete()
    }, cookingTimeMs)
  }

  public stop () {
    clearTimeout(this.timeoutId)

    return this.order
  }

  protected complete () {
    this.dispatchEvent(CookingCompletedEventType, { details: { orderId: this.order?.id }})

    this.order = undefined
  }
}
