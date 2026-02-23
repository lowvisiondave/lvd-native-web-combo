import { ExploreGrid } from "../../../components/ExploreGrid";
import { NativeFeatureBadge } from "../../../components/NativeFeatureBadge";

export default function ExplorePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Explore</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Browse featured content.
      </p>
      <div className="mt-4">
        <NativeFeatureBadge
          label="Detail Drawer"
          description="Tapping an image sends a bridge message to the native shell, which opens a React Native modal drawer with native image loading and gestures."
        />
      </div>
      <ExploreGrid />
    </div>
  );
}
