import { injectable, inject } from 'tsyringe'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AuthServicePort } from '../../domain/ports/AuthServicePort'

/**
 * AuthServiceImpl provides an implementation of the AuthServicePort that validates
 * JSON Web Tokens (JWT) and extracts the associated user information.
 *
 * @remarks
 * This service uses a symmetric JWT key, injected via dependency injection, to
 * verify the authenticity of the token.
 */
@injectable()
export class AuthServiceImpl implements AuthServicePort {
  private jwtKey: string

  /**
   * Constructs a new AuthServiceImpl.
   *
   * @param jwtKey - The JWT symmetric key used for token verification.
   */
  constructor(@inject('JWT_SIMMETRIC_KEY') jwtKey: string) {
    this.jwtKey = jwtKey
  }

  /**
   * Validates the auth token by verifying the JWT signature and payload.
   *
   * **Route:** (Service Method)
   *
   * **Description:** Validates the provided JWT token. If the token is valid and includes a
   * userId in its payload, an object containing the userId is returned; otherwise, null is returned.
   *
   * **Remarks:**
   * - Returns null if token verification fails or if the token does not contain a userId.
   *
   * @param token - The JWT token to validate.
   * @returns A promise that resolves to an object containing `userId` if valid, or `null` otherwise.
   *
   * @example
   * const authService = new AuthServiceImpl('your-jwt-key')
   * const result = await authService.validateToken(token)
   */
  public async validateToken(token: string): Promise<{ userId: string } | null> {
    try {
      const decoded = jwt.verify(token, this.jwtKey) as JwtPayload

      if (decoded && decoded.userId) {
        return { userId: decoded.userId }
      }

      return null
    } catch (error) {
      console.error('JWT validation error:', error)
      return null
    }
  }
}
