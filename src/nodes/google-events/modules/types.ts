import { Node, NodeDef } from "node-red";
import { GoogleEventsOptions } from "../shared/types";

export interface GoogleEventsNodeDef extends NodeDef, GoogleEventsOptions {}

// export interface GoogleEventsNode extends Node {}
export type GoogleEventsNode = Node;
