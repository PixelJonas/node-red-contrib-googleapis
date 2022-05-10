import { NodeInitializer } from "node-red";
import { GoogleOperationOptions } from "../google-operation/shared/types";
import GoogleService from "../shared/GoogleService";
import NodeUtils from "../shared/NodeUtils";
import { GoogleCredentialsNode } from "../shared/types";
import { GoogleEventsNode, GoogleEventsNodeDef } from "./modules/types";
import { GoogleEventsOptions } from "./shared/types";

const nodeInit: NodeInitializer = (RED): void => {
  function GoogleEventsNodeConstructor(
    this: GoogleEventsNode,
    config: GoogleEventsNodeDef
  ): void {
    RED.nodes.createNode(this, config);
    this.google = config.google as string;
    this.googleConfig = <GoogleCredentialsNode>RED.nodes.getNode(this.google);

    NodeUtils.clear(this);

    if (this.googleConfig) {
      this.on("input", (msg, _send, _done) => {
        NodeUtils.info(this, "processing");
        const payload = msg.payload as GoogleEventsOptions;
        const gServiceConfig: GoogleOperationOptions = {
          ...config,
          ...{
            api: "calendar",
            version: "v3",
            path: "events",
            method: "list",
            payload: {
              calendarId: payload?.calendarId || config.calendarId,
              timeMin: payload?.from || config.from,
              timeMax: payload?.to || config.to,
              maxResults: payload?.maxResults || config.maxResults,
              singleEvents: payload?.singleEvents || config.singleEvents,
              orderBy: payload?.orderBy || config.orderBy,
            },
          },
        };
        const gService = new GoogleService(
          this.googleConfig,
          this,
          { _msgid: msg._msgid },
          gServiceConfig
        );
        gService.login((result) => {
          gService.sendMsg(null, result.data.items);
        });
      });
    } else {
      const error = new Error("missing google configuration");
      this.error(error.message);
      NodeUtils.error(this, error.message);
    }
  }

  RED.nodes.registerType("google-events", GoogleEventsNodeConstructor);
};

export = nodeInit;
