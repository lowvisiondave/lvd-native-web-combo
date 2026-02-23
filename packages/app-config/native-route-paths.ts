export function normalizeAppPath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/\/{2,}/g, "/");
}

export function toNativeRoute(path: string): string {
  const normalizedPath = normalizeAppPath(path);
  return normalizedPath === "/" ? "/native" : `/native${normalizedPath}`;
}

export function fromNativeRoute(path: string): string {
  const normalizedPath = normalizeAppPath(path);
  const stripped = normalizedPath.replace(/^\/native(?=\/|$)/, "");
  return stripped || "/";
}
