import { EditorRED } from "node-red";
import {
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions
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
    loginType: { value: "oauth-consent", required: true },
    username: { value: "" },
    userId: { value: "" },
  },
  credentials: {
    loginType: { type: "text" },
    apiKey: { type: "password" },
    clientId: { type: "password" },
    scopes: { type: "text" },
    userId: { type: "text" },
    accessToken: { type: "text" },
    refreshToken: { type: "text" },
  },
  label: function () {
    return this.username || this.name || "google credentials";
  },
  oneditprepare: function () {
    let node = this as GoogleCredentialsOptions;

    const id = this.id;
    let pathname = document.location.pathname;
    if (pathname.slice(-1) != "/") {
      pathname += "/";
    }
    let callback = `${location.protocol}//`;
    callback +=
      location.port == ""
        ? location.hostname
        : `${location.hostname}:${location.port}`;
    callback += `${pathname}google/credentials/${id}/auth/callback`;
    $("#node-config-google-tooltip").html(
      `<p>Please configure the authorized <b>Redirect URIs</b> of your app to include the following url:</p>\n<code>${callback}</code>`
    );
    console.log(`yep this works1`);
    const updateAuthButton = () => {
      console.log("Hi");
      const clientId = $("#node-config-input-client-id").val() || "";
      const clientSecret = $("#node-config-input-client-secret").val();
      const username = $("#node-config-input-username").val();
      const scopes = $("#node-config-input-scopes").val();
      $("#node-config-start-auth").toggleClass(
        "disabled",
        (typeof clientId === "string" && clientId.length === 0) ||
          (typeof clientSecret === "string" && clientSecret.length === 0) ||
          (typeof username === "string" && username.length === 0) ||
          (typeof scopes === "string" && scopes.length === 0)
      );
    };
    $("#node-config-input-username").on(
      "change keydown paste input",
      updateAuthButton
    );
    $("#node-config-input-client-id").on(
      "change keydown paste input",
      updateAuthButton
    );
    $("#node-config-input-client-secret").on(
      "change keydown paste input",
      updateAuthButton
    );
    $("#node-config-input-scopes").on(
      "change keydown paste input",
      updateAuthButton
    );
    updateAuthButton();

    //
    function pollGoogleCredentialsUrl() {
      console.log(`yep this works2`);

      $.getJSON(pathname + "google/credentials/" + id, (data) => {
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
      console.log(`yep this works3`);

      $("#node-config-google-client-keys").hide();
      $("#node-config-google").show();
      $("#node-config-input-user-id").val(dn);
      const username = $("#node-config-input-username").val() || "";
      $("#node-config-google-username").html(`${username}`);
    }

    if (this.credentials?.userId) {
      updateGoogleUserId(this.userId);
    } else {
      $("#node-config-google-client-keys").show();
      $("#node-config-google").hide();
    }

    $("#node-config-start-auth").on("mousedown", function () {
      console.log(`yep this works4`);

      const loginType = $("#node-config-input-login-type option:selected").val();
      if (loginType == "oauth-consent") {
        const clientId = $("#node-config-input-client-id").val();
        const clientSecret = $("#node-config-input-client-secret").val();
        const username = $("#node-config-input-username").val();
        const scopes = $("#node-config-input-scopes").val();
        const url =
          "google/credentials/" +
          id +
          "/auth?id=" +
          id +
          "&clientId=" +
          clientId +
          "&clientSecret=" +
          clientSecret +
          "&callback=" +
          encodeURIComponent(callback) +
          "&username=" +
          username +
          "&scopes=" +
          scopes;
        $(this).attr("href", url);
        window.googleConfigNodeIntervalId = window.setTimeout(
          pollGoogleCredentialsUrl,
          2000
        );
      }

      
    });

    function pollDeviceCodeAuthStatus(clientId: string, clientSecret: string, deviceCode: string) {
      const params = new URLSearchParams();
      
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);
      params.append("device_code", deviceCode);
      params.append("grant_type", "urn:ietf:params:oauth:grant-type:device_code");
      
      fetch("https://oauth2.googleapis.com/token", {method: "POST", body: params}).then((res) => {
        res.json().then((json) => {
          
          if (json["access_token"]) {
          $("#node-config-input-access-token").val(json["access_token"]);
            $("#node-config-input-refresh-token").val(json["refresh_token"]);

            node.accessToken = json["access_token"];
            node.refreshToken = json["refresh_token"];
            node.credentials.accessToken = json["access_token"];
            node.credentials.refreshToken = json["refresh_token"];

            $("#node-config-device-code-tooltip").html(
              `<p>Success!</p><p>Authentication flow done, click "Add" on the upper right corner to proceed.</p>`
            );
          } else {
            window.deviceCodeAuth = window.setTimeout(
              () => pollDeviceCodeAuthStatus(clientId, clientSecret, deviceCode),
              2000
            );
          }
        });
      });
    }

    $("#node-config-start-auth").on("click", (e) => {
      console.log(`yep this works5`);

      // Delete any running reoccuring intervals for new attempt
      delete window.googleConfigNodeIntervalId;
      delete window.deviceCodeAuth;

      const username = $("#node-config-input-username").val();
      const clientId = $("#node-config-input-client-id").val();
      const clientSecret = $("#node-config-input-client-secret").val();
      const scopes = $("#node-config-input-scopes").val();

      const loginType = $("#node-config-input-login-type option:selected").val();
      if (loginType == "oauth-consent") {
        if (
          clientId === "" ||
          clientSecret === "" ||
          username === "" ||
          scopes === ""
        ) {
          e.preventDefault();
        }
      } else if (loginType == "oauth-device-code") {
        e.preventDefault();
        if (
          clientId !== "" ||
          scopes !== ""
        ) {
          const params = new URLSearchParams();
          params.append("client_id", `${clientId}`);
          params.append("scope", `${scopes}`);

          fetch("https://oauth2.googleapis.com/device/code", {method: "POST", body: params}).then((res) => {
            res.json().then((json) => {
              $("#node-config-device-code-tooltip").html(
                `<p>Please click on this link:</p>\n<code>https://www.google.com/device</code><p>and put in this code:</p>\n<code>${json["user_code"]}</code>`
              );
  
              $("#node-config-device-code-tooltip").show();

              window.deviceCodeAuth = window.setTimeout(
                () => pollDeviceCodeAuthStatus(`${clientId}`, `${clientSecret}`, json["device_code"]),
                2000
              );
            });
          });
        }
      }
    });
    console.log(`yep this works7`);

    $("#node-config-input-login-type").on("change", () => {
      console.log(`yep this works6`);

      const consentTooltipel = $("#node-config-google-tooltip");
      const deviceCodeTooltipel = $("#node-config-device-code-tooltip");
      const apiKeyel = $(".input-apiKey-row");
      const clientIdel = $(".input-client-id-row");
      const scopesel = $(".input-scopes-row");
      const secretel = $(".input-client-secret-row");
      const buttonel = $(".input-startauth-row");

      const loginType = $("#node-config-input-login-type option:selected").val();
      if (loginType == "oauth-consent") {
        delete window.deviceCodeAuth;
        consentTooltipel.show();
        deviceCodeTooltipel.hide();
        apiKeyel.hide();
        clientIdel.show();
        scopesel.show();
        secretel.show();
        buttonel.show();
      } else if (loginType == "oauth-device-code") {
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
