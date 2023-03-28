import { expect } from 'chai'
import Sinon from 'sinon'
import SinonTest from 'sinon-test'
import CookingBot, { cookingTimeMs } from '../../src/Cooking/CookingBot'
import { mockAcceptedOrder } from '../Order/MockOrder'

const test = SinonTest(Sinon)

describe('CookingBot', function () {
  describe('cook', function () {
    it('event is dispatched after cooking timeout finishes', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingBot = new CookingBot(dispatchEvent)
      cookingBot.cook(mockAcceptedOrder())

      expect(dispatchEvent.callCount).to.equal(0)

      this.clock.tick(cookingTimeMs)

      expect(dispatchEvent.callCount).to.equal(1)
    }))
  })
  describe('isCooking', function () {
    it('false before cooking', test(function (this: typeof Sinon) {
      const cookingBot = new CookingBot(() => {})
      expect(cookingBot.isCooking()).to.equal(false)
    }))
    it('true when cooking', test(function (this: typeof Sinon) {
      const cookingBot = new CookingBot(() => {})
      cookingBot.cook(mockAcceptedOrder())

      expect(cookingBot.isCooking()).to.equal(true)
    }))
    it('false after finished cooking', test(function (this: typeof Sinon) {
      const cookingBot = new CookingBot(() => {})
      cookingBot.cook(mockAcceptedOrder())
      this.clock.tick(cookingTimeMs)

      expect(cookingBot.isCooking()).to.equal(false)
    }))
  })
  describe('stop', function () {
    it('if stopped, event is not dispatched after cooking timeout finishes', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingBot = new CookingBot(dispatchEvent)
      cookingBot.cook(mockAcceptedOrder())
      cookingBot.stop()
      this.clock.tick(cookingTimeMs + 1000)

      expect(dispatchEvent.callCount).to.equal(0)
    }))
  })
})
