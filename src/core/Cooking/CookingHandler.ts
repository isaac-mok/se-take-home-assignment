import { EventBus } from "../Event/types"
import { AcceptedOrder } from "../Order/types"
import CookingBot from "./CookingBot"
import { BotAddedEventType } from "./Events/BotAddedEvent"
import { BotRemovedEventType } from "./Events/BotRemovedEvent"
import { CookingCompletedEventType } from "./Events/CookingCompletedEvent"

export class CookingHandler {
  protected cookingCount = 0
  public bots: CookingBot[] = []
  protected eventBus: EventBus

  constructor (eventBus: EventBus) {
    this.eventBus = eventBus

    this.eventBus.listenToEvent(CookingCompletedEventType, () => {
      this.cookingCount--
    })
  }

  public addBot () {
    const bot = new CookingBot(this.eventBus)
    this.bots.push(bot)
    this.eventBus.dispatchEvent(BotAddedEventType, { detail: null })
  }

  public removeBot () {
    const bot = this.bots.pop()
    if (bot !== undefined) {
      const isCooking = bot.stop() !== undefined

      if (isCooking) {
        this.cookingCount--
      }
      
      this.eventBus.dispatchEvent(BotRemovedEventType, { detail: { orderId: bot.order?.id }})
    }
  }

  public canCook () {
    return this.cookingCount < this.bots.length
  }

  public cook (order: AcceptedOrder) {
    for (let i = 0; i < this.bots.length; i++) {
      const bot = this.bots[i]
      if (!bot.isCooking()) {
        bot.cook(order)
        this.cookingCount++
        return
      }
    }
    
    // If no available bots, error
    throw new Error('No cooking bots available.')
  }
}
