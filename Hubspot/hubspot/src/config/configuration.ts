export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  hubspot: {
    clientId: process.env.HUBSPOT_CLIENT_ID || '',
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
    redirectUri: process.env.HUBSPOT_REDIRECT_URI || '',
    apiBaseUrl: process.env.HUBSPOT_API_BASE_URL || 'https://api.hubapi.com',
    authUrl:
      process.env.HUBSPOT_AUTH_URL || 'https://app.hubspot.com/oauth/authorize',
    tokenUrl:
      process.env.HUBSPOT_TOKEN_URL || 'https://api.hubapi.com/oauth/v1/token',
  },
});


 
