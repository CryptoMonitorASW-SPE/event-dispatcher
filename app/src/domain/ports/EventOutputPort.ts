/**
 * Interface representing the output port for event dispatching.
 */
export interface EventOutputPort {
  /**
   * Sends a message to a specific user.
   *
   * @param userId - The ID of the user to send the message to.
   * @param arg1 - An object containing the message to be sent.
   * @returns An unknown value.
   */
  sendToUser(userId: any, arg1: { message: any }): unknown

  /**
   * Broadcasts a message to all users listening for EUR currency updates.
   *
   * @param messageJson - The message to be broadcasted in JSON format.
   */
  broadcastEUR(messageJson: any): void

  /**
   * Broadcasts a message to all users listening for USD currency updates.
   *
   * @param messageJson - The message to be broadcasted in JSON format.
   */
  broadcastUSD(messageJson: any): void
}
