import { designTokens } from "@repo/app-config/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  LayoutAnimation,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const { color } = designTokens;
const SCREEN_WIDTH = Dimensions.get("window").width;
const ACTION_WIDTH = 80;

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
};

const initialNotifications: Notification[] = [
  { id: "1", title: "Notification 1", body: "This is a sample notification.", time: "Just now" },
  { id: "2", title: "Notification 2", body: "This is another notification.", time: "2m ago" },
  { id: "3", title: "Notification 3", body: "One more for good measure.", time: "1h ago" }
];

export function NotificationsScreen() {
  const [items, setItems] = useState(initialNotifications);
  const [selected, setSelected] = useState<Notification | null>(null);

  const handleRemove = useCallback((id: string) => {
    LayoutAnimation.configureNext({
      duration: 250,
      update: { type: LayoutAnimation.Types.easeInEaseOut }
    });
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.badgeCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>Native</Text>
          </View>
          <Text style={styles.badgeLabel}>Full Native Screen</Text>
        </View>
        <Text style={styles.badgeDesc}>
          This entire tab is a React Native view overlaying the WebView. Swipe gestures, animations, and modals are all native.
        </Text>
      </View>
      <Text style={styles.hint}>Swipe to manage</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>All caught up!</Text>
        </View>
      ) : (
        items.map((item) => (
          <SwipeableNotification
            key={item.id}
            item={item}
            onArchive={handleRemove}
            onDelete={handleRemove}
            onTap={setSelected}
          />
        ))
      )}

      <NotificationDetail item={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

function NotificationDetail({
  item,
  onClose
}: {
  item: Notification | null;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  useEffect(() => {
    if (item) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200
      }).start();
    } else {
      translateY.setValue(Dimensions.get("window").height);
    }
  }, [item, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: Dimensions.get("window").height,
      duration: 250,
      useNativeDriver: true
    }).start(() => onClose());
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={item !== null}
      onRequestClose={handleClose}
    >
      <View style={detailStyles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={{ transform: [{ translateY }] }}>
          {item && (
            <SafeAreaView edges={["bottom"]} style={detailStyles.sheet}>
              <View style={detailStyles.handle} />
              <View style={detailStyles.header}>
                <View style={detailStyles.dot} />
                <Text style={detailStyles.time}>{item.time}</Text>
              </View>
              <Text style={detailStyles.title}>{item.title}</Text>
              <Text style={detailStyles.body}>{item.body}</Text>
              <Text style={detailStyles.extra}>
                This detail view is rendered entirely in native, triggered by
                tapping a notification in the list above.
              </Text>
              <Pressable onPress={handleClose} style={detailStyles.button}>
                <Text style={detailStyles.buttonText}>Close</Text>
              </Pressable>
            </SafeAreaView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

type OpenSide = "none" | "left" | "right";

function SwipeableNotification({
  item,
  onArchive,
  onDelete,
  onTap
}: {
  item: Notification;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onTap: (item: Notification) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const openSide = useRef<OpenSide>("none");

  const snapTo = useCallback(
    (toValue: number) => {
      if (toValue < 0) openSide.current = "left";
      else if (toValue > 0) openSide.current = "right";
      else openSide.current = "none";

      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        tension: 68,
        friction: 12
      }).start();
    },
    [translateX]
  );

  const archive = useCallback(() => {
    Animated.timing(translateX, {
      toValue: SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true
    }).start(() => onArchive(item.id));
  }, [translateX, onArchive, item.id]);

  const deleteDismiss = useCallback(() => {
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true
    }).start(() => onDelete(item.id));
  }, [translateX, onDelete, item.id]);

  const confirmDelete = useCallback(() => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel", onPress: () => snapTo(0) },
      { text: "Delete", style: "destructive", onPress: deleteDismiss }
    ]);
  }, [snapTo, deleteDismiss]);

  const didMove = useRef(false);

  const handleTap = useCallback(() => {
    if (openSide.current !== "none") {
      snapTo(0);
    } else {
      onTap(item);
    }
  }, [snapTo, onTap, item]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy * 1.5),
      onPanResponderGrant: () => {
        didMove.current = false;
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) > 5) didMove.current = true;

        let base = 0;
        if (openSide.current === "left") base = -ACTION_WIDTH;
        else if (openSide.current === "right") base = ACTION_WIDTH;

        const x = Math.max(
          -SCREEN_WIDTH * 0.5,
          Math.min(SCREEN_WIDTH * 0.5, base + g.dx)
        );
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        if (!didMove.current) {
          handleTap();
          return;
        }

        let base = 0;
        if (openSide.current === "left") base = -ACTION_WIDTH;
        else if (openSide.current === "right") base = ACTION_WIDTH;

        const finalX = base + g.dx;

        if (g.vx < -1.2 || finalX < -ACTION_WIDTH * 0.5) {
          snapTo(-ACTION_WIDTH);
        } else if (g.vx > 1.2 || finalX > ACTION_WIDTH * 0.5) {
          snapTo(ACTION_WIDTH);
        } else {
          snapTo(0);
        }
      }
    })
  ).current;

  const deleteScale = translateX.interpolate({
    inputRange: [-ACTION_WIDTH * 1.5, -ACTION_WIDTH, -ACTION_WIDTH * 0.5, 0],
    outputRange: [1.15, 1, 0.6, 0.4],
    extrapolate: "clamp"
  });
  const deleteOpacity = translateX.interpolate({
    inputRange: [-ACTION_WIDTH, -20, 0],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp"
  });

  const archiveScale = translateX.interpolate({
    inputRange: [0, ACTION_WIDTH * 0.5, ACTION_WIDTH, ACTION_WIDTH * 1.5],
    outputRange: [0.4, 0.6, 1, 1.15],
    extrapolate: "clamp"
  });
  const archiveOpacity = translateX.interpolate({
    inputRange: [0, 20, ACTION_WIDTH],
    outputRange: [0, 0.3, 1],
    extrapolate: "clamp"
  });

  return (
    <View style={styles.rowWrapper}>
      <View style={[styles.actionEdge, styles.archiveSide]}>
        <Pressable onPress={archive} style={styles.actionButton}>
          <Animated.View
            style={{
              alignItems: "center",
              opacity: archiveOpacity,
              transform: [{ scale: archiveScale }]
            }}
          >
            <Ionicons color="#fff" name="archive-outline" size={20} />
            <Text style={styles.actionLabel}>Archive</Text>
          </Animated.View>
        </Pressable>
      </View>
      <View style={[styles.actionEdge, styles.deleteSide]}>
        <Pressable onPress={confirmDelete} style={styles.actionButton}>
          <Animated.View
            style={{
              alignItems: "center",
              opacity: deleteOpacity,
              transform: [{ scale: deleteScale }]
            }}
          >
            <Ionicons color="#fff" name="trash-outline" size={20} />
            <Text style={styles.actionLabel}>Delete</Text>
          </Animated.View>
        </Pressable>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.item, { transform: [{ translateX }] }]}
      >
        <View style={styles.dot} />
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Ionicons
          color="#ccc"
          name="chevron-forward"
          size={16}
          style={styles.chevron}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  badgeCard: {
    backgroundColor: "#171717",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12
  },
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  badgePill: {
    backgroundColor: color.brand,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgePillText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  badgeLabel: { color: "#fff", fontSize: 12, fontWeight: "500" },
  badgeDesc: {
    color: "#a3a3a3",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6
  },
  hint: {
    color: "#bbb",
    fontSize: 11,
    marginBottom: 8,
    marginLeft: 16
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingTop: 60
  },
  emptyText: { color: "#999", fontSize: 15 },
  rowWrapper: {
    overflow: "hidden"
  },
  actionEdge: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: ACTION_WIDTH
  },
  archiveSide: {
    backgroundColor: "#6b7280",
    left: 0
  },
  deleteSide: {
    backgroundColor: "#ef4444",
    right: 0
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: ACTION_WIDTH
  },
  actionLabel: { color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 2 },
  item: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  dot: {
    backgroundColor: color.brand,
    borderRadius: 4,
    height: 8,
    marginRight: 12,
    width: 8
  },
  content: { flex: 1 },
  chevron: { marginLeft: 8 },
  title: { color: "#111", fontSize: 15, fontWeight: "600" },
  body: { color: "#666", fontSize: 13, marginTop: 2 },
  time: { color: "#999", fontSize: 12, marginTop: 4 }
});

const detailStyles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "flex-end"
  },
  sheet: {
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
    marginBottom: 20,
    width: 36
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  dot: {
    backgroundColor: color.brand,
    borderRadius: 4,
    height: 8,
    width: 8
  },
  time: { color: "#999", fontSize: 12 },
  title: { color: "#111", fontSize: 20, fontWeight: "700" },
  body: { color: "#444", fontSize: 15, lineHeight: 22, marginTop: 8 },
  extra: { color: "#999", fontSize: 13, lineHeight: 18, marginTop: 16 },
  button: {
    alignItems: "center",
    backgroundColor: color.brand,
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 14
  },
  buttonText: { color: "#000", fontSize: 15, fontWeight: "700" }
});
