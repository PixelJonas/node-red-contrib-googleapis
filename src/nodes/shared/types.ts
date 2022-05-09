import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { Node, NodeDef } from 'node-red';
import { GoogleCredentialsOptions } from '../google-credentials/google-credentials.html/modules/types';

export interface GoogleCredentialsNodeDef
  extends NodeDef,
    GoogleCredentialsOptions {}

export interface GoogleCredentialsNode extends Node {
  credentials: GoogleCredentialsOptions;
  conn: OAuth2Client | GoogleAuth<JSONClient> | null;
  login: any;
}
