import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { tokenStorage } from './token.storage';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly authUrl: string;
  private readonly tokenUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('hubspot.clientId') || '';
    this.clientSecret = this.configService.get<string>('hubspot.clientSecret') || '';
    this.redirectUri = this.configService.get<string>('hubspot.redirectUri') || '';
    this.authUrl = this.configService.get<string>('hubspot.authUrl') || '';
    this.tokenUrl = this.configService.get<string>('hubspot.tokenUrl') || '';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      this.logger.error('OAuth credentials not configured properly in .env file');
      throw new Error('Missing OAuth configuration');
    }
  }

  
  getAuthorizationUrl(): string {
    const scopes = [
      'crm.objects.contacts.read',
      'crm.objects.companies.read',
      'crm.objects.deals.read',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes,
    });

    const url = `${this.authUrl}?${params.toString()}`;
    this.logger.log('Generated authorization URL');
    return url;
  }

  
  async exchangeCodeForTokens(code: string): Promise<any> {
    try {
      this.logger.log('Exchanging authorization code for tokens');

      const response = await firstValueFrom(
        this.httpService.post(
          this.tokenUrl,
          new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            code: code,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const { access_token, refresh_token, expires_in, token_type } = response.data;
      
      // Store tokens in memory
      tokenStorage.setTokens(access_token, refresh_token, expires_in);
      
      this.logger.log('Successfully exchanged code for tokens');
      
      return {
        access_token,
        refresh_token,
        expires_in,
        token_type,
      };
    } catch (error: any) {
      this.logger.error('Failed to exchange code for tokens', error.stack);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error_description || 
                          'Failed to exchange authorization code';
      
      throw new HttpException(errorMessage, error.response?.status || HttpStatus.BAD_REQUEST);
    }
  }

  
  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new HttpException(
          'No refresh token available. Please authenticate first.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.log('Refreshing access token');

      const response = await firstValueFrom(
        this.httpService.post(
          this.tokenUrl,
          new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: refreshToken,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const { access_token, refresh_token: newRefreshToken, expires_in, token_type } = response.data;
      
      // Update stored tokens
      tokenStorage.setTokens(access_token, newRefreshToken, expires_in);
      
      this.logger.log('Successfully refreshed access token');
      
      return access_token;
    } catch (error: any) {
      this.logger.error('Failed to refresh access token', error.stack);
      
      // Clear invalid tokens
      tokenStorage.clear();
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error_description || 
                          'Failed to refresh access token';
      
      throw new HttpException(
        `Token refresh failed: ${errorMessage}. Please re-authenticate.`,
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  
  async getValidAccessToken(): Promise<string> {
    let accessToken = tokenStorage.getAccessToken();

    
    if (!accessToken) {
      this.logger.log('Access token expired, refreshing...');
      accessToken = await this.refreshAccessToken();
    }

    if (!accessToken) {
      throw new HttpException(
        'No valid access token. Please authenticate at /auth/login first.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return accessToken;
  }

  
  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  }

 
  logout(): void {
    tokenStorage.clear();
    this.logger.log('User logged out, tokens cleared');
  }
}
