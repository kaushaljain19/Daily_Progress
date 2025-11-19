export interface ApiError {
  requestUrl: string;
  resourceId: string;
  associationType: string;
  timestamp: string;
  response: {
    status?: number;
    statusText?: string;
    message: string;
  };
}
