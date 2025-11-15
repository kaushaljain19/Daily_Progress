import { TokenStorage } from './interfaces/tokens.interface';

/**
 * Simple in-memory token storage
 * Production mein database ya Redis use karo
 */
class TokenStorageService {
  private storage: TokenStorage = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.storage.accessToken = accessToken;
    this.storage.refreshToken = refreshToken;
    // Buffer of 5 minutes before actual expiry
    this.storage.expiresAt = Date.now() + (expiresIn - 300) * 1000;
  }

  getAccessToken(): string | null {
    if (this.isTokenExpired()) {
      return null;
    }
    return this.storage.accessToken;
  }

  getRefreshToken(): string | null {
    return this.storage.refreshToken;
  }

  isTokenExpired(): boolean {
    if (!this.storage.expiresAt) {
      return true;
    }
    return Date.now() >= this.storage.expiresAt;
  }

  isAuthenticated(): boolean {
    return this.storage.refreshToken !== null;
  }

  clear(): void {
    this.storage = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };
  }
}

export const tokenStorage = new TokenStorageService();
