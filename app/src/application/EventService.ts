// EventService.ts
import { container } from 'tsyringe'
import { injectable, inject } from 'tsyringe'
import { EventInputPort } from '../domain/ports/EventInputPort'
import { DomainEventDispatcher, EventDispatcher } from '../domain/services/EventDispatcher'
import { Event, EventType } from '../domain/model/Event'
import { CryptoUpdateHandler } from './handlers/CryptoUpdateHandler'
import { EventHandler } from '../domain/model/EventHandler'
import { EventOutputPort } from '../domain/ports/EventOutputPort' // Ensure this import exists
import { UserNotificationHandler } from './handlers/UserNotificationHandler'

@injectable()
export class EventService implements EventInputPort {
  private eventDispatcher: EventDispatcher

  constructor(@inject('EventOutputPort') private eventOutputPort: EventOutputPort) {
    // Resolve all handlers through the container for proper dependency injection
    const cryptoUpdateHandler = container.resolve(CryptoUpdateHandler)
    const userNotificationHandler = container.resolve(UserNotificationHandler)
    // Initialize other handlers here
    const handlers: EventHandler[] = [cryptoUpdateHandler, userNotificationHandler] // Add the new handler to the list
    const eventDispatcher = new DomainEventDispatcher(handlers)
    container.registerInstance<DomainEventDispatcher>('EventDispatcher', eventDispatcher)
    this.eventDispatcher = eventDispatcher // Assigning to the class property
  }

  async processEvent(eventJson: Event): Promise<void> {
    if (!this.isValidEventData(eventJson)) {
      throw new Error('Invalid event data')
    }
    this.eventDispatcher.dispatch(eventJson)
  }

  private isValidEventData(eventJson: Event): boolean {
    const validTypes: EventType[] = Object.values(EventType)

    if (!eventJson) {
      console.error('Validation failed: eventJson is null or undefined')
      return false
    }

    if (!validTypes.includes(eventJson.eventType)) {
      console.error(`Validation failed: Invalid eventType '${eventJson.eventType}'`)
      return false
    }

    if (eventJson.payload.length === 0) {
      console.error('Validation failed: payload is empty')
      return false
    }

    return true
  }
}
