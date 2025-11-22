import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /auth/login
   * Get OAuth authorization URL
   */
  @Get('login')
  login() {
    const url = this.authService.getAuthorizationUrl();
    
    return {
      message: 'Visit this URL to authenticate',
      authorizationUrl: url,
      instructions: [
        'Copy the URL above',
        'Open it in your browser',
        'Login and authorize',
        'You will be redirected to callback',
      ],
    };
  }

  /**
   * GET /auth/callback
   * OAuth callback endpoint
   */
  @Get('callback')
  @UsePipes(new SanitizePipe())
  async callback(@Query('code') code: string) {
    const tokens = await this.authService.exchangeCodeForTokens(code);

    return {
      message: 'Authentication successful!',
      authenticated: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      },
      nextSteps: [
        'Check status: GET /auth/status',
        'Get contacts: GET /contacts',
        'Get accounts: GET /accounts',
      ],
    };
  }

  /**
   * GET /auth/status
   * Check authentication status
   */
  @Get('status')
  getStatus() {
    const authenticated = this.authService.isAuthenticated();

    return {
      authenticated,
      message: authenticated
        ? 'You are authenticated'
        : 'Not authenticated. Visit /auth/login',
    };
  }

  /**
   * GET /auth/logout
   * Logout user
   */
  @Get('logout')
  logout() {
    this.authService.logout();

    return {
      message: 'Logged out successfully',
      authenticated: false,
    };
  }
}
