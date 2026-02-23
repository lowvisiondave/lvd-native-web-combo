"use client";

import { serializeBridgeMessage } from "@repo/bridge";
import { useBridge } from "@repo/bridge/web";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react";
import { NativeFeatureBadge } from "./NativeFeatureBadge";

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);
  return isTouch;
}

type Props = {
  name: string;
  email: string;
  initials: string;
};

export function AccountProfile({ name, email, initials }: Props) {
  const { isNativeApp, postMessageToNative, onPhotoPickerResult } =
    useBridge();
  const isTouchDevice = useIsTouchDevice();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setAvatarSrc(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  useEffect(() => {
    if (!isNativeApp) return;
    return onPhotoPickerResult((result) => {
      if ("uri" in result) {
        setAvatarSrc(result.uri);
      }
    });
  }, [isNativeApp, onPhotoPickerResult]);

  const handleChangePhoto = () => {
    if (isNativeApp) {
      postMessageToNative(
        serializeBridgeMessage({
          type: "PHOTO_PICKER_REQUEST",
          payload: {}
        })
      );
    } else {
      fileInputRef.current?.click();
    }
  };

  const platformLabel = isNativeApp
    ? "Native App"
    : isTouchDevice
      ? "Mobile Web"
      : "Desktop Web";

  const platformHint = isNativeApp
    ? "Opens native photo picker via bridge"
    : isTouchDevice
      ? "Opens camera roll via mobile browser"
      : "Pick a file or drag & drop";

  return (
    <div className="mt-6 space-y-5">
      {/* Avatar + info */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleChangePhoto}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full transition-all ${
            isDragging
              ? "ring-4 ring-brand ring-offset-2 scale-105"
              : "hover:ring-2 hover:ring-neutral-300 hover:ring-offset-2"
          } ${avatarSrc ? "" : "bg-brand"}`}
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-bold text-black">{initials}</span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <title>Change photo</title>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </button>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-neutral-900 truncate">
            {name}
          </p>
          <p className="text-sm text-neutral-500 truncate">{email}</p>
          <button
            type="button"
            onClick={handleChangePhoto}
            className="mt-1 text-xs font-medium text-brand hover:underline"
          >
            Change photo
          </button>
        </div>
      </div>

      <NativeFeatureBadge
        label="Photo Picker"
        description="Tapping \u201CChange photo\u201D sends a bridge message to the native shell, which presents a native action sheet with Camera and Photo Library options via expo-image-picker."
      />

      {!isNativeApp && (
        <div className="rounded-xl bg-neutral-50 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-neutral-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              {platformLabel}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">{platformHint}</p>
          {!isTouchDevice && (
            <p className="mt-1 text-xs text-neutral-400">
              Try dragging an image onto the avatar above.
            </p>
          )}
        </div>
      )}

      {/* Hidden file input for web contexts */}
      {!isNativeApp && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      )}
    </div>
  );
}
