import { EditorNodeProperties } from "node-red";
import { GoogleOperationOptions } from "../../shared/types";

export interface GoogleOperationEditorNodeProperties
  extends EditorNodeProperties,
    GoogleOperationOptions {}
