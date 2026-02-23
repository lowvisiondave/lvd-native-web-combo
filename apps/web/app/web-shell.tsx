import type { ReactNode } from "react";
import { WEB_SHELL_TITLE, appNavItems } from "@repo/app-config/app-routes";
import { WebBridgeProvider } from "@repo/bridge/web";
import { TopNav } from "../components/TopNav";

export function WebShell({ children }: { children: ReactNode }) {
  return (
    <WebBridgeProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <div data-web-nav>
          <TopNav
            links={appNavItems.map((item) => ({
              href: item.path,
              label: item.label
            }))}
            title={WEB_SHELL_TITLE}
          />
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8 md:py-12">
          {children}
        </main>

        <footer
          data-web-footer
          className="border-t border-neutral-200 bg-white"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 text-xs text-neutral-400 md:px-8">
            <span className="font-semibold">{WEB_SHELL_TITLE}</span>
            <span>&copy; 2026</span>
          </div>
        </footer>
      </div>
    </WebBridgeProvider>
  );
}
