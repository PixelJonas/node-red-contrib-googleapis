import { EditorRED } from "node-red";
import { GoogleCalendarEditorNodeProperties } from "./modules/types";

declare const RED: EditorRED;

RED.nodes.registerType<GoogleCalendarEditorNodeProperties>("google-calendar", {
  category: "function",
  color: "#a6bbcf",
  defaults: {
    name: { value: "" },
  },
  inputs: 1,
  outputs: 1,
  icon: "font-awesome/fa-calendar",
  paletteLabel: "google calendar",
  label: function () {
    return this.name || "google calendar";
  },
});
