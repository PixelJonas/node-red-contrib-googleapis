import { EditorNodeProperties } from "node-red";
import { GoogleEventsOptions } from "../../shared/types";

export interface GoogleEventsEditorNodeProperties
  extends EditorNodeProperties,
    GoogleEventsOptions {}
