import { EventBus } from "../../../src/core/Event/types";

export function mockEventBus (eventBus?: Partial<EventBus>) {
  return {
    dispatchEvent: () => {},
    listenToEvent: () => {},
    ...eventBus
  }
}
