import { EventHandler } from '../../domain/model/EventHandler'
import { Event, EventType } from '../../domain/model/Event'
import { EventOutputPort } from '../../domain/ports/EventOutputPort'
import { inject, injectable } from 'tsyringe'

@injectable()
export class UserNotificationHandler implements EventHandler {
  eventTypes: EventType[] = [EventType.USER_NOTIFICATION]

  constructor(@inject('EventOutputPort') private eventOutput: EventOutputPort) {}

  handle(event: Event): void {
    const { userId, cryptoId, alertPrice, currentPrice, alertType, message } = event.payload

    let notificationMessage: string

    if (message) {
      // Use the user's custom message if provided
      notificationMessage = message
    } else {
      // Craft a default message based on the alert type and data
      notificationMessage = `${cryptoId} price ${alertType === 'ABOVE' ? 'surpassed' : 'dropped below'} your target of $${alertPrice}. Current price is $${currentPrice}.`
    }

    // Send the notification to the specific user via the EventOutputPort
    this.eventOutput.sendToUser(userId, { message: notificationMessage })
  }
}
