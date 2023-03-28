import { faker } from '@faker-js/faker'
import { AcceptedOrder, Order } from './types'

export function mockOrder (order?: Partial<Order>): Order {
  return {
    isVip: faker.datatype.boolean(),
    ...order
  }
}

export function mockAcceptedOrder (order?: Partial<AcceptedOrder>): AcceptedOrder {
  return {
    id: faker.datatype.number(),
    state: faker.helpers.arrayElement(['PENDING', 'PROCESSING', 'COMPLETE']),
    ...mockOrder(order)
  }
}
