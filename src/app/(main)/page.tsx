import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "Live Claude Pro/Max Usage in Your macOS Menu Bar",
  description:
    "Free, open-source macOS menu bar app for live Claude Pro/Max usage: rolling 5-hour, weekly, and pay-as-you-go balance, matching claude.ai/settings/usage to the integer. One brew command, no cookie paste.",
};

export default function Home() {
  return <HomeClient />;
}
