"use client";

import { fromNativeRoute } from "@repo/app-config/native-route-paths";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };
type TopNavProps = { title: string; links: NavLink[] };

export function TopNav({ title, links }: TopNavProps) {
  const pathname = usePathname();
  const currentPath = fromNativeRoute(pathname ?? "/");

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-black">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="text-base font-bold text-white">
          {title}
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                currentPath === link.href
                  ? "text-brand"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
