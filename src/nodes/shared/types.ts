import { GoogleAuth, OAuth2Client } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import {
  EditorWidgetTypedInputTypeDefinition,
  EditorWidgetTypedInputType,
  Node,
  NodeDef,
  EditorWidgetTypedInputOptions,
} from "node-red";
import { GoogleCredentialsOptions } from "../google-credentials/shared/types";

export interface GoogleCredentialsNodeDef
  extends NodeDef,
    GoogleCredentialsOptions {}

export interface GoogleCredentialsNode extends Node {
  credentials: GoogleCredentialsOptions;
  conn: OAuth2Client | GoogleAuth<JSONClient> | null;
  login: any;
}

export interface Input extends Omit<EditorWidgetTypedInputOptions, "types"> {
  id: string;
  types?: Array<
    EditorWidgetTypedInputType | EditorWidgetTypedInputTypeDefinition
  >;
}

export interface GoogleNode extends Node {
  google: string;
  googleConfig: GoogleCredentialsNode;
}

export interface GoogleCallback {
  (result: any): void;
}
