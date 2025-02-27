/**
 * Interface representing an input port for processing events.
 */
export interface EventInputPort {
  /**
   * Processes an event given its JSON representation.
   *
   * @param eventJson - The JSON representation of the event to be processed.
   * @returns A promise that resolves when the event has been processed.
   */
  processEvent(eventJson: any): Promise<void>
}
