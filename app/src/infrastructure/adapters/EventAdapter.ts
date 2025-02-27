import { Router, Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import { EventInputPort } from '../../domain/ports/EventInputPort'
import { EventType } from '../../domain/model/Event'
import { Event } from '../../domain/model/Event'

/**
 * Adapter class for exposing event-related HTTP endpoints.
 *
 * This class integrates with the EventInputPort to handle incoming events
 * via HTTP requests, including user notifications and cryptocurrency market data updates.
 */
@injectable()
export class EventAdapter {
  private router: Router
  /**
   * Constructs a new EventAdapter.
   *
   * @param eventInput - Service for processing incoming events.
   */
  constructor(@inject('EventInputPort') private eventInput: EventInputPort) {
    this.router = Router()
  }
  /**
   * Initializes the route endpoints.
   *
   * Registers the following routes:
   *
   * - **POST /realtime/events/notifyUser**
   *   Creates and processes a user notification event.
   *   *Expects the request body to include a userId and may include cryptoId, alertPrice, currentPrice, alertType, and message.*
   *
   * - **POST /realtime/events/cryptomarketdata**
   *   Processes incoming cryptocurrency market data events.
   *   *Expects a complete event object in the request body.*
   *
   * - **GET /health**
   *   Provides a basic health status of the service.
   *
   * @returns {void}
   */
  public initialize(): void {
    this.router.post('/realtime/events/notifyUser', this.handleNotifyUser)
    this.router.post('/realtime/events/cryptomarketdata', this.handleEvent)
    this.router.get('/health', this.healthCheck)
  }

  /**
   * Handler for user notification events.
   *
   * **Route:** POST /realtime/events/notifyUser
   *
   * **Description:** Creates and processes a USER_NOTIFICATION event.
   *
   * **Remarks:**
   * - Requires `userId` in the request body.
   * - May include optional fields: `cryptoId`, `alertPrice`, `currentPrice`, `alertType`, and `message`.
   *
   * @param req - Express Request object containing notification data.
   * @param res - Express Response object for sending back the result.
   * @returns {Promise<void>} A promise that resolves after sending a response with the appropriate status code and message.
   */
  private handleNotifyUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, cryptoId, alertPrice, currentPrice, alertType, message } = req.body

      if (!userId) {
        res.status(400).json({ error: 'Bad Request: userId is required' })
        return
      }

      // Construct the event object
      const event: Event = {
        eventType: EventType.USER_NOTIFICATION,
        payload: { userId, cryptoId, alertPrice, currentPrice, alertType, message }
      }

      // Process the event through the input port
      await this.eventInput.processEvent(event)

      res.status(200).json({ status: 'Notification event processed' })
    } catch (error) {
      console.error('Error processing notifyUser event:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handler for generic event processing.
   *
   * **Route:** POST /realtime/events/cryptomarketdata
   *
   * **Description:** Processes cryptocurrency market data events.
   *
   * **Remarks:**
   * - Expects a complete event object in the request body with proper `eventType` and `payload`.
   * - Commonly used for CRYPTO_UPDATE_EUR and CRYPTO_UPDATE_USD events.
   *
   * @param req - Express Request object containing the complete event data.
   * @param res - Express Response object for sending back the result.
   * @returns {Promise<void>} A promise that resolves after sending a response with the appropriate status code and message.
   */
  private handleEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.eventInput.processEvent(req.body)
      res.status(200).json({ status: 'Event processed' })
    } catch (error) {
      console.error('Error processing event:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Health check handler.
   *
   * **Route:** GET /health
   *
   * **Description:** Provides a basic health status of the service.
   *
   * @param req - Express Request object.
   * @param res - Express Response object for sending back the health status.
   * @returns {void} Sends a JSON response indicating that the service is operational.
   */
  private healthCheck = (req: Request, res: Response): void => {
    res.status(200).json({
      status: 'healthy',
      service: 'event-service',
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Returns the Express router instance with all registered endpoints.
   *
   * @returns {Router} The configured Express router.
   */
  public getRouter(): Router {
    return this.router
  }
}
