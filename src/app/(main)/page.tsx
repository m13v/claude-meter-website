import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "Live Claude Pro/Max Usage in Your macOS Menu Bar",
  description:
    "ClaudeMeter shows the server-truth Claude Pro/Max quota (5-hour window, weekly, pay-as-you-go) live in the macOS menu bar. One brew command, no cookie paste, MIT, no telemetry.",
};

export default function Home() {
  return <HomeClient />;
}
