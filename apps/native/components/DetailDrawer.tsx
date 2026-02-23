import { designTokens } from "@repo/app-config/tokens";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { color } = designTokens;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_WIDTH = SCREEN_WIDTH - 40;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;

type DetailDrawerProps = {
  baseUrl: string;
  item: { id: string; label: string } | null;
  onClose: () => void;
};

export function DetailDrawer({ baseUrl, item, onClose }: DetailDrawerProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const lastItem = useRef<{ id: string; label: string } | null>(null);

  if (item) lastItem.current = item;

  const isVisible = item !== null || closing;

  useEffect(() => {
    if (item) {
      setClosing(false);
      setImageLoaded(false);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200
      }).start();
    }
  }, [item, translateY]);

  const handleClose = useCallback(() => {
    setClosing(true);
    onClose();
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setClosing(false);
        lastItem.current = null;
      }
    });
  }, [onClose, translateY]);

  useEffect(() => {
    if (!isVisible || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  const displayItem = lastItem.current;
  if (!displayItem) return null;

  const imageUri = `${baseUrl}/_next/image?url=${encodeURIComponent(`https://images.unsplash.com/${displayItem.id}?w=${Math.round(IMAGE_WIDTH * 2)}&h=${Math.round(IMAGE_HEIGHT * 2)}&fit=crop&auto=format`)}&w=828&q=75`;

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp"
  });

  return (
    <View style={styles.fullscreen} pointerEvents={closing ? "none" : "auto"}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={{ transform: [{ translateY }], width: "100%" }}>
          <SafeAreaView edges={["bottom"]} style={styles.drawer}>
            <View style={styles.handle} />
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Native Drawer</Text>
              </View>
            </View>
            <View style={styles.imageContainer}>
              {!imageLoaded && (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator color={color.textMuted} />
                </View>
              )}
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                onLoad={() => setImageLoaded(true)}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>{displayItem.label}</Text>
            <Text style={styles.body}>
              Tapped in web, displayed natively.
            </Text>
            <Pressable onPress={handleClose} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end"
  },
  drawer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#ddd",
    borderRadius: 2,
    height: 4,
    marginBottom: 16,
    width: 36
  },
  badgeRow: { marginBottom: 12 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: color.brand,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgeText: { color: "#000", fontSize: 10, fontWeight: "700" },
  imageContainer: {
    borderRadius: 12,
    height: IMAGE_HEIGHT,
    overflow: "hidden",
    width: IMAGE_WIDTH
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    justifyContent: "center"
  },
  image: {
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH
  },
  title: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12
  },
  body: { color: "#666", fontSize: 14, marginTop: 4 },
  button: {
    alignItems: "center",
    backgroundColor: color.brand,
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 12
  },
  buttonText: { color: "#000", fontWeight: "700" }
});
