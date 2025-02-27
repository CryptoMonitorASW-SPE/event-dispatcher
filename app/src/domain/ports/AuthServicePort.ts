/**
 * Service interface for authentication-related operations.
 *
 * This port defines the contract for validating tokens.
 */
export interface AuthServicePort {
  /**
   * Validates the provided token.
   *
   * @param token - A JWT token to be validated.
   * @returns A promise that resolves to an object containing the userId if the token is valid, or null otherwise.
   */
  validateToken(token: string): Promise<{ userId: string } | null>
}

import { Socket } from 'socket.io'
/**
 * Extended Socket interface that includes authentication details.
 *
 * Adds a userId property for authenticated requests.
 */
export interface AuthenticatedSocket extends Socket {
  /**
   * The identifier of the authenticated user.
   */
  userId: string
}
