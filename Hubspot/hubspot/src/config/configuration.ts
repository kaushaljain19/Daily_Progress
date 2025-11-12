export default () => ({
  hubspot: {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
    apiBaseUrl: process.env.HUBSPOT_API_BASE_URL || 'https://api.hubapi.com',
  },
  port: parseInt(process.env.PORT || '3000', 10),
});
