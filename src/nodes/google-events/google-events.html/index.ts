import { EditorRED } from "node-red";
import EditorUtils from "../../shared/EditorUtils";
import { Input } from "../../shared/types";
import { GoogleEventsEditorNodeProperties } from "./modules/types";

declare const RED: EditorRED;
const TypeConfig: Array<Input> = [
  { id: "name" },
  { id: "calendarId" },
  { id: "from", types: ["str", "msg", "flow", "global", "date"] },
  { id: "to", types: ["str", "msg", "flow", "global", "date"] },
  { id: "maxResults", types: ["num", "msg", "flow", "global"] },
  { id: "singleEvents", types: ["bool"] },
  {
    id: "orderBy",
    types: [
      {
        value: "orderBy",
        options: ["startTime", "updated"],
      },
    ],
  },
];

RED.nodes.registerType<GoogleEventsEditorNodeProperties>("google-events", {
  category: "google",
  color: "#fff",
  defaults: {
    name: { value: "" },
    calendarId: { value: "primary", required: true },
    from: { value: new Date().toISOString() },
    to: { value: "" },
    maxResults: { value: 20 },
    singleEvents: { value: true },
    orderBy: { value: "startTime" },
    google: { type: "google-credentials", required: true, value: "" },
  },
  inputs: 1,
  outputs: 1,
  icon: "font-awesome/fa-calendar",
  paletteLabel: "google events",
  label: function () {
    return this.name || "google events";
  },
  labelStyle: function () {
    return this.name ? "node_label_italic" : "";
  },
  oneditprepare: () => {
    EditorUtils.formatInputs(TypeConfig);
  },
});
