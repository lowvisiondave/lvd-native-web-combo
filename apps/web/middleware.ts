import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const device =
    request.headers.get("x-native-app") === "1" ? "native" : "web";
  const { pathname } = request.nextUrl;

  const url = request.nextUrl.clone();
  url.pathname = `/${device}${pathname === "/" ? "" : pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/((?!_next|api|web|native|.*\\.).*)"
};
