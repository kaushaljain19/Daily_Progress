import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TokenStorageService } from './token.storage';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly authUrl: string;
  private readonly tokenUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenStorage: TokenStorageService,
  ) {
    this.clientId = this.configService.get<string>('hubspot.clientId') || '';
    this.clientSecret = this.configService.get<string>('hubspot.clientSecret') || '';
    this.redirectUri = this.configService.get<string>('hubspot.redirectUri') || '';
    this.authUrl = this.configService.get<string>('hubspot.authUrl') || '';
    this.tokenUrl = this.configService.get<string>('hubspot.tokenUrl') || '';

    if (!this.clientId || !this.clientSecret || !this.redirectUri|| !this.authUrl|| !this.tokenUrl) {
      throw new Error('OAuth credentials missing in .env file');
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    const scopes = 'crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read';
    
    const params = new URLSearchParams({
      client_id: this.clientId, 
      redirect_uri: this.redirectUri,
      scope: scopes,
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<any> {
    if (!code || code.trim() === '') {
      throw new HttpException('Authorization code required', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code: code.trim(),
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { access_token, refresh_token, expires_in } = response.data;
      
      this.tokenStorage.setTokens(access_token, refresh_token, expires_in);
      this.logger.log('Tokens stored successfully');

      return response.data;
    } catch (error: any) {
      this.logger.error('Token exchange failed', error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to exchange code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new HttpException(
        'No refresh token. Please login at /auth/login',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { access_token, refresh_token: new_refresh, expires_in } = response.data;
      
      this.tokenStorage.setTokens(access_token, new_refresh, expires_in);
      this.logger.log('Access token refreshed');

      return access_token;
    } catch (error: any) {
      this.logger.error('Token refresh failed', error.stack);
      this.tokenStorage.clear();
      
      throw new HttpException(
        'Token refresh failed. Please re-authenticate at /auth/login',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Get valid access token with auto-refresh
   */
  async getValidAccessToken(): Promise<string> {
    let token = this.tokenStorage.getAccessToken();

    // Auto-refresh if expired
    if (!token) {
      this.logger.log('Token expired, auto-refreshing...');
      token = await this.refreshAccessToken();
    }

    if (!token) {
      throw new HttpException(
        'Not authenticated. Please login at /auth/login',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  /**
   * Logout - clear tokens
   */
  logout(): void {
    this.tokenStorage.clear();
    this.logger.log('User logged out');
  }
}










