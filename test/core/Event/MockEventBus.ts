import { type EventBus } from '../../../src/core/Event/types'

export function mockEventBus (eventBus?: Partial<EventBus>): EventBus {
  return {
    dispatchEvent: () => {},
    listenToEvent: () => {},
    ...eventBus
  }
}
