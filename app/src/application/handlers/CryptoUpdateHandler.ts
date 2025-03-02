import { EventHandler } from '../../domain/model/EventHandler'
import { Event, EventType } from '../../domain/model/Event'
import { EventOutputPort } from '../../domain/ports/EventOutputPort'
import { NotificationServicePort } from '../../domain/ports/NotificationServicePort'
import { inject, injectable } from 'tsyringe'
import { createViewUpdateMessage, ViewUpdateMessage } from '../DTO/ViewUpdateMessage'
import {
  createNotificationUpdateMessage,
  NotificationUpdateMessage
} from '../DTO/NotificationUpdateMessage'

@injectable()
export class CryptoUpdateHandler implements EventHandler {
  eventTypes: EventType[] = [EventType.CRYPTO_UPDATE_EUR, EventType.CRYPTO_UPDATE_USD]

  eventOutbound = 'CRYPTO_UPDATE'

  constructor(
    @inject('EventOutputPort') private eventOutput: EventOutputPort,
    @inject('NotificationServicePort') private notificationService: NotificationServicePort
  ) {}

  handle(eventInbound: Event): void {
    const updateMessage: ViewUpdateMessage = createViewUpdateMessage(
      new Date().toISOString(),
      eventInbound.payload
    )

    const notificationUpdateMessage: NotificationUpdateMessage = createNotificationUpdateMessage(
      new Date().toISOString(),
      eventInbound
    )

    if (eventInbound.eventType === EventType.CRYPTO_UPDATE_EUR) {
      this.eventOutput.broadcastEUR(updateMessage)
      this.notificationService.sendNotification('eur', notificationUpdateMessage)
    } else if (eventInbound.eventType === EventType.CRYPTO_UPDATE_USD) {
      this.eventOutput.broadcastUSD(updateMessage)
      this.notificationService.sendNotification('usd', notificationUpdateMessage)
    }
  }
}
