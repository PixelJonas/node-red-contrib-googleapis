import { NodeInitializer } from "node-red";
import { GoogleCalendarNode, GoogleCalendarNodeDef } from "./modules/types";

const nodeInit: NodeInitializer = (RED): void => {
  function GoogleCalendarNodeConstructor(
    this: GoogleCalendarNode,
    config: GoogleCalendarNodeDef
  ): void {
    RED.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      send(msg);
      done();
    });
  }

  RED.nodes.registerType("google-calendar", GoogleCalendarNodeConstructor);
};

export = nodeInit;
