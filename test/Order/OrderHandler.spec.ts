import { expect } from 'chai'
import Sinon from 'sinon'
import SinonTest from 'sinon-test'
import OrderHandler from '../../src/Order/OrderHandler'
import { OrderId } from '../../src/Order/types'
import { mockOrder } from './MockOrder'

const test = SinonTest(Sinon)

describe('OrderHandler', function () {
  describe('addOrder', function () {
    it('returns order ID', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      expect(orderHandler.addOrder(mockOrder())).to.be.a('number')
    }))
    it('adding VIP order first actually inserts', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      orderHandler.addOrder(mockOrder({ isVip: true }))

      expect(orderHandler.acceptedOrders.length).to.equal(1)
    }))
    it('adding order correctly grows acceptedOrders array', test(function (this: typeof Sinon) {
      const expectedOrder: boolean[] = [true, false, false]

      // First test length
      const orderHandler = new OrderHandler(() => {})
      expect(orderHandler.acceptedOrders.length).to.equal(0)

      orderHandler.addOrder(mockOrder({ isVip: false }))
      expect(orderHandler.acceptedOrders.length).to.equal(1)

      orderHandler.addOrder(mockOrder({ isVip: true }))
      expect(orderHandler.acceptedOrders.length).to.equal(2)

      // Test VIP is in front
      orderHandler.acceptedOrders.forEach((order, index) => {
        const expectedIsVip = expectedOrder[index]
        expect(order.isVip).to.equal(expectedIsVip)
      })
    }))
    it('added orders have correct VIP status', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      const vipStatuses: Record<OrderId, boolean> = {}

      vipStatuses[orderHandler.addOrder(mockOrder({ isVip: false }))] = false
      vipStatuses[orderHandler.addOrder(mockOrder({ isVip: true }))] = true

      orderHandler.acceptedOrders.forEach(order => {
        expect(order.isVip).to.equal(vipStatuses[order.id])
      })
    }))
    it('added orders have correct state', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      orderHandler.addOrder(mockOrder())

      expect(orderHandler.acceptedOrders[0].state).to.equal('PENDING')
    }))
    it('added orders have incrementing IDs', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      orderHandler.addOrder(mockOrder({ isVip: false }))
      orderHandler.addOrder(mockOrder({ isVip: true }))
      orderHandler.addOrder(mockOrder())
      
      orderHandler.acceptedOrders
        .sort((a, b) => a.id - b.id)
        .forEach((order, index) => {
          expect(order.id).to.equal(index + 1)
        })
    }))
    it('adding order dispatches event', test(function (this: typeof Sinon) {
      const dispatchEvent = this.spy()
      const orderHandler = new OrderHandler(dispatchEvent)

      orderHandler.addOrder(mockOrder({ isVip: false }))
      orderHandler.addOrder(mockOrder({ isVip: true }))
      expect(dispatchEvent.callCount).to.equal(2)
    }))
  })
  describe('processNextOrder', function () {
    it("changes first pending order's state to processing", test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      orderHandler.addOrder(mockOrder({ isVip: false }))
      orderHandler.addOrder(mockOrder({ isVip: true }))

      orderHandler.processNextOrder()
      expect(orderHandler.acceptedOrders[0].state).to.equal('PROCESSING')
      expect(orderHandler.acceptedOrders[1].state).to.equal('PENDING')

      orderHandler.processNextOrder()
      orderHandler.acceptedOrders.forEach(order => {
        expect(order.state).to.equal('PROCESSING')
      })
    }))
    it('returns correct orders', test(function (this: typeof Sinon) {
      const expectedOrders: [OrderId, boolean][] = []

      const orderHandler = new OrderHandler(() => {})
      expectedOrders[1] = [orderHandler.addOrder(mockOrder({ isVip: false })), false]
      expectedOrders[0] = [orderHandler.addOrder(mockOrder({ isVip: true })), true]

      expectedOrders.forEach(([id, isVip]) => {
        const nextOrder = orderHandler.processNextOrder()
        expect(nextOrder?.id).to.equal(id)
        expect(nextOrder?.isVip).to.equal(isVip)
      })
    }))
    it('returns undefined when there are no pending orders', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})

      expect(orderHandler.processNextOrder()).to.be.an('undefined')

      orderHandler.addOrder(mockOrder())
      orderHandler.processNextOrder()

      expect(orderHandler.processNextOrder()).to.be.an('undefined')
    }))
  })
  describe('cancelProcessingOrder', function () {
    it('cancels correct order', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      orderHandler.addOrder(mockOrder({ isVip: false }))
      orderHandler.addOrder(mockOrder())
      const orderIdToCancel = orderHandler.addOrder(mockOrder({ isVip: true }))
      orderHandler.addOrder(mockOrder())

      orderHandler.processNextOrder()
      orderHandler.processNextOrder()
      orderHandler.processNextOrder()
      orderHandler.processNextOrder()

      orderHandler.cancelProcessingOrder(orderIdToCancel)
      
      orderHandler.acceptedOrders.forEach(order => {
        const expectedState = order.id === orderIdToCancel ? 'PENDING' : 'PROCESSING'
        expect(order.state).to.equal(expectedState)
      })
    }))
    it('cannot cancel order that is not processing', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      const orderIdToCancel = orderHandler.addOrder(mockOrder({ isVip: true }))

      expect(function () { orderHandler.cancelProcessingOrder(orderIdToCancel) }).to.throw('Order not processing.')
    }))
  })
  describe('completeOrder', function () {
    it('correct order is removed from acceptedOrders array', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      orderHandler.addOrder(mockOrder({ isVip: false }))
      orderHandler.addOrder(mockOrder())
      const orderIdToComplete = orderHandler.addOrder(mockOrder({ isVip: true }))
      orderHandler.addOrder(mockOrder())

      orderHandler.completeOrder(orderIdToComplete)

      expect(orderHandler.acceptedOrders.length).to.equal(3)

      orderHandler.acceptedOrders.forEach(order => {
        expect(order.id).to.not.equal(orderIdToComplete)
      })
    }))
    it('correct order is moved to completedOrders array', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})

      expect(orderHandler.completedOrders.length).to.equal(0)

      orderHandler.addOrder(mockOrder())
      const secondOrderIdToComplete = orderHandler.addOrder(mockOrder({ isVip: false }))
      const firstOrderIdToComplete = orderHandler.addOrder(mockOrder({ isVip: true }))
      orderHandler.addOrder(mockOrder())

      orderHandler.completeOrder(firstOrderIdToComplete)
      expect(orderHandler.completedOrders.length).to.equal(1)

      orderHandler.completeOrder(secondOrderIdToComplete)
      expect(orderHandler.completedOrders.length).to.equal(2)
    }))
    it('cannot complete same order twice', test(function (this: typeof Sinon) {
      const orderHandler = new OrderHandler(() => {})
      const orderIdToComplete = orderHandler.addOrder(mockOrder())
      orderHandler.completeOrder(orderIdToComplete)

      expect(function () { orderHandler.completeOrder(orderIdToComplete) }).to.throw('Order not found.')
    }))
  })
})
