import { Counter } from "../../components/Counter";
import { NativeFeatureBadge } from "../../components/NativeFeatureBadge";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Home</h1>
      <p className="mt-2 text-sm text-neutral-500">Welcome to My App.</p>
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Shared Counter
        </h2>
        <Counter />
        <div className="mt-4">
          <NativeFeatureBadge
            label="Counter Sync"
            description="This counter is owned by the native shell and synced to the web layer via bridge messages. The badge in the top bar also reflects the current count."
          />
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          This counter syncs between native and web via the bridge.
        </p>
      </section>
    </div>
  );
}
