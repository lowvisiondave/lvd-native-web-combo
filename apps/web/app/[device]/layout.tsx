import { NativeShell } from "../native-shell";
import { WebShell } from "../web-shell";

export default async function DeviceLayout({
  children,
  params
}: LayoutProps<"/[device]">) {
  const { device } = await params;
  const Shell = device === "native" ? NativeShell : WebShell;

  return <Shell>{children}</Shell>;
}
