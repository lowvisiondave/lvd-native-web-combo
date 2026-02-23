"use client";

import { serializeBridgeMessage } from "@repo/bridge";
import { useBridge } from "@repo/bridge/web";
import Image from "next/image";
import { useState } from "react";

const items = [
  { label: "Mountains", src: "photo-1506905925346-21bda4d32df4" },
  { label: "Ocean", src: "photo-1505118380757-91f5f5632de0" },
  { label: "Forest", src: "photo-1448375240586-882707db888b" },
  { label: "Desert", src: "photo-1509316785289-025f5b846b35" },
  { label: "City", src: "photo-1449824913935-59a10b8d2000" },
  { label: "Night Sky", src: "photo-1519681393784-d120267933ba" }
];

type Item = (typeof items)[number];

const unsplashUrl = (src: string, w: number, h: number) =>
  `https://images.unsplash.com/${src}?w=${w}&h=${h}&fit=crop&auto=format`;

export function ExploreGrid() {
  const { isNativeApp, postMessageToNative } = useBridge();
  const [modalItem, setModalItem] = useState<Item | null>(null);

  const handleTap = (item: Item) => {
    if (isNativeApp) {
      postMessageToNative(
        serializeBridgeMessage({
          type: "DETAIL_REQUEST",
          payload: { id: item.src, label: item.label }
        })
      );
    } else {
      setModalItem(item);
    }
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleTap(item)}
            className="relative overflow-hidden rounded-xl text-left"
          >
            <Image
              src={unsplashUrl(item.src, 400, 400)}
              alt={item.label}
              width={400}
              height={400}
              className="block w-full aspect-square object-cover"
              sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8">
              <span className="text-sm font-semibold text-white">
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {modalItem && (
        <dialog
          open
          aria-modal="true"
          aria-label={`${modalItem.label} detail`}
          className="fixed inset-0 z-50 m-0 flex h-full w-full items-end bg-black/40 sm:items-center sm:justify-center"
          onClick={() => setModalItem(null)}
          onKeyDown={(e) => e.key === "Escape" && setModalItem(null)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-neutral-100 aspect-[4/3]">
              <Image
                src={unsplashUrl(modalItem.src, 800, 600)}
                alt={modalItem.label}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 32rem, 100vw"
              />
            </div>
            <h3 className="mt-3 text-lg font-bold text-neutral-900">
              {modalItem.label}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Viewing detail on web.
            </p>
            <button
              type="button"
              onClick={() => setModalItem(null)}
              className="mt-4 w-full rounded-xl bg-neutral-100 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              Close
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
