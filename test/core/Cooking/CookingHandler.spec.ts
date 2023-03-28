import { expect } from 'chai'
import Sinon from 'sinon'
import SinonTest from 'sinon-test'
import CookingBot from '../../../src/core/Cooking/CookingBot'
import { CookingHandler } from '../../../src/core/Cooking/CookingHandler'
import { mockAcceptedOrder } from '../../../src/core/Order/MockOrder'
import { mockEventBus } from '../Event/MockEventBus'

const test = SinonTest(Sinon)

describe('CookingHandler', function () {
  describe('addBot', function () {
    it('appends a bot to the bots array', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())
      expect(cookingHandler.bots.length).to.equal(0)

      cookingHandler.addBot()
      expect(cookingHandler.bots.length).to.equal(1)

      cookingHandler.addBot()
      expect(cookingHandler.bots.length).to.equal(2)
    }))
    it('dispatches an event', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingHandler = new CookingHandler(mockEventBus({ dispatchEvent }))
      cookingHandler.addBot()

      expect(dispatchEvent.callCount).to.equal(1)
    }))
  })
  describe('removeBot', function () {
    it('removes a bot from the bots array', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())
      cookingHandler.addBot()
      cookingHandler.addBot()

      cookingHandler.removeBot()
      expect(cookingHandler.bots.length).to.equal(1)

      cookingHandler.removeBot()
      expect(cookingHandler.bots.length).to.equal(0)
    }))
    it('dispatches an event', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingHandler = new CookingHandler(mockEventBus({ dispatchEvent }))
      cookingHandler.addBot() // Dispatches 1 event
      expect(dispatchEvent.callCount).to.equal(1)

      cookingHandler.removeBot()
      expect(dispatchEvent.callCount).to.equal(2)
    }))
    it('does not dispatch an event if there are no bots', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const cookingHandler = new CookingHandler(mockEventBus({ dispatchEvent }))

      cookingHandler.removeBot()
      expect(dispatchEvent.callCount).to.equal(0)

      cookingHandler.addBot() // Dispatches 1 event
      expect(dispatchEvent.callCount).to.equal(1)

      cookingHandler.removeBot()
      expect(dispatchEvent.callCount).to.equal(2)

      cookingHandler.removeBot()
      expect(dispatchEvent.callCount).to.equal(2)
    }))
  })
  describe('cook', function () {
    it('runs the cook function on a bot', test(function (this: typeof Sinon) {
      const botCookFunction = this.spy(CookingBot.prototype, 'cook')
      const cookingHandler = new CookingHandler(mockEventBus())
      cookingHandler.addBot()
      cookingHandler.cook(mockAcceptedOrder())

      expect(botCookFunction.callCount).to.equal(1)
    }))
    it('throws an error when no bots have been added', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())
      expect(function () { cookingHandler.cook(mockAcceptedOrder()) }).to.throw('No cooking bots available.')
    }))
    it('throws an error when all bots are currently cooking', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())
      cookingHandler.addBot()
      cookingHandler.addBot()
      cookingHandler.cook(mockAcceptedOrder())
      cookingHandler.cook(mockAcceptedOrder())

      expect(function () { cookingHandler.cook(mockAcceptedOrder()) }).to.throw('No cooking bots available.')
    }))
  })
  describe('canCook', function () {
    it('returns false when not bots have been added', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())
      expect(cookingHandler.canCook()).to.equal(false)
    }))
    it('returns true when no bots are cooking', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())
      cookingHandler.addBot()
      expect(cookingHandler.canCook()).to.equal(true)
    }))
    it('returns false when all bots are currently cooking', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())

      cookingHandler.addBot()
      cookingHandler.cook(mockAcceptedOrder())
      expect(cookingHandler.canCook()).to.equal(false)

      cookingHandler.addBot()
      cookingHandler.cook(mockAcceptedOrder())
      expect(cookingHandler.canCook()).to.equal(false)
    }))
    it('returns true when at least 1 bot is not cooking', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())

      cookingHandler.addBot()
      expect(cookingHandler.canCook()).to.equal(true)

      cookingHandler.addBot()
      cookingHandler.cook(mockAcceptedOrder())
      expect(cookingHandler.canCook()).to.equal(true)
    }))
    it('returns false when all bots have been removed', test(function (this: typeof Sinon) {
      const cookingHandler = new CookingHandler(mockEventBus())

      cookingHandler.addBot()
      cookingHandler.addBot()
      cookingHandler.removeBot()
      cookingHandler.removeBot()

      expect(cookingHandler.canCook()).to.equal(false)
    }))
  })
})
