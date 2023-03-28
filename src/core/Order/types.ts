export interface Order {
  isVip: boolean
  date: number
}

export interface AcceptedOrder extends Order {
  id: OrderId
}

export type OrderId = number
