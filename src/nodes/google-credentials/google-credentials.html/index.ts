import { EditorRED } from "node-red";
import { CustomEditorWidgetTypedInputTypeDefinition } from "../../../../src/nodes/shared/types";
import {
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions,
} from "../shared/types";

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
>("google-credentials", {
  category: "config",
  defaults: {
    loginType: { value: "", required: true },
    username: { value: "" },
  },
  credentials: {
    loginType: { type: "text" },
    clientId: { type: "password" },
    clientSecret: { type: "password" },
    scopes: { type: "text" },
    accessToken: { type: "text" },
    refreshToken: { type: "text" },
  },
  label: function () {
    return this.username || this.name || "google credentials";
  },
  oneditprepare: function () {
    const node = this as GoogleCredentialsOptions;
    const options = [
      {
        value: "oauth-device-code",
        label: "OAuth2 Consent",
      },
    ];
    $("#node-config-input-loginType").typedInput({
      types: [
        {
          value: "loginType",
          options: options,
        } as CustomEditorWidgetTypedInputTypeDefinition,
      ],
    });

    function pollDeviceCodeAuthStatus(
      clientId: string,
      clientSecret: string,
      deviceCode: string
    ) {
      const params = {
        client_id: clientId,
        client_secret: clientSecret,
        deviceCode: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      };

      $.post("https://oauth2.googleapis.com/token", params)
        .then((response) => {
          if (response["access_token"]) {
            $("#node-config-input-accessToken").val(response["access_token"]);
            $("#node-config-input-refreshToken").val(response["refresh_token"]);
            node.accessToken = response["access_token"];
            node.refreshToken = response["refresh_token"];
            node.credentials.accessToken = response["access_token"];
            node.credentials.refreshToken = response["refresh_token"];

            $("#node-config-device-code-tooltip").html(
              `<p>Success!</p><p>Authentication flow done, click "Add" on the upper right corner to proceed.</p>`
            );
          } else {
            console.log("no access token found");
            window.deviceCodeAuth = window.setTimeout(
              () =>
                pollDeviceCodeAuthStatus(clientId, clientSecret, deviceCode),
              2000
            );
          }
        })
        .catch((error) => {
          console.log(error);
          window.deviceCodeAuth = window.setTimeout(
            () => pollDeviceCodeAuthStatus(clientId, clientSecret, deviceCode),
            2000
          );
        });
    }

    $("#node-config-start-auth").on("click", (e) => {
      // Delete any running reoccuring intervals for new attempt
      e.preventDefault();
      delete window.googleConfigNodeIntervalId;
      delete window.deviceCodeAuth;

      const clientId = $("#node-config-input-clientId").val();
      const clientSecret = $("#node-config-input-clientSecret").val();
      const scopes = $("#node-config-input-scopes").val();

      const loginType = $("#node-config-input-loginType").val();
      console.log("got clicked!!!");
      console.log(loginType);

      if (loginType == "oauth-device-code") {
        if (clientId !== "" || scopes !== "") {
          const params = new URLSearchParams();
          params.append("client_id", `${clientId}`);
          params.append("scope", `${scopes}`);
          const tokenParams = {
            client_id: `${clientId}`,
            scope: `${scopes}`,
          };
          $.post("https://oauth2.googleapis.com/device/code", tokenParams).then(
            (response) => {
              $("#node-config-device-code-tooltip").html(
                `<p>Please click on this link:</p>\n<code>https://www.google.com/device</code><p>and put in this code:</p>\n<code>${response["user_code"]}</code>`
              );
              $("#node-config-device-code-tooltip").show();

              window.deviceCodeAuth = window.setTimeout(
                () =>
                  pollDeviceCodeAuthStatus(
                    `${clientId}`,
                    `${clientSecret}`,
                    response["device_code"]
                  ),
                2000
              );
            }
          );
        }
      }
    });

    $("#node-config-input-loginType").on("change", () => {
      const clientIdel = $(".input-clientId-row");
      const scopesel = $(".input-scopes-row");
      const secretel = $(".input-clientSecret-row");
      const buttonel = $(".input-startauth-row");

      const loginType = $("#node-config-input-loginType option:selected").val();
      if (loginType == "oauth-device-code") {
        delete window.googleConfigNodeIntervalId;
        clientIdel.show();
        scopesel.show();
        secretel.show();
        buttonel.show();
      }
    });
  },
});
