import { Node, NodeDef } from "node-red";
import { GoogleCalendarOptions } from "../shared/types";

export interface GoogleCalendarNodeDef extends NodeDef, GoogleCalendarOptions {}

// export interface GoogleCalendarNode extends Node {}
export type GoogleCalendarNode = Node;
