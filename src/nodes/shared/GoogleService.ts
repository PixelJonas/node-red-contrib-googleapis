import { google } from "googleapis";
import { Node, NodeMessageInFlow } from "node-red";
import {
  GoogleOperationMessage,
  GoogleOperationOptions,
} from "../google-operation/shared/types";
import NodeUtils from "./NodeUtils";
import { GoogleCallback, GoogleCredentialsNode } from "./types";

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

  get(callback?: GoogleCallback): void {
    this.googleCredentials.login(this.msg, async (err: any, conn: any) => {
      const message = this.msg as unknown as GoogleOperationMessage;
      if (err) {
        return this.sendMsg(err, null);
      }

      let configPayload: unknown = {};
      if (
        typeof this.config.payload === "string" ||
        this.config.payload instanceof String
      ) {
        if (this.config.payload.length === 0) {
          configPayload = null;
        } else {
          configPayload = JSON.parse(`${this.config.payload}`);
        }
      } else {
        configPayload = this.config.payload || {};
      }

      const apiGoogle = message.api || this.config.api;
      const payload = {
        ...(configPayload as Record<string, unknown>),
        ...(this.msg.payload as Record<string, unknown>),
      };
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
        callback ? callback(result) : this.sendMsg(null, result);
      } catch (err) {
        this.sendMsg(err as Error, null);
        return null;
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
