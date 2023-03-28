import { type EventBus } from '../Event/types'
import { type AcceptedOrder } from '../Order/types'
import { type CookingCompletedEventArgs, CookingCompletedEventType } from './Events/CookingCompletedEvent'

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

  public cook (order: AcceptedOrder): void {
    this.order = order

    this.timeoutId = setTimeout(() => {
      this.complete()
    }, cookingTimeMs)
  }

  public stop (): AcceptedOrder | undefined {
    clearTimeout(this.timeoutId)

    return this.order
  }

  protected complete (): void {
    const orderId = this.order?.id
    this.order = undefined
    if (orderId !== undefined) {
      const eventArgs: CookingCompletedEventArgs = { orderId }
      this.eventBus.dispatchEvent(CookingCompletedEventType, { detail: eventArgs })
    }
  }
}
