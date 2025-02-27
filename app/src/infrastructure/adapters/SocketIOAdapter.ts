import { Server as NodeHttpServer } from 'http'
import { Socket, Server as SocketIOServer } from 'socket.io'
import { inject, injectable } from 'tsyringe'
import { EventOutputPort } from '../../domain/ports/EventOutputPort'
import { AuthServicePort, AuthenticatedSocket } from '../../domain/ports/AuthServicePort'
import * as cookie from 'cookie'
/**
 * Adapter class for real-time WebSocket communication via Socket.IO.
 *
 * This class implements the EventOutputPort interface and manages two separate Socket.IO servers:
 * a public one for unauthenticated broadcasts and an authenticated one for user-specific messages.
 * It handles JWT authentication, maintains user-socket mappings, and provides methods for
 * broadcasting events to clients.
 */
@injectable()
export class SocketIOAdapter implements EventOutputPort {
  private io!: SocketIOServer
  private authIo!: SocketIOServer
  private isInitialized = false
  private userSocketMap: Record<string, Socket> = {}
  /**
   * Constructs a new SocketIOAdapter.
   *
   * @param httpServer - The HTTP server instance to attach Socket.IO servers to.
   * @param authService - Service for validating authentication tokens.
   */
  constructor(
    @inject('HttpServer') private httpServer: NodeHttpServer,
    @inject('AuthServicePort') private authService: AuthServicePort
  ) {
    this.initialize()
  }
  /**
   * Initializes the Socket.IO servers and sets up connection handlers.
   *
   * Creates two Socket.IO servers:
   *
   * - **Public server at '/updates' path**
   *   Allows unauthenticated connections and handles public broadcasts.
   *
   * - **Authenticated server at '/user-updates' path**
   *   Requires valid JWT authentication via cookies and maintains user-socket mappings.
   *   *Uses middleware to validate authentication tokens.*
   *
   * @returns {void}
   */
  public initialize(): void {
    if (!this.isInitialized) {
      // Public socket (no auth)
      this.io = new SocketIOServer(this.httpServer, {
        path: '/updates',
        cors: { origin: '*', methods: ['GET', 'POST'] }
      })

      this.io.on('connection', socket => {
        console.log('Client connected (public socket) -', socket.id)
        socket.on('disconnect', () => {
          console.log('Client disconnected (public socket) -', socket.id)
        })
      })

      // Authenticated socket
      this.authIo = new SocketIOServer(this.httpServer, {
        path: '/user-updates',
        cors: {
          origin: 'http://frontend:80',
          methods: ['GET', 'POST'],
          credentials: true
        }
      })

      // Use AuthService for token validation
      this.authIo.use(async (socket, next) => {
        try {
          const cookieHeader = socket.handshake.headers.cookie
          if (!cookieHeader) {
            return next(new Error('No cookies provided'))
          }
          // Parse the cookie header. For example, if the cookie is set like: authToken=...;
          const cookies = cookie.parse(cookieHeader)
          const authToken = cookies['authToken']
          if (!authToken) {
            return next(new Error('No authToken provided in cookies'))
          }
          const validationResult = await this.authService.validateToken(authToken)
          if (validationResult) {
            ;(socket as AuthenticatedSocket).userId = validationResult.userId
            return next()
          } else {
            return next(new Error('Unauthorized'))
          }
        } catch (error) {
          console.error('Socket auth error:', error)
          return next(new Error('Unauthorized'))
        }
      })

      this.authIo.on('connection', socket => {
        const userId = (socket as AuthenticatedSocket).userId
        console.log(`Client connected (auth socket): userId=${userId}, socketId=${socket.id}`)

        // Store socket in map
        this.userSocketMap[userId] = socket
        socket.on('disconnect', () => {
          console.log(`Client disconnected (auth socket): userId=${userId}, socketId=${socket.id}`)
          // Clean up user socket reference if it hasn’t changed
          const mappedSocket = this.userSocketMap[userId]
          if (mappedSocket && mappedSocket.id === socket.id) {
            Reflect.deleteProperty(this.userSocketMap, userId)
          }
        })
      })

      this.isInitialized = true
    }
  }

  /**
   * Broadcasts a message to all clients on the EUR channel.
   *
   * **Event:** broadcastEUR
   *
   * **Description:** Sends cryptocurrency updates in EUR to all clients connected to the public socket.
   *
   * **Remarks:**
   * - Does not require authentication to receive these broadcasts.
   * - Uses the 'broadcastEUR' event name for all clients.
   *
   * @param messageJson - The message data to broadcast.
   * @returns {void}
   * @throws Error if the adapter is not initialized.
   */
  public broadcastEUR(messageJson: any): void {
    if (!this.isInitialized) {
      throw new Error('SocketIOAdapter not initialized')
    }
    this.io.emit('broadcastEUR', messageJson)
  }

  /**
   * Broadcasts a message to all clients on the USD channel.
   *
   * **Event:** broadcastUSD
   *
   * **Description:** Sends cryptocurrency updates in USD to all clients connected to the public socket.
   *
   * **Remarks:**
   * - Does not require authentication to receive these broadcasts.
   * - Uses the 'broadcastUSD' event name for all clients.
   *
   * @param messageJson - The message data to broadcast.
   * @returns {void}
   * @throws Error if the adapter is not initialized.
   */
  public broadcastUSD(messageJson: any): void {
    if (!this.isInitialized) {
      throw new Error('SocketIOAdapter not initialized')
    }
    this.io.emit('broadcastUSD', messageJson)
  }

  /**
   * Sends a message to a specific authenticated user.
   *
   * **Event:** user-specific-event
   *
   * **Description:** Delivers personalized notifications to a specific user by their userId.
   *
   * **Remarks:**
   * - Only sends if the user has an active authenticated socket connection.
   * - Uses the 'user-specific-event' event name for targeted messaging.
   * - If the user has no active socket connection, the message is silently ignored.
   *
   * @param userId - The ID of the user to send the message to.
   * @param messageJson - The message data to send.
   * @returns {void}
   * @throws Error if the adapter is not initialized.
   */
  public sendToUser(userId: string, messageJson: any): void {
    if (!this.isInitialized) {
      throw new Error('SocketIOAdapter not initialized')
    }
    const userSocket = this.userSocketMap[userId]
    if (userSocket) {
      userSocket.emit('user-specific-event', messageJson)
    }
  }
}
