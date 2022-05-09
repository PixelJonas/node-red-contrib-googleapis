import { EditorRED } from "node-red";
import {
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions,
} from "./modules/types";

declare const RED: EditorRED;
declare global {
  interface Window {
    googleConfigNodeIntervalId?: number;
  }
}

RED.nodes.registerType<
  GoogleCredentialsEditorNodeProperties,
  GoogleCredentialsOptions
>("google-credentials", {
  category: "config",
  defaults: {
    loginType: { value: "oauth", required: true },
    username: { value: "google-credentials" },
    userId: { value: "" },
  },
  credentials: {
    loginType: { type: "text" },
    apiKey: { type: "password" },
    clientId: { type: "password" },
    scopes: { type: "text" },
    userId: { type: "text" },
  },
  label: function () {
    return this.username || this.name || "google credentials";
  },
  oneditprepare: function () {
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
      const clientId = $("#node-config-input-clientId").val() || "";
      const clientSecret = $("#node-config-input-clientSecret").val();
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
    $("#node-config-input-clientId").on(
      "change keydown paste input",
      updateAuthButton
    );
    $("#node-config-input-clientSecret").on(
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
      $("#node-config-input-userId").val(dn);
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

      const clientId = $("#node-config-input-clientId").val();
      const clientSecret = $("#node-config-input-clientSecret").val();
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
    });

    $("#node-config-start-auth").on("click", (e) => {
      console.log(`yep this works5`);

      const clientId = $("#node-config-input-clientId").val();
      const clientSecret = $("#node-config-input-clientSecret").val();
      const username = $("#node-config-input-username").val();
      const scopes = $("#node-config-input-scopes").val();
      if (
        clientId === "" ||
        clientSecret === "" ||
        username === "" ||
        scopes === ""
      ) {
        e.preventDefault();
      }
    });
    console.log(`yep this works7`);

    $("#node-config-input-loginType").on("change", () => {
      console.log(`yep this works6`);

      const apiKeyel = $(".input-apiKey-row");
      const clientIdel = $(".input-clientId-row");
      const scopesel = $(".input-scopes-row");
      const secretel = $(".input-clientSecret-row");
      const buttonel = $(".input-startauth-row");
      const tooltipel = $("#node-config-force-tooltip");

      const id = $("#node-config-input-loginType option:selected").val();
      if (id == "oauth") {
        apiKeyel.hide();
        clientIdel.show();
        scopesel.show();
        secretel.show();
        buttonel.show();
        tooltipel.show();
      }
    });
  },
});
