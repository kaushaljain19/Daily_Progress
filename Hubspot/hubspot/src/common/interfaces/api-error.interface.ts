export interface ApiError {
  requestUrl: string;
  contactId: string;
  associationType: string;
  timestamp: string;
  response: {
    status?: number;
    statusText?: string;
    message: string;
  };
}
