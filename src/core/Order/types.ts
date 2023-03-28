export interface Order {
  isVip: boolean
}

export interface AcceptedOrder extends Order {
  id: OrderId
  state: OrderState
}

export type OrderId = number

type OrderState = 'PENDING' | 'PROCESSING' | 'COMPLETE'
