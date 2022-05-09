import { google } from 'googleapis';
import { NodeInitializer } from 'node-red';
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

        node.sendMsg = (err, result) => {
          if (err) {
            node.error(err.message, msg);
            NodeUtils.error(node, err.message);
          } else {
            NodeUtils.clear(node);
          }
          msg.payload = result;
          return node.send(msg);
        };

        node.googleConfig.login(msg, async (err: any, conn: any) => {
          let message = (msg as unknown) as GoogleOperationMessage;
          if (err) {
            console.log(err);
            return node.sendMsg(err, null);
          }

          let apiGoogle = message.api || config.api;
          let payload = message.payload || JSON.parse(config.payload) || '';
          let version = message.version || config.version;
          let method = message.method || config.method;
          let path = message.path || config.path;
          console.log('::::::::::');
          console.log(payload);
          console.log('::::::::::');

          try {
            let request = payload;
            const api = (google as any)[apiGoogle]({
              version: version,
              auth: conn,
            });
            const result = await api[path][method](request);
            node.sendMsg(null, result);
          } catch (err) {
            node.sendMsg(err, null);
          }
        });
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
