/**
 * Port interface for external notification service communication.
 *
 * This port defines the contract for sending notifications to external services.
 */
export interface NotificationServicePort {
  /**
   * Sends a notification to the external notification service.
   *
   * @param currency - The currency type ('usd' or 'eur') for the notification
   * @param messageJson - The message data to send
   * @returns A promise that resolves when the notification is sent
   */
  sendNotification(currency: 'usd' | 'eur', messageJson: any): Promise<void>
}
