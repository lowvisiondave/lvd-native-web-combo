"use client";

import { NATIVE_SHELL_TITLE, appRoutes } from "@repo/app-config/app-routes";
import { BridgeProvider } from "@repo/bridge/web";
import { fromNativeRoute, toNativeRoute } from "@repo/app-config/native-route-paths";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

const validPaths = new Set(appRoutes.map((r) => r.path));

export function NativeShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const appPath = fromNativeRoute(pathname ?? "/");

  const pushPath = useCallback(
    (nextPath: string) => {
      if (!validPaths.has(nextPath)) return;
      router.push(toNativeRoute(nextPath));
    },
    [router]
  );

  return (
    <BridgeProvider
      onNativeNavigate={pushPath}
      path={appPath}
      title={NATIVE_SHELL_TITLE}
      webNavVisible={false}
    >
      <div className="px-4 py-5">{children}</div>
    </BridgeProvider>
  );
}
