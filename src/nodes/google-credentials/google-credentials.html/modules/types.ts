import { EditorNodeProperties } from 'node-red';

export interface GoogleCredentialsEditorNodeProperties
  extends EditorNodeProperties,
    GoogleCredentialsOptions {
  loginType: 'oauth';
  username?: string;
  credentials?: GoogleCredentialsOptions;
}

export interface GoogleCredentialsOptions {
  loginType: 'oauth';
  apiKey?: string;
  clientId?: string;
  scopes?: string;
  userId: string;
  accessToken?: string | null | undefined;
  refreshToken?: string;
  clientSecret?: string;
  redirectUri?: string;
}
