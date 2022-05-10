import { NodeDef } from "node-red";
import { GoogleNode } from "src/nodes/shared/types";
import { GoogleEventsOptions } from "../shared/types";

export interface GoogleEventsNodeDef extends NodeDef, GoogleEventsOptions {}

export type GoogleEventsNode = GoogleNode;
