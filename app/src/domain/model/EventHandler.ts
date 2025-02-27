import { Event, EventType } from './Event'

/**
 * Interface for event handler implementations.
 *
 * Event handlers process specific types of events and implement the business logic
 * for responding to those events.
 */
export interface EventHandler {
  /**
   * List of event types this handler can process.
   */
  eventTypes: EventType[]

  /**
   * Processes an event of the supported types.
   *
   * @param event - The event to be processed
   */
  handle(event: Event): void
}
