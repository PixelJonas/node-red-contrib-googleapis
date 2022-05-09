import { google } from "googleapis";
import { Node, NodeMessageInFlow } from "node-red";
import {
  GoogleOperationMessage,
  GoogleOperationOptions,
} from "../google-operation/shared/types";
import NodeUtils from "./NodeUtils";
import { GoogleCredentialsNode } from "./types";

export default class GoogleService {
  googleCredentials: GoogleCredentialsNode;
  node: Node;
  msg: NodeMessageInFlow;
  config: GoogleOperationOptions;

  constructor(
    gCreds: GoogleCredentialsNode,
    node: Node,
    msg: NodeMessageInFlow,
    config: GoogleOperationOptions
  ) {
    this.googleCredentials = gCreds;
    this.node = node;
    this.msg = msg;
    this.config = config;
  }

  login(msg: NodeMessageInFlow): void {
    this.googleCredentials.login(msg, async (err: any, conn: any) => {
      const message = (msg as unknown) as GoogleOperationMessage;
      if (err) {
        console.log(err);
        return this.sendMsg(err, null);
      }

      const apiGoogle = message.api || this.config.api;
      const payload =
        message.payload || JSON.parse(`${this.config.payload}`) || "";
      const version = message.version || this.config.version;
      const method = message.method || this.config.method;
      const path = message.path || this.config.path;

      try {
        const request = payload;
        const api = (google as any)[apiGoogle]({
          version: version,
          auth: conn,
        });
        const result = await api[path][method](request);
        this.sendMsg(null, result);
      } catch (err) {
        this.sendMsg(err as Error, null);
      }
    });
  }

  sendMsg(err: Error | null, result: Record<string, unknown> | null): void {
    if (err) {
      this.node.error(err.message, this.msg);
      NodeUtils.error(this.node, err.message);
    } else {
      NodeUtils.clear(this.node);
    }
    this.msg.payload = result;
    return this.node.send(this.msg);
  }
}