import { Node, NodeDef } from 'node-red';
import { GoogleCredentialsNode } from 'src/nodes/shared/types';
import { GoogleOperationOptions } from '../shared/types';

export interface GoogleOperationNodeDef
  extends NodeDef,
    GoogleOperationOptions {
  payload?: any;
}

export interface GoogleOperationNode extends Node {
  google: string;
  googleConfig: GoogleCredentialsNode;
  sendMsg: (err: any, result: object | null) => void;
}
