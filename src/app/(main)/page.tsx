import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "Live Claude Pro/Max Usage in Your macOS Menu Bar",
  description:
    "ClaudeMeter shows your live Anthropic Claude Pro or Max plan usage, rolling 5-hour window and weekly quota, in the macOS menu bar. Free, MIT, no telemetry.",
};

export default function Home() {
  return <HomeClient />;
}
