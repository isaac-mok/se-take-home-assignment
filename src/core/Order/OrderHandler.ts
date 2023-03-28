import type { EventBus } from '../Event/types'
import { OrderAddedEventType } from './Events/OrderAddedEvent'
import { OrderCompletedEventType } from './Events/OrderCompletedEvent'
import { ProcessingOrderCancelledEventType } from './Events/ProcessingOrderCancelledEvent'
import type { AcceptedOrder, Order, OrderId } from './types'

export default class OrderHandler {
  protected eventBus: EventBus
  protected id = 0
  public pendingOrders: AcceptedOrder[] = []
  public processingOrders: AcceptedOrder[] = []
  public completedOrders: AcceptedOrder[] = []

  constructor (eventBus: EventBus) {
    this.eventBus = eventBus
  }

  public addOrder (order: Order): OrderId {
    const acceptedOrder: AcceptedOrder = {
      ...order,
      id: ++this.id
    }

    if (!order.isVip) {
      this.pendingOrders.push(acceptedOrder)
    } else {
      let shouldPush = true
      for (let i = 0; i < this.pendingOrders.length; i++) {
        if (!this.pendingOrders[i].isVip) {
          this.pendingOrders.splice(i, 0, acceptedOrder)
          shouldPush = false
          break
        }
      }
      if (shouldPush) this.pendingOrders.push(acceptedOrder)
    }

    this.eventBus.dispatchEvent(OrderAddedEventType, null)

    return acceptedOrder.id
  }

  public getNextOrderId (): OrderId | undefined {
    return this.pendingOrders.length > 0 ? this.pendingOrders[0].id : undefined
  }

  public processNextOrder (): AcceptedOrder | undefined {
    const nextOrderId = this.getNextOrderId()
    if (nextOrderId === undefined) return undefined

    const nextOrder = this.pendingOrders.splice(this.getPendingOrderIndexById(nextOrderId), 1)[0]
    this.processingOrders.push(nextOrder)
    return nextOrder
  }

  public cancelProcessingOrder (orderId: OrderId): void {
    const orderIndex = this.getProcessingOrderIndexById(orderId)

    this.insertPendingOrderByDate(this.processingOrders.splice(orderIndex, 1)[0])
  }

  public completeOrder (orderId: OrderId): void {
    const orderIndex = this.getProcessingOrderIndexById(orderId)
    const order: AcceptedOrder = this.processingOrders.splice(orderIndex, 1)[0] // Get order and remove from array

    this.completedOrders.push(order)
    this.eventBus.dispatchEvent(OrderCompletedEventType, null)
  }

  protected getPendingOrderIndexById (orderId: OrderId): number {
    const index = this.pendingOrders.findIndex(order => order.id === orderId)

    if (index === -1) throw new Error('Order not pending.')

    return index
  }

  protected getProcessingOrderIndexById (orderId: OrderId): number {
    const index = this.processingOrders.findIndex(order => order.id === orderId)

    if (index === -1) throw new Error('Order not processing.')

    return index
  }

  protected insertPendingOrderByDate (order: AcceptedOrder): void {
    let index
    for (index = 0; index < this.pendingOrders.length; index++) {
      if (order.isVip) {
        if (!this.pendingOrders[index].isVip || this.pendingOrders[index].date > order.date) { // If not VIP, then is definitely in front
          break
        }
      } else {
        if (!this.pendingOrders[index].isVip && this.pendingOrders[index].date > order.date) { // If is VIP, then definitely skip
          break
        }
      }
    }
    this.pendingOrders.splice(index, 0, order)
    this.eventBus.dispatchEvent(ProcessingOrderCancelledEventType, null)
  }
}
