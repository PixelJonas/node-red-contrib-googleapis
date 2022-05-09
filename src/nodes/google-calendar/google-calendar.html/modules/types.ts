import { EditorNodeProperties } from "node-red";
import { GoogleCalendarOptions } from "../../shared/types";

export interface GoogleCalendarEditorNodeProperties
  extends EditorNodeProperties,
    GoogleCalendarOptions {}
