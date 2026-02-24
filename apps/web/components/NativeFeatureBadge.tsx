"use client";

import { useBridge } from "@repo/bridge/web";

type Props = {
  label: string;
  description: string;
};

export function NativeFeatureBadge({ label, description }: Props) {
  const { isNativeApp } = useBridge();
  if (!isNativeApp) return null;

  return (
    <div className="rounded-xl bg-neutral-900 p-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
          Native
        </span>
        <span className="text-xs font-medium text-white">{label}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
        {description}
      </p>
    </div>
  );
}
