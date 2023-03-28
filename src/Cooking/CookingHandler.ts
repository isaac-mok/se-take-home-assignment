import { DispatchEvent } from "../Event/types"
import { AcceptedOrder } from "../Order/types"
import CookingBot from "./CookingBot"

export class CookingHandler {
  protected cookingCount = 0
  protected bots: CookingBot[] = []
  protected dispatchEvent: DispatchEvent

  constructor (dispatchEvent: DispatchEvent) {
    this.dispatchEvent = dispatchEvent
  }

  public addBot () {
    const bot = new CookingBot(this.dispatchEvent)
    this.bots.push(bot)
  }

  public removeBot () {
    const bot = this.bots.pop()
    if (bot !== undefined) {
      const isCooking = bot.stop() !== undefined

      if (isCooking) {
        this.cookingCount--
      }
    }
  }

  public cook (order: AcceptedOrder) {
    for (let i = 0; i < this.bots.length; i++) {
      const bot = this.bots[i]
      if (!bot.isCooking()) {
        bot.cook(order)
      }
    }
    
    // If no available bots, error
    throw new Error('No cooking bots available.')
  }
}
