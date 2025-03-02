import axios from 'axios'
import { injectable } from 'tsyringe'
import { NotificationServicePort } from '../../domain/ports/NotificationServicePort'

/**
 * HTTP implementation of the NotificationServicePort.
 *
 * This adapter handles communication with the external notification service via HTTP.
 */
@injectable()
export class NotificationAdapter implements NotificationServicePort {
  private readonly baseUrl: string

  /**
   * Constructs a new HttpNotificationAdapter.
   *
   * @param notificationServiceName - Environment variable for the notification service hostname
   * @param notificationServicePort - Environment variable for the notification service port
   */
  constructor() {
    // Get notification service configuration from environment
    const notificationServiceName = process.env.NOTIFICATION_SERVICE_NAME || 'notification'
    const notificationServicePort = process.env.NOTIFICATION_SERVICE_PORT || '3000'
    this.baseUrl = `http://${notificationServiceName}:${notificationServicePort}`
  }

  /**
   * Sends a notification to the external notification service via HTTP.
   *
   * @param currency - The currency type ('usd' or 'eur') for the notification
   * @param messageJson - The message data to send
   * @returns A promise that resolves when the notification is sent
   */
  async sendNotification(currency: 'usd' | 'eur', messageJson: any): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/data?currency=${currency}`, messageJson)
    } catch (error) {
      console.error('Error notifying notification service:', error)
    }
  }
}
