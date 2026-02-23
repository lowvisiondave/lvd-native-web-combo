import { NativeFeatureBadge } from "../../../components/NativeFeatureBadge";
import { NotificationItem } from "../../../components/NotificationItem";

const notifications = [
  { id: "n1", title: "Notification 1", body: "This is a sample notification.", time: "Just now" },
  { id: "n2", title: "Notification 2", body: "This is another notification.", time: "2m ago" },
  { id: "n3", title: "Notification 3", body: "One more for good measure.", time: "1h ago" }
];

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Your recent notifications.
      </p>
      <div className="mt-4">
        <NativeFeatureBadge
          label="Full Native Screen"
          description="This entire tab is replaced by a React Native screen that overlays the WebView. It features swipe-to-archive/delete gestures, layout animations, and a native detail modal — none of which use the web layer."
        />
      </div>
      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            title={n.title}
            body={n.body}
            time={n.time}
          />
        ))}
      </div>
    </div>
  );
}
