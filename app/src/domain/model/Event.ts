/**
 * Enum representing the supported event types in the system.
 */
export enum EventType {
  /**
   * Event for cryptocurrency updates in EUR currency.
   */
  CRYPTO_UPDATE_EUR = 'CRYPTO_UPDATE_EUR',

  /**
   * Event for cryptocurrency updates in USD currency.
   */
  CRYPTO_UPDATE_USD = 'CRYPTO_UPDATE_USD',

  /**
   * Event for user-specific notifications.
   */
  USER_NOTIFICATION = 'USER_NOTIFICATION'
}

/**
 * Interface representing an event in the system.
 *
 * Events are the primary data structure used for communication between components.
 */
export interface Event {
  /**
   * The type of event being dispatched.
   */
  eventType: EventType

  /**
   * The payload containing event-specific data.
   */
  payload: any
}
