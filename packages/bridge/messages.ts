export type NativeContextMessage = {
  type: "NATIVE_CONTEXT";
  payload: {
    platform: "native";
    source: "expo";
  };
};

export type NativeNavActionMessage = {
  type: "NATIVE_NAV_ACTION";
  payload: {
    path: string;
    title: string;
  };
};

export type CounterSyncMessage = {
  type: "COUNTER_SYNC";
  payload: { count: number };
};

export type WebNavStateMessage = {
  type: "WEB_NAV_STATE";
  payload: {
    path: string;
    title: string;
    webNavVisible: boolean;
  };
};

export type WebAckMessage = {
  type: "WEB_ACK";
  payload: {
    message: string;
  };
};

export type CounterActionMessage = {
  type: "COUNTER_ACTION";
  payload: { delta: number };
};

export type DetailRequestMessage = {
  type: "DETAIL_REQUEST";
  payload: { id: string; label: string };
};

export type PhotoPickerRequestMessage = {
  type: "PHOTO_PICKER_REQUEST";
  payload: Record<string, never>;
};

export type PhotoPickerResultMessage = {
  type: "PHOTO_PICKER_RESULT";
  payload: { uri: string } | { cancelled: true };
};

export type NativeToWebMessage = NativeContextMessage | NativeNavActionMessage | CounterSyncMessage | PhotoPickerResultMessage;
export type WebToNativeMessage = WebNavStateMessage | WebAckMessage | CounterActionMessage | DetailRequestMessage | PhotoPickerRequestMessage;
export type BridgeMessage = NativeToWebMessage | WebToNativeMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (!isRecord(value) || typeof value.type !== "string" || !isRecord(value.payload)) {
    return false;
  }

  switch (value.type) {
    case "NATIVE_CONTEXT":
      return value.payload.platform === "native" && value.payload.source === "expo";
    case "NATIVE_NAV_ACTION":
      return typeof value.payload.path === "string" && typeof value.payload.title === "string";
    case "COUNTER_SYNC":
      return typeof value.payload.count === "number";
    case "WEB_NAV_STATE":
      return (
        typeof value.payload.path === "string" &&
        typeof value.payload.title === "string" &&
        typeof value.payload.webNavVisible === "boolean"
      );
    case "WEB_ACK":
      return typeof value.payload.message === "string";
    case "COUNTER_ACTION":
      return typeof value.payload.delta === "number";
    case "DETAIL_REQUEST":
      return typeof value.payload.id === "string" && typeof value.payload.label === "string";
    case "PHOTO_PICKER_REQUEST":
      return true;
    case "PHOTO_PICKER_RESULT":
      return typeof value.payload.uri === "string" || value.payload.cancelled === true;
    default:
      return false;
  }
}

export function serializeBridgeMessage(message: BridgeMessage): string {
  return JSON.stringify(message);
}

export function toInjectedWebViewScript(message: BridgeMessage): string {
  const payload = serializeBridgeMessage(message).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `window.postMessage('${payload}', '*'); true;`;
}

export function parseBridgeMessage(raw: unknown): BridgeMessage | null {
  if (typeof raw !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isBridgeMessage(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
