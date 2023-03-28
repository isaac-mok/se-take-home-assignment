import { type ReactElement, useCallback, useEffect, useState } from 'react'
import './App.css'
import { CookingHandler } from './core/Cooking/CookingHandler'
import OrderHandler from './core/Order/OrderHandler'
import { mockOrder } from './core/Order/MockOrder'
import { type AcceptedOrder } from './core/Order/types'
import type CookingBot from './core/Cooking/CookingBot'
import { OrderAddedEventType } from './core/Order/Events/OrderAddedEvent'
import { CookingCompletedEventType, type CookingCompletedEventArgs } from './core/Cooking/Events/CookingCompletedEvent'
import { BotAddedEventType } from './core/Cooking/Events/BotAddedEvent'
import { OrderCompletedEventType } from './core/Order/Events/OrderCompletedEvent'
import { type BotRemovedEventArgs, BotRemovedEventType } from './core/Cooking/Events/BotRemovedEvent'
import { ProcessingOrderCancelledEventType } from './core/Order/Events/ProcessingOrderCancelledEvent'

function App (): ReactElement {
  const [eventBus] = useState(new EventTarget())

  const listenToEvent = useCallback(function (type: string, callback: (e: Event) => void) {
    eventBus.addEventListener(type, (e: CustomEventInit) => {
      console.log(type)
      callback(e.detail)
    })
  }, [eventBus])

  const [orderHandler] = useState(new OrderHandler({ dispatchEvent, listenToEvent }))
  const [cookingHandler] = useState(new CookingHandler({ dispatchEvent, listenToEvent }))
  const [pendingOrders, setPendingOrders] = useState<AcceptedOrder[]>([])
  const [completedOrders, setCompletedOrders] = useState<AcceptedOrder[]>([])
  const [cookingBots, setCookingBots] = useState<CookingBot[]>([])

  const refreshPendingOrders = useCallback(function () {
    setPendingOrders([
      ...orderHandler.processingOrders,
      ...orderHandler.pendingOrders
    ])
  }, [setPendingOrders, orderHandler])

  const refreshCompletedOrders = useCallback(function () {
    setCompletedOrders([...orderHandler.completedOrders])
  }, [setCompletedOrders, orderHandler])

  const refreshCookingBots = useCallback(function () {
    setCookingBots([...cookingHandler.bots])
  }, [cookingHandler, setCookingBots])

  const tryCook = useCallback(function () {
    try {
      const orderId = orderHandler.getNextOrderId()
      if (orderId !== undefined && cookingHandler.canCook()) {
        cookingHandler.cook(orderHandler.processNextOrder() as AcceptedOrder)
      }
    } catch (e) {
      console.log(e)
    }
    refreshCookingBots()
  }, [orderHandler, cookingHandler, refreshCookingBots])

  useEffect(() => {
    listenToEvent(OrderAddedEventType, () => {
      refreshPendingOrders()
      tryCook()
    })
    listenToEvent(BotAddedEventType, () => {
      tryCook()
    })
    listenToEvent(CookingCompletedEventType, function (e: CustomEventInit<CookingCompletedEventArgs>) {
      const orderId = e.detail?.orderId
      if (orderId !== undefined) {
        orderHandler.completeOrder(orderId)
      }
      tryCook()
    })
    listenToEvent(OrderCompletedEventType, () => {
      refreshPendingOrders()
      refreshCompletedOrders()
    })
    listenToEvent(ProcessingOrderCancelledEventType, () => {
      refreshPendingOrders()
    })
    listenToEvent(BotRemovedEventType, function (e: CustomEventInit<BotRemovedEventArgs>) {
      const orderId = e.detail?.orderId
      if (orderId !== undefined) {
        orderHandler.cancelProcessingOrder(orderId)
      }
      refreshCookingBots()
    })
  }, [listenToEvent, refreshPendingOrders, cookingHandler, orderHandler, tryCook, refreshCompletedOrders, refreshCookingBots])

  function dispatchEvent (type: string, data: any): void {
    eventBus.dispatchEvent(new CustomEvent<any>(type, { detail: data }))
  }

  function addOrder (isVip: boolean): void {
    orderHandler.addOrder(mockOrder({ isVip }))
  }

  function addBot (): void {
    cookingHandler.addBot()
  }

  function removeBot (): void {
    cookingHandler.removeBot()
  }

  return (
    <div>
      <div>
        <button onClick={() => { addOrder(false) }}>New Normal Order</button>
        <button onClick={() => { addOrder(true) }}>New VIP Order</button>
        <button onClick={addBot}>+ Bot</button>
        <button onClick={removeBot}>- Bot</button>
      </div>
      <div>
        <h1>PENDING</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Is VIP?</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.isVip.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h1>COOKING</h1>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Order ID</th>
              <th>Is VIP?</th>
            </tr>
          </thead>
          <tbody>
            {cookingBots.map((bot, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{bot.order?.id}</td>
                <td>{bot.order?.isVip.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h1>COMPLETE</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Is VIP?</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.isVip.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
