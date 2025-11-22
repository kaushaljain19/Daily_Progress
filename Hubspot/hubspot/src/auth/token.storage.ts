import { Injectable } from '@nestjs/common';


@Injectable()
export class TokenStorageService {
  private accessToken: string = '';
  private refreshToken: string = '';
  private expiresAt: number = 0;

  /**
   * Store tokens with expiry time
   */
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    // 5-minute buffer before expiry
    this.expiresAt = Date.now() + (expiresIn - 300) * 1000;
  }

  /**
   * Get access token if not expired
   */
  getAccessToken(): string {
    if (this.isExpired()) return '';
    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string {
    return this.refreshToken;
  }

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) return true;
    return Date.now() >= this.expiresAt;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.refreshToken !== '';
  }

  /**
   * Clear all tokens
   */
  clear(): void {
    this.accessToken = '';
    this.refreshToken = '';
    this.expiresAt = 0;
  }
}
