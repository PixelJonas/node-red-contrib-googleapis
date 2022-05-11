import { EditorNodeProperties } from "node-red";

export interface GoogleCredentialsOptions {
  loginType: string;
  username?: string;
  credentials?: any;
  clientId?: string;
  scopes?: string;
  accessToken?: string | null | undefined;
  refreshToken?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface GoogleCredentialsEditorNodeProperties
  extends EditorNodeProperties,
    GoogleCredentialsOptions {}
