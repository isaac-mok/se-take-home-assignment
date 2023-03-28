export interface EventBus {
  dispatchEvent: (type: string, data: any) => unknown
  listenToEvent: (type: string, callback: (data: any) => any) => unknown
}
