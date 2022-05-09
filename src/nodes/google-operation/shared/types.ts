import { NodeMessageInFlow } from 'node-red';
import { GoogleCredentialsNode } from '../../shared/types';

export interface GoogleOperationOptions {
  api: string;
  version: string;
  method: string;
  path: string;
  payload?: unknown;
  google: GoogleCredentialsNode | string;
}

export interface GoogleOperationMessage
  extends NodeMessageInFlow,
    GoogleOperationOptions {
  api: string;
}
