import { GoogleCredentialsNode } from 'src/nodes/shared/types';

export interface GoogleEventsOptions {
  calendarId: string;
  from?: string;
  to?: string;
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: string;
  google: GoogleCredentialsNode | string;
}
