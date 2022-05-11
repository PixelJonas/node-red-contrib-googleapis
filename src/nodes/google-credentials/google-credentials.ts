import { google } from "googleapis";
import { NodeInitializer } from "node-red";
import { v4 as uuidv4 } from "uuid";
import {
  GoogleCredentialsNode,
  GoogleCredentialsNodeDef,
} from "../shared/types";
import {
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions,
} from "./shared/types";

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
      } else if (
        credentials.loginType === "oauth-consent" ||
        credentials.loginType === "oauth-device-code"
      ) {
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
        apiKey: { type: "password" },
        clientId: { type: "password" },
        clientSecret: { type: "password" },
        scopes: { type: "text" },
        accessToken: { type: "password" },
        refreshToken: { type: "password" },
        userId: { type: "text" },
      },
    }
  );

  RED.httpAdmin.get("/google/credentials/:id", (req, res) => {
    const id = req.params.id;
    const credentials = <GoogleCredentialsOptions>RED.nodes.getCredentials(id);
    return res.json({
      userId: credentials.userId,
    });
  });

  RED.httpAdmin.post("/google/credentials/:id/reset", (req, res) => {
    const id = req.params.id;
    const credentials = <GoogleCredentialsOptions>RED.nodes.getCredentials(id);
    credentials.userId = "";
    RED.nodes.addCredentials(id, credentials);
    return res.json({
      userId: credentials.userId,
    });
  });

  RED.httpAdmin.get("/google/credentials/:id/auth", (req, res) => {
    const id = req.query.id;
    const googleConfig = RED.nodes.getNode(
      `${id}`
    ) as unknown as GoogleCredentialsEditorNodeProperties;
    let clientId, clientSecret, scopes;
    if (
      googleConfig &&
      googleConfig.credentials &&
      googleConfig.credentials.clientId
    ) {
      clientId = googleConfig.credentials.clientId;
    } else {
      clientId = req.query.clientId;
    }
    if (
      googleConfig &&
      googleConfig.credentials &&
      googleConfig.credentials.clientSecret
    ) {
      clientSecret = googleConfig.credentials.clientSecret;
    } else {
      clientSecret = req.query.clientSecret;
    }
    if (
      googleConfig &&
      googleConfig.credentials &&
      googleConfig.credentials.scopes
    ) {
      scopes = googleConfig.credentials.scopes;
    } else {
      scopes = `${req.query.scopes}`;
    }

    const credentials = {
      id: id,
      loginType: "oauth",
      clientId: clientId,
      clientSecret: clientSecret,
      scopes: `${scopes}`,
      redirectUri: req.query.callback,
    };
    RED.nodes.addCredentials(`${id}`, credentials);

    const oauth2 = new google.auth.OAuth2(
      credentials.clientId as string,
      credentials.clientSecret as string,
      credentials.redirectUri as string
    );

    let authUrl = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes.split(","),
    });
    if (req.query.username)
      authUrl = authUrl + "&login_hint=" + req.query.username;

    return res.redirect(authUrl);
  });

  RED.httpAdmin.get(
    "/google/credentials/:id/auth/callback",
    async (req, res) => {
      const id = req.params.id;
      const credentials = <GoogleCredentialsOptions>(
        RED.nodes.getCredentials(id)
      );

      if (!req.query.code) {
        return res.send("ERROR: missing authorization code");
      }

      if (!credentials || !credentials.clientId || !credentials.clientSecret) {
        return res.send("ERROR: missing credentials");
      }

      const conn = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      const { tokens } = await conn.getToken(`${req.query.code}`);

      conn.setCredentials(tokens);

      const finalCredentials = {
        id: id,
        loginType: "oauth",
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        scopes: credentials.scopes,
        redirectUri: credentials.redirectUri,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userId: uuidv4(),
      };

      RED.nodes.addCredentials(id, finalCredentials);

      return res.json({
        message:
          "Authorised. You can now close this window and go back to Node-RED.",
        credentials: RED.nodes.getCredentials(id),
      });
    }
  );
};

export = nodeInit;
