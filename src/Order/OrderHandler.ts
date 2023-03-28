import { DispatchEvent } from '../Event/types'
import AddedOrderEventType from './Events/AddedOrderEvent'
import { AcceptedOrder, Order, OrderId } from './types'

export default class OrderHandler {
  protected dispatchEvent: DispatchEvent
  protected id = 0
  public acceptedOrders: AcceptedOrder[] = []
  public completedOrders: AcceptedOrder[] = []

  constructor (dispatchEvent: DispatchEvent) {
    this.dispatchEvent = dispatchEvent
  }

  public addOrder (order: Order): OrderId {
    const acceptedOrder: AcceptedOrder = {
      ...order,
      id: ++this.id,
      state: 'PENDING'
    }

    if (! order.isVip) {
      this.acceptedOrders.push(acceptedOrder)
    } else {
      let shouldPush = true
      for (let i = 0; i < this.acceptedOrders.length; i++) {
        if (this.acceptedOrders[i].state === 'PENDING' && !this.acceptedOrders[i].isVip) {
          this.acceptedOrders.splice(i, 0, acceptedOrder)
          shouldPush = false
          break
        }
      }
      if (shouldPush) this.acceptedOrders.push(acceptedOrder)
    }

    this.dispatchEvent(AddedOrderEventType, { details: null })

    return acceptedOrder.id
  }

  public processNextOrder (): AcceptedOrder | undefined {
    for (let i = 0; i < this.acceptedOrders.length; i++) {
      if (this.acceptedOrders[i].state === 'PENDING') {
        this.acceptedOrders[i].state = 'PROCESSING'
        return this.acceptedOrders[i]
      }
    }
  }

  public cancelProcessingOrder (orderId: OrderId): void {
    const orderIndex = this.getAcceptedOrderIndexById(orderId)

    if (this.acceptedOrders[orderIndex].state !== 'PROCESSING') throw new Error('Order not processing.')
    
    this.acceptedOrders[orderIndex].state = 'PENDING'
  }

  public completeOrder (orderId: OrderId): void {
    const orderIndex = this.getAcceptedOrderIndexById(orderId)
    const order: AcceptedOrder = {
      ...this.acceptedOrders.splice(orderIndex, 1)[0], // Get order and remove from array
      state: 'COMPLETE'
    }

    this.completedOrders.push(order)
  }

  protected getAcceptedOrderIndexById (orderId: OrderId): number {
    const index = this.acceptedOrders.findIndex(order => order.id === orderId)

    if (index === -1) throw new Error('Order not found.')

    return index
  }
}
