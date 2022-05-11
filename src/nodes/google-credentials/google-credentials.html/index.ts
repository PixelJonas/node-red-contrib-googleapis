import { EditorRED } from 'node-red';
import {
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions,
} from '../shared/types';

declare const RED: EditorRED;
declare global {
  interface Window {
    googleConfigNodeIntervalId?: number;
    deviceCodeAuth?: number;
  }
}

RED.nodes.registerType<
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions
>('google-credentials', {
  category: 'config',
  defaults: {
    loginType: { value: 'oauth-consent', required: true },
    username: { value: '' },
    userId: { value: '' },
  },
  credentials: {
    loginType: { type: 'text' },
    apiKey: { type: 'password' },
    clientId: { type: 'password' },
    scopes: { type: 'text' },
    userId: { type: 'text' },
    accessToken: { type: 'text' },
    refreshToken: { type: 'text' },
  },
  label: function () {
    return this.username || this.name || 'google credentials';
  },
  oneditprepare: function () {
    let node = this as GoogleCredentialsOptions;

    const id = this.id;
    let pathname = document.location.pathname;
    if (pathname.slice(-1) != '/') {
      pathname += '/';
    }
    let callback = `${location.protocol}//`;
    callback +=
      location.port == ''
        ? location.hostname
        : `${location.hostname}:${location.port}`;
    callback += `${pathname}google/credentials/${id}/auth/callback`;
    $('#node-config-google-tooltip').html(
      `<p>Please configure the authorized <b>Redirect URIs</b> of your app to include the following url:</p>\n<code>${callback}</code>`
    );
    const updateAuthButton = () => {
      const clientId = $('#node-config-input-clientId').val() || '';
      const clientSecret = $('#node-config-input-clientSecret').val();
      const username = $('#node-config-input-username').val();
      const scopes = $('#node-config-input-scopes').val();
      $('#node-config-start-auth').toggleClass(
        'disabled',
        (typeof clientId === 'string' && clientId.length === 0) ||
          (typeof clientSecret === 'string' && clientSecret.length === 0) ||
          (typeof username === 'string' && username.length === 0) ||
          (typeof scopes === 'string' && scopes.length === 0)
      );
    };
    $('#node-config-input-username').on(
      'change keydown paste input',
      updateAuthButton
    );
    $('#node-config-input-clientId').on(
      'change keydown paste input',
      updateAuthButton
    );
    $('#node-config-input-clientSecret').on(
      'change keydown paste input',
      updateAuthButton
    );
    $('#node-config-input-scopes').on(
      'change keydown paste input',
      updateAuthButton
    );
    updateAuthButton();

    //
    function pollGoogleCredentialsUrl() {
      $.getJSON(pathname + 'google/credentials/' + id, (data) => {
        if (data.userId) {
          updateGoogleUserId(data.userId);
          delete window.googleConfigNodeIntervalId;
        } else {
          window.googleConfigNodeIntervalId = window.setTimeout(
            pollGoogleCredentialsUrl,
            2000
          );
        }
      });
    }

    function updateGoogleUserId(dn: string) {
      $('#node-config-google-client-keys').hide();
      $('#node-config-google').show();
      $('#node-config-input-userId').val(dn);
      const username = $('#node-config-input-username').val() || '';
      $('#node-config-google-username').html(`${username}`);
    }

    if (this.credentials?.userId) {
      updateGoogleUserId(this.userId);
    } else {
      $('#node-config-google-client-keys').show();
      $('#node-config-google').hide();
    }
    if (this.loginType == 'oauth-consent') {
      $('#node-config-start-auth').on('mousedown', function () {
        const clientId = $('#node-config-input-clientId').val();
        const clientSecret = $('#node-config-input-clientSecret').val();
        const username = $('#node-config-input-username').val();
        const scopes = $('#node-config-input-scopes').val();
        const url =
          'google/credentials/' +
          id +
          '/auth?id=' +
          id +
          '&clientId=' +
          clientId +
          '&clientSecret=' +
          clientSecret +
          '&callback=' +
          encodeURIComponent(callback) +
          '&username=' +
          username +
          '&scopes=' +
          scopes;
        $(this).attr('href', url);
        window.googleConfigNodeIntervalId = window.setTimeout(
          pollGoogleCredentialsUrl,
          2000
        );
      });
    }
    function pollDeviceCodeAuthStatus(
      clientId: string,
      clientSecret: string,
      deviceCode: string
    ) {
      const params = new URLSearchParams();

      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('device_code', deviceCode);
      params.append(
        'grant_type',
        'urn:ietf:params:oauth:grant-type:device_code'
      );

      fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: params,
      }).then((res) => {
        res.json().then((json) => {
          if (json['access_token']) {
            $('#node-config-input-accessToken').val(json['access_token']);
            $('#node-config-input-refreshToken').val(json['refresh_token']);

            node.accessToken = json['access_token'];
            node.refreshToken = json['refresh_token'];
            node.credentials.accessToken = json['access_token'];
            node.credentials.refreshToken = json['refresh_token'];

            $('#node-config-device-code-tooltip').html(
              `<p>Success!</p><p>Authentication flow done, click "Add" on the upper right corner to proceed.</p>`
            );
          } else {
            window.deviceCodeAuth = window.setTimeout(
              () =>
                pollDeviceCodeAuthStatus(clientId, clientSecret, deviceCode),
              2000
            );
          }
        });
      });
    }

    $('#node-config-start-auth').on('click', (e) => {
      // Delete any running reoccuring intervals for new attempt
      delete window.googleConfigNodeIntervalId;
      delete window.deviceCodeAuth;

      const username = $('#node-config-input-username').val();
      const clientId = $('#node-config-input-clientId').val();
      const clientSecret = $('#node-config-input-clientSecret').val();
      const scopes = $('#node-config-input-scopes').val();

      const loginType = $('#node-config-input-loginType option:selected').val();
      if (loginType == 'oauth-consent') {
        if (
          clientId === '' ||
          clientSecret === '' ||
          username === '' ||
          scopes === ''
        ) {
          e.preventDefault();
        }
      } else if (loginType == 'oauth-device-code') {
        e.preventDefault();
        if (clientId !== '' || scopes !== '') {
          const params = new URLSearchParams();
          params.append('client_id', `${clientId}`);
          params.append('scope', `${scopes}`);

          fetch('https://oauth2.googleapis.com/device/code', {
            method: 'POST',
            body: params,
          }).then((res) => {
            res.json().then((json) => {
              console.log(json);
              $('#node-config-device-code-tooltip').html(
                `<p>Please click on this link:</p>\n<code>https://www.google.com/device</code><p>and put in this code:</p>\n<code>${json['user_code']}</code>`
              );

              $('#node-config-device-code-tooltip').show();

              window.deviceCodeAuth = window.setTimeout(
                () =>
                  pollDeviceCodeAuthStatus(
                    `${clientId}`,
                    `${clientSecret}`,
                    json['device_code']
                  ),
                2000
              );
            });
          });
        }
      }
    });

    $('#node-config-input-loginType').on('change', () => {
      const consentTooltipel = $('#node-config-google-tooltip');
      const deviceCodeTooltipel = $('#node-config-device-code-tooltip');
      const apiKeyel = $('.input-apiKey-row');
      const clientIdel = $('.input-clientId-row');
      const scopesel = $('.input-scopes-row');
      const secretel = $('.input-clientSecret-row');
      const buttonel = $('.input-startauth-row');

      const loginType = $('#node-config-input-loginType option:selected').val();
      if (loginType == 'oauth-consent') {
        delete window.deviceCodeAuth;
        consentTooltipel.show();
        deviceCodeTooltipel.hide();
        apiKeyel.hide();
        clientIdel.show();
        scopesel.show();
        secretel.show();
        buttonel.show();
      } else if (loginType == 'oauth-device-code') {
        delete window.googleConfigNodeIntervalId;
        consentTooltipel.hide();
        apiKeyel.hide();
        clientIdel.show();
        scopesel.show();
        secretel.show();
        buttonel.show();
      }
    });
  },
});
