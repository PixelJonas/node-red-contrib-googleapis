import { Node } from "node-red";

export default class NodeUtils {
  static error(node: Node, errorMsg: string): void {
    node.status({
      fill: "red",
      shape: "dot",
      text: formatErrorMsg(errorMsg),
    });
  }

  static success(node: Node, successMsg: string): void {
    node.status({
      fill: "green",
      shape: "dot",
      text: successMsg,
    });
  }

  static warning(node: Node, failureMessage: string): void {
    node.status({
      fill: "yellow",
      shape: "dot",
      text: failureMessage,
    });
  }

  static info(node: Node, infoMessage: string): void {
    node.status({
      fill: "blue",
      shape: "dot",
      text: infoMessage,
    });
  }

  static errorRing(node: Node, errorMsg: string): void {
    node.status({
      fill: "red",
      shape: "ring",
      text: formatErrorMsg(errorMsg),
    });
  }

  static successRing(node: Node, successMsg: string): void {
    node.status({
      fill: "green",
      shape: "ring",
      text: successMsg,
    });
  }

  static warningRing(node: Node, failureMessage: string): void {
    node.status({
      fill: "yellow",
      shape: "ring",
      text: failureMessage,
    });
  }

  static infoRing(node: Node, infoMessage: string): void {
    node.status({
      fill: "blue",
      shape: "ring",
      text: infoMessage,
    });
  }

  static clear(node: Node): void {
    node.status({});
  }
}

function formatErrorMsg(errorMsg: string): string {
  const errorMessage = errorMsg || "Unknown Error";
  let result = errorMessage.split(":")[0];
  if (result.length > 30) {
    result = result.substring(0, 30) + "...";
  }
  return result;
}
