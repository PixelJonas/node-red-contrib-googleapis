import { google } from 'googleapis';
import { NodeInitializer } from 'node-red';
import {
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions,
} from './google-credentials.html/modules/types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleCredentialsNode } from '../shared/types';

const nodeInit: NodeInitializer = (RED): void => {
  function GoogleCredentialsNodeConstructor(this: any, config: any): void {
    var node = <GoogleCredentialsNode>this;

    RED.nodes.createNode(node, config);
    if (config.loginType == 'oauth') {
    }
    var credentials = <GoogleCredentialsOptions>(
      RED.nodes.getCredentials(node.id)
    );
    console.log(credentials);

    // Save connection to Node
    node.conn = null;

    node.login = (_msg: string, callback: any) => {
      if (node.conn) {
        return callback(null, node.conn);
      } else if (credentials.loginType === 'oauth') {
        if (!credentials.accessToken || !credentials.refreshToken) {
          var error = new Error('accessToken or refreshToken missing');
          return callback(error);
        }

        var conn = new google.auth.OAuth2(
          credentials.clientId,
          credentials.clientSecret,
          credentials.redirectUri
        );
        conn.setCredentials({
          refresh_token: credentials.refreshToken,
        });
        conn.on('tokens', (tokens) => {
          console.log('oauthRefresh');
          if (tokens.refresh_token) {
            console.log('refreshToken:' + tokens.refresh_token);
            credentials.refreshToken = tokens.refresh_token;
          }
          console.log(`accessToken: ${tokens.access_token}`);
          credentials.accessToken = tokens.access_token;
          RED.nodes.addCredentials(node.id, credentials);
        });
        node.conn = conn;
        return callback(null, conn);
      }
    };
  }

  RED.nodes.registerType(
    'google-credentials',
    GoogleCredentialsNodeConstructor,
    {
      credentials: {
        id: { type: 'text' },
        loginType: { type: 'text' },
        username: { type: 'text' },
        apiKey: { type: 'password' },
        clientId: { type: 'password' },
        clientSecret: { type: 'password' },
        scopes: { type: 'text' },
        accessToken: { type: 'password' },
        refreshToken: { type: 'password' },
        userId: { type: 'text' },
      },
    }
  );

  RED.httpAdmin.get('/google/credentials/:id', function (req, res) {
    var id = req.params.id;
    var credentials = <GoogleCredentialsOptions>RED.nodes.getCredentials(id);
    return res.json({
      userId: credentials.userId,
    });
  });

  RED.httpAdmin.post('/google/credentials/:id/reset', function (req, res) {
    var id = req.params.id;
    var credentials = <GoogleCredentialsOptions>RED.nodes.getCredentials(id);
    credentials.userId = '';
    RED.nodes.addCredentials(id, credentials);
    return res.json({
      userId: credentials.userId,
    });
  });

  RED.httpAdmin.get('/google/credentials/:id/auth', function (req, res) {
    var id = req.query.id;
    var googleConfig = (RED.nodes.getNode(
      `${id}`
    ) as unknown) as GoogleCredentialsEditorNodeProperties;

    var clientId, clientSecret, scopes;
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

    var credentials = {
      id: id,
      loginType: 'oauth',
      clientId: clientId,
      clientSecret: clientSecret,
      scopes: `${scopes}`,
      redirectUri: req.query.callback,
    };

    RED.nodes.addCredentials(`${id}`, credentials);

    var oauth2 = new google.auth.OAuth2(
      credentials.clientId as string,
      credentials.clientSecret as string,
      credentials.redirectUri as string
    );

    var authUrl = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes.split(','),
    });
    if (req.query.username)
      authUrl = authUrl + '&login_hint=' + req.query.username;

    return res.redirect(authUrl);
  });

  RED.httpAdmin.get(
    '/google/credentials/:id/auth/callback',
    async function (req, res) {
      var id = req.params.id;
      var credentials = <GoogleCredentialsOptions>RED.nodes.getCredentials(id);

      if (!req.query.code) {
        return res.send('ERROR: missing authorization code');
      }

      if (!credentials || !credentials.clientId || !credentials.clientSecret) {
        return res.send('ERROR: missing credentials');
      }

      var conn = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      const { tokens } = await conn.getToken(`${req.query.code}`);
      console.log(tokens);

      conn.setCredentials(tokens);

      var finalCredentials = {
        id: id,
        loginType: 'oauth',
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
          'Authorised. You can now close this window and go back to Node-RED.',
        credentials: RED.nodes.getCredentials(id),
      });
    }
  );
};

export = nodeInit;
