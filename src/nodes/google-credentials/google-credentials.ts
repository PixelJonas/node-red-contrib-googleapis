import { google } from "googleapis";
import { NodeInitializer } from "node-red";
import {
  GoogleCredentialsNode,
  GoogleCredentialsNodeDef,
} from "../shared/types";
import { GoogleCredentialsOptions } from "./shared/types";

const nodeInit: NodeInitializer = (RED): void => {
  function GoogleCredentialsNodeConstructor(
    this: any,
    config: GoogleCredentialsNodeDef
  ): void {
    const node = <GoogleCredentialsNode>this;

    RED.nodes.createNode(node, config);
    const credentials = <GoogleCredentialsOptions>(
      RED.nodes.getCredentials(node.id)
    );

    // Save connection to Node
    node.conn = null;

    node.login = (_msg: string, callback: any) => {
      if (node.conn) {
        return callback(null, node.conn);
      } else if (credentials.loginType === "oauth-device-code") {
        if (!credentials.accessToken || !credentials.refreshToken) {
          const error = new Error("accessToken or refreshToken missing");
          return callback(error);
        }
        const conn = new google.auth.OAuth2(
          credentials.clientId,
          credentials.clientSecret,
          credentials.loginType === "oauth-device-code"
            ? credentials.redirectUri
            : undefined
        );
        conn.setCredentials({
          refresh_token: credentials.refreshToken,
        });
        conn.on("tokens", (tokens: any) => {
          if (tokens.refresh_token) {
            credentials.refreshToken = tokens.refresh_token;
          }
          credentials.accessToken = tokens.access_token;
          RED.nodes.addCredentials(node.id, credentials);
        });
        node.conn = conn;
        return callback(null, conn);
      }
    };
  }

  RED.nodes.registerType(
    "google-credentials",
    GoogleCredentialsNodeConstructor,
    {
      credentials: {
        id: { type: "text" },
        loginType: { type: "text" },
        username: { type: "text" },
        clientId: { type: "password" },
        clientSecret: { type: "password" },
        scopes: { type: "text" },
        accessToken: { type: "password" },
        refreshToken: { type: "password" },
      },
    }
  );
};

export = nodeInit;
