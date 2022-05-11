import { NodeInitializer } from "node-red";
import GoogleService from "../shared/GoogleService";
import NodeUtils from "../shared/NodeUtils";
import { GoogleCredentialsNode } from "../shared/types";
import { GoogleOperationNode, GoogleOperationNodeDef } from "./modules/types";

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
    this.google = config.google as string;
    this.googleConfig = <GoogleCredentialsNode>RED.nodes.getNode(this.google);
    NodeUtils.clear(this);
    if (this.googleConfig) {
      this.on("input", (msg, _send, _done) => {
        NodeUtils.info(this, "processing");
        const gService = new GoogleService(
          this.googleConfig,
          this,
          msg,
          config
        );
        gService.get();
      });
    } else {
      const error = new Error("missing google configuration");
      this.error(error.message);
      NodeUtils.error(this, error.message);
    }
  }

  RED.nodes.registerType("google-operation", GoogleOperationNodeConstructor);
};

export = nodeInit;
