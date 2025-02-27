import { Event } from '../model/Event'
import { EventHandler } from '../model/EventHandler'
import { EventType } from '../model/Event'

/**
 * Interface defining the core event dispatching functionality.
 *
 * This interface represents the component responsible for routing events to their
 * appropriate handlers based on event type.
 */
export interface EventDispatcher {
  /**
   * Dispatches an event to its registered handlers.
   *
   * @param event - The event to be dispatched
   */
  dispatch(event: Event): void
}

/**
 * Implementation of the EventDispatcher interface that routes events to the appropriate handlers.
 *
 * This class maintains a registry of handler instances mapped to the event types they can process.
 * When an event is dispatched, all registered handlers for its type are invoked.
 */
export class DomainEventDispatcher implements EventDispatcher {
  private handlers = new Map<EventType, EventHandler[]>()

  /**
   * Constructs a new DomainEventDispatcher.
   *
   * **Description:** Initializes the dispatcher with a collection of event handlers and
   * builds a mapping of event types to their corresponding handlers.
   *
   * @param handlers - Array of event handlers to register
   */
  constructor(handlers: EventHandler[]) {
    handlers.forEach(handler => {
      handler.eventTypes.forEach(eventType => {
        if (!this.handlers.has(eventType)) {
          this.handlers.set(eventType, [])
        }
        this.handlers.get(eventType)!.push(handler)
      })
    })
  }

  /**
   * Dispatches an event to all registered handlers for its event type.
   *
   * **Description:** Looks up handlers registered for the event's type and invokes
   * each handler's handle method with the event.
   *
   * **Remarks:**
   * - Executes all handlers for the given event type in registration order.
   * - Throws an error if no handlers are found for the event type.
   *
   * @param event - The event to be dispatched
   * @throws Error if no handlers are registered for the event type
   */
  dispatch(event: Event): void {
    const handlers = this.handlers.get(event.eventType)
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => handler.handle(event))
    } else {
      throw new Error(`No handler found for event type: ${event.eventType}`)
    }
  }
}
