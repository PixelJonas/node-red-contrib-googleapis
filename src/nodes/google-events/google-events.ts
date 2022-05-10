import { NodeInitializer } from "node-red";
import { GoogleEventsNode, GoogleEventsNodeDef } from "./modules/types";

const nodeInit: NodeInitializer = (RED): void => {
  function GoogleEventsNodeConstructor(
    this: GoogleEventsNode,
    config: GoogleEventsNodeDef
  ): void {
    RED.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      send(msg);
      done();
    });
  }

  RED.nodes.registerType("google-events", GoogleEventsNodeConstructor);
};

export = nodeInit;
