import { google } from 'googleapis';
import { NodeInitializer } from 'node-red';
import GoogleService from '../shared/GoogleService';
import NodeUtils from '../shared/NodeUtils';
import { GoogleCredentialsNode } from '../shared/types';
import { GoogleOperationNode, GoogleOperationNodeDef } from './modules/types';
import { GoogleOperationMessage } from './shared/types';

declare global {
  interface NodeMessageInFlow {
    api?: string;
  }
}

const nodeInit: NodeInitializer = (RED): void => {
  function GoogleOperationNodeConstructor(
    this: GoogleOperationNode,
    config: GoogleOperationNodeDef
  ): void {
    RED.nodes.createNode(this, config);
    var node = this;
    node.google = config.google as string;
    node.googleConfig = <GoogleCredentialsNode>RED.nodes.getNode(node.google);
    NodeUtils.clear(node);
    if (node.googleConfig) {
      node.on('input', (msg, _send, _done) => {
        NodeUtils.info(this, 'processing');
        let gService = new GoogleService(this.googleConfig, this, msg, config);
        gService.login(msg);
      });
    } else {
      let error = new Error('missing google configuration');
      node.error(error.message);
      NodeUtils.error(node, error.message);
    }
  }

  RED.nodes.registerType('google-operation', GoogleOperationNodeConstructor);
};

export = nodeInit;
