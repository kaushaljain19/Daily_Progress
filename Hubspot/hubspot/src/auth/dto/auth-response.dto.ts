export class AuthResponseDto {
  message: string;
  authenticated: boolean;
  tokens?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
