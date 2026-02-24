export type AppRoute = {
  path: string;
  title: string;
};

export const WEB_SHELL_TITLE = "My App";
export const NATIVE_SHELL_TITLE = "My App";

export const appRoutes: AppRoute[] = [
  { path: "/", title: "Home" },
  { path: "/explore", title: "Explore" },
  { path: "/notifications", title: "Notifications" },
  { path: "/account", title: "Account" }
];

export type AppNavItem = {
  path: string;
  label: string;
  icon: "home" | "compass" | "notifications" | "person";
};

export const appNavItems: AppNavItem[] = [
  { path: "/", label: "Home", icon: "home" },
  { path: "/explore", label: "Explore", icon: "compass" },
  { path: "/notifications", label: "Notifications", icon: "notifications" },
  { path: "/account", label: "Account", icon: "person" }
];

