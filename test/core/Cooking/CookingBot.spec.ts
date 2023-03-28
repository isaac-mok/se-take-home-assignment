import { expect } from 'chai'
import Sinon from 'sinon'
import SinonTest from 'sinon-test'
import CookingBot, { cookingTimeMs } from '../../../src/core/Cooking/CookingBot'
import { mockAcceptedOrder } from '../../../src/core/Order/MockOrder'
import { mockEventBus } from '../Event/MockEventBus'

const test = SinonTest(Sinon)

describe('CookingBot', function () {
  describe('cook', function () {
    it('dispatches event after cooking timeout finishes', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingBot = new CookingBot(mockEventBus({ dispatchEvent }))
      cookingBot.cook(mockAcceptedOrder())

      expect(dispatchEvent.callCount).to.equal(0)

      this.clock.tick(cookingTimeMs)

      expect(dispatchEvent.callCount).to.equal(1)
    }))
  })
  describe('isCooking', function () {
    it('is false before cooking', test(function (this: typeof Sinon) {
      const cookingBot = new CookingBot(mockEventBus())
      expect(cookingBot.isCooking()).to.equal(false)
    }))
    it('is true when cooking', test(function (this: typeof Sinon) {
      const cookingBot = new CookingBot(mockEventBus())
      cookingBot.cook(mockAcceptedOrder())

      expect(cookingBot.isCooking()).to.equal(true)
    }))
    it('is false after finished cooking', test(function (this: typeof Sinon) {
      const cookingBot = new CookingBot(mockEventBus())
      cookingBot.cook(mockAcceptedOrder())
      this.clock.tick(cookingTimeMs)

      expect(cookingBot.isCooking()).to.equal(false)
    }))
  })
  describe('stop', function () {
    it('does not dispatch event', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingBot = new CookingBot(mockEventBus({ dispatchEvent }))
      cookingBot.cook(mockAcceptedOrder())
      cookingBot.stop()
      this.clock.tick(cookingTimeMs + 1000)

      expect(dispatchEvent.callCount).to.equal(0)
    }))
  })
})
