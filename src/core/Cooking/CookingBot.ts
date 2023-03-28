import { EventBus } from "../Event/types"
import { AcceptedOrder } from "../Order/types"
import { CookingCompletedEventArgs, CookingCompletedEventType } from "./Events/CookingCompletedEvent"

export const cookingTimeMs = 10000

export default class CookingBot {
  protected eventBus: EventBus
  public order?: AcceptedOrder
  protected timeoutId: number | NodeJS.Timeout | undefined

  constructor (eventBus: EventBus) {
    this.eventBus = eventBus
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
    const orderId = this.order?.id
    this.order = undefined
    this.eventBus.dispatchEvent(CookingCompletedEventType, { detail: { orderId } as CookingCompletedEventArgs })
  }
}
