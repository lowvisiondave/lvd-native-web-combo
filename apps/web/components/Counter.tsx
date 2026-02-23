"use client";

import { useBridge } from "@repo/bridge/web";
import { useEffect, useRef, useState } from "react";

export function Counter() {
  const { isNativeApp, count: bridgeCount, updateCounter } = useBridge();
  const [localCount, setLocalCount] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const prevBridgeCount = useRef(bridgeCount);

  const count = isNativeApp ? bridgeCount : localCount;

  useEffect(() => {
    if (bridgeCount !== prevBridgeCount.current) {
      prevBridgeCount.current = bridgeCount;
      setPopKey((k) => k + 1);
    }
  });

  const handleUpdate = (delta: number) => {
    if (isNativeApp) {
      updateCounter(delta);
    } else {
      setLocalCount((c) => c + delta);
      setPopKey((k) => k + 1);
    }
  };

  return (
    <div className="mt-3 inline-flex items-center gap-4 rounded-2xl bg-neutral-50 px-5 py-4">
      <button
        type="button"
        onClick={() => handleUpdate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-lg font-bold text-neutral-600 transition-all hover:bg-neutral-300 active:scale-90 active:bg-neutral-300"
      >
        &minus;
      </button>
      <span
        key={popKey}
        className="w-12 text-center text-3xl font-bold tabular-nums text-neutral-900 counter-pop"
      >
        {count}
      </span>
      <button
        type="button"
        onClick={() => handleUpdate(1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-black transition-all hover:bg-yellow-400 active:scale-90 active:bg-yellow-500"
      >
        +
      </button>
    </div>
  );
}
