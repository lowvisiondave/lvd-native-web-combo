import {
  parseBridgeMessage,
  toInjectedWebViewScript,
  type NativeContextMessage,
  type NativeToWebMessage
} from "@repo/bridge";
import * as ImagePicker from "expo-image-picker";
import {
  NATIVE_SHELL_TITLE,
  appNavItems
} from "@repo/app-config/app-routes";
import { toNativeRoute } from "@repo/app-config/native-route-paths";
import { designTokens } from "@repo/app-config/tokens";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Linking, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView
} from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { DetailDrawer } from "./components/DetailDrawer";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { TabBar } from "./components/TabBar";

const { color } = designTokens;

function inferBaseWebUrl() {
  const envUrl = process.env.EXPO_PUBLIC_WEB_URL;
  if (envUrl) return envUrl;

  if (!__DEV__) {
    throw new Error(
      "EXPO_PUBLIC_WEB_URL must be set to an https:// URL in production builds"
    );
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:3000`;
  return "http://localhost:3000";
}

const BASE_WEB_URL = inferBaseWebUrl();

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [count, setCount] = useState(0);
  const [detailItem, setDetailItem] = useState<{ id: string; label: string } | null>(null);
  const clearDetailItem = useCallback(() => setDetailItem(null), []);
  const badgeScale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);
  const initialUri = useMemo(() => `${BASE_WEB_URL}${toNativeRoute("/")}`, []);
  const messageTimestamps = useRef<Record<string, number>>({});

  const handleNavigationRequest = useCallback(
    (request: { url: string }) => {
      if (
        request.url.startsWith(BASE_WEB_URL) ||
        request.url.startsWith("data:")
      ) {
        return true;
      }
      Linking.openURL(request.url);
      return false;
    },
    []
  );

  const sendMessageToWeb = useCallback(
    (message: NativeToWebMessage) => {
      webViewRef.current?.injectJavaScript(toInjectedWebViewScript(message));
    },
    []
  );

  const navigateTo = useCallback(
    (path: string) => {
      sendMessageToWeb({
        type: "NATIVE_NAV_ACTION",
        payload: { path, title: NATIVE_SHELL_TITLE }
      });
      setCurrentPath(path);
    },
    [sendMessageToWeb]
  );

  const sendPickerResult = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled || !result.assets?.[0]) {
        sendMessageToWeb({
          type: "PHOTO_PICKER_RESULT",
          payload: { cancelled: true }
        } as NativeToWebMessage);
        return;
      }
      const asset = result.assets[0];
      const uri = asset.base64
        ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
        : asset.uri;
      sendMessageToWeb({
        type: "PHOTO_PICKER_RESULT",
        payload: { uri }
      } as NativeToWebMessage);
    },
    [sendMessageToWeb]
  );

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true
  };

  const launchCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    sendPickerResult(result);
  }, [sendPickerResult]);

  const launchLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    sendPickerResult(result);
  }, [sendPickerResult]);

  const handlePhotoPickerRequest = useCallback(() => {
    Alert.alert("Change Photo", "Choose a source", [
      { text: "Camera", onPress: launchCamera },
      { text: "Photo Library", onPress: launchLibrary },
      { text: "Cancel", style: "cancel" }
    ]);
  }, [launchCamera, launchLibrary]);

  const onWebMessage = useCallback((event: WebViewMessageEvent) => {
    const parsed = parseBridgeMessage(event.nativeEvent.data);
    if (!parsed) return;

    const now = Date.now();
    const last = messageTimestamps.current[parsed.type] ?? 0;
    if (now - last < 50) return;
    messageTimestamps.current[parsed.type] = now;

    switch (parsed.type) {
      case "WEB_NAV_STATE":
        setCurrentPath(parsed.payload.path);
        break;
      case "COUNTER_ACTION":
        setCount((prev) => prev + parsed.payload.delta);
        break;
      case "DETAIL_REQUEST":
        setDetailItem(parsed.payload);
        break;
      case "PHOTO_PICKER_REQUEST":
        handlePhotoPickerRequest();
        break;
    }
  }, [handlePhotoPickerRequest]);

  useEffect(() => {
    sendMessageToWeb({ type: "COUNTER_SYNC", payload: { count } });
  }, [count, sendMessageToWeb]);

  useEffect(() => {
    if (prevCount.current !== count) {
      prevCount.current = count;
      badgeScale.setValue(1.35);
      Animated.spring(badgeScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 300
      }).start();
    }
  }, [count, badgeScale]);

  const injectedBeforeLoad = useMemo(() => {
    const msg: NativeContextMessage = {
      type: "NATIVE_CONTEXT",
      payload: { platform: "native", source: "expo" }
    };
    return toInjectedWebViewScript(msg);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.topBar}>
          <View style={styles.topBarSide} />
          <Text numberOfLines={1} style={styles.topBarTitle}>
            {NATIVE_SHELL_TITLE}
          </Text>
          <View style={[styles.topBarSide, styles.topBarRight]}>
            <Pressable
              accessibilityLabel={`Counter: ${count}`}
              hitSlop={8}
              onPress={() => navigateTo("/")}
              style={({ pressed }) => [
                styles.counterBadge,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Animated.Text
                style={[
                  styles.counterValue,
                  { transform: [{ scale: badgeScale }] }
                ]}
              >
                {count}
              </Animated.Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <WebView
            injectedJavaScriptBeforeContentLoaded={injectedBeforeLoad}
            onMessage={onWebMessage}
            onShouldStartLoadWithRequest={handleNavigationRequest}
            ref={webViewRef}
            source={{ headers: { "x-native-app": "1" }, uri: initialUri }}
            style={styles.webView}
          />
          {currentPath === "/notifications" && (
            <View style={StyleSheet.absoluteFill}>
              <NotificationsScreen />
            </View>
          )}
        </View>

        <SafeAreaView edges={["bottom"]} style={styles.tabBarSafe}>
          <TabBar currentPath={currentPath} onSelect={navigateTo} tabs={appNavItems} />
        </SafeAreaView>
      </SafeAreaView>

      <DetailDrawer baseUrl={BASE_WEB_URL} item={detailItem} onClose={clearDetailItem} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: color.background, flex: 1 },
  topBar: {
    alignItems: "center",
    backgroundColor: color.background,
    borderBottomColor: color.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 48,
    paddingHorizontal: 16
  },
  topBarSide: { width: 40 },
  topBarRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "flex-end",
    width: "auto"
  },
  topBarTitle: {
    color: color.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center"
  },
  counterBadge: {
    alignItems: "center",
    backgroundColor: color.brand,
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 5
  },
  counterValue: {
    color: "#000",
    fontSize: 11,
    fontWeight: "700"
  },
  content: { flex: 1 },
  webView: { flex: 1 },
  tabBarSafe: { backgroundColor: color.background }
});
