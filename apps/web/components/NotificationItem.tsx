"use client";

import { useState } from "react";

type NotificationItemProps = {
  title: string;
  body: string;
  time: string;
};

export function NotificationItem({ title, body, time }: NotificationItemProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors">
      <div className="mt-0.5 h-2 w-2 shrink-0 self-start rounded-full bg-brand" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-0.5 text-sm text-neutral-500">{body}</p>
        <p className="mt-1 text-xs text-neutral-400">{time}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex items-center gap-1.5 rounded-md bg-neutral-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-600"
        >
          Archive
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
