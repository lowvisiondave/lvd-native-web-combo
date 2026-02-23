"use client";

import {
  parseBridgeMessage,
  serializeBridgeMessage,
  type CounterActionMessage,
  type NativeNavActionMessage,
  type PhotoPickerResultMessage,
  type WebNavStateMessage
} from "./messages";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type PhotoPickerListener = (result: PhotoPickerResultMessage["payload"]) => void;

type BridgeContextValue = {
  isNativeApp: boolean;
  count: number;
  updateCounter: (delta: number) => void;
  postMessageToNative: (message: string) => void;
  onPhotoPickerResult: (listener: PhotoPickerListener) => () => void;
};

const BridgeContext = createContext<BridgeContextValue>({
  isNativeApp: false,
  count: 0,
  updateCounter: () => {},
  postMessageToNative: () => {},
  onPhotoPickerResult: () => () => {}
});

export type BridgeProviderProps = {
  children: ReactNode;
  onNativeNavigate: (path: string) => void;
  path: string;
  title: string;
  webNavVisible: boolean;
  bodyClassName?: string;
};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function BridgeProvider({
  bodyClassName = "native-context",
  children,
  onNativeNavigate,
  path,
  title,
  webNavVisible
}: BridgeProviderProps) {
  const [count, setCount] = useState(0);
  const photoPickerListeners = useRef(new Set<PhotoPickerListener>());

  const onPhotoPickerResult = useCallback((listener: PhotoPickerListener) => {
    photoPickerListeners.current.add(listener);
    return () => { photoPickerListeners.current.delete(listener); };
  }, []);

  const postMessageToNative = useCallback((message: string) => {
    window.ReactNativeWebView?.postMessage(message);
  }, []);

  const updateCounter = useCallback(
    (delta: number) => {
      const message: CounterActionMessage = {
        type: "COUNTER_ACTION",
        payload: { delta }
      };
      postMessageToNative(serializeBridgeMessage(message));
    },
    [postMessageToNative]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const parsed = parseBridgeMessage(
        typeof event.data === "string" ? event.data : JSON.stringify(event.data)
      );
      if (!parsed) return;

      switch (parsed.type) {
        case "NATIVE_NAV_ACTION":
          onNativeNavigate((parsed as NativeNavActionMessage).payload.path);
          break;
        case "COUNTER_SYNC":
          setCount(parsed.payload.count);
          break;
        case "PHOTO_PICKER_RESULT":
          for (const listener of photoPickerListeners.current) {
            listener((parsed as PhotoPickerResultMessage).payload);
          }
          break;
      }
    };

    const onDocumentMessage = (event: Event) => {
      onMessage(event as MessageEvent);
    };

    window.addEventListener("message", onMessage);
    document.addEventListener("message", onDocumentMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onDocumentMessage);
    };
  }, [onNativeNavigate]);

  useEffect(() => {
    document.body.classList.add(bodyClassName);
    return () => {
      document.body.classList.remove(bodyClassName);
    };
  }, [bodyClassName]);

  useEffect(() => {
    if (!window.ReactNativeWebView) return;

    const message: WebNavStateMessage = {
      type: "WEB_NAV_STATE",
      payload: { path, title, webNavVisible }
    };

    postMessageToNative(serializeBridgeMessage(message));
  }, [path, postMessageToNative, title, webNavVisible]);

  const value = useMemo<BridgeContextValue>(
    () => ({ isNativeApp: true, count, updateCounter, postMessageToNative, onPhotoPickerResult }),
    [count, updateCounter, postMessageToNative, onPhotoPickerResult]
  );

  return (
    <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
  );
}

export function useBridge() {
  return useContext(BridgeContext);
}

export function WebBridgeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<BridgeContextValue>(
    () => ({
      isNativeApp: false,
      count: 0,
      updateCounter: () => {},
      postMessageToNative: () => {},
      onPhotoPickerResult: () => () => {}
    }),
    []
  );

  return (
    <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
  );
}
