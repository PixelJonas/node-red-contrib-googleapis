import { EditorNodeProperties } from "node-red";

export interface GoogleCredentialsOptions {
  loginType: 'oauth';
  username?: string;
  credentials?: any;
  apiKey?: string;
  clientId?: string;
  scopes?: string;
  userId: string;
  accessToken?: string | null | undefined;
  refreshToken?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface GoogleCredentialsEditorNodeProperties
  extends EditorNodeProperties,
    GoogleCredentialsOptions {}
