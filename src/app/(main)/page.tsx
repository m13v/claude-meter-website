import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "Live Claude Pro/Max Usage in Your macOS Menu Bar",
  description:
    "See your Claude Pro/Max quota live in the macOS menu bar: rolling 5-hour, weekly, and pay-as-you-go balance, with the same numbers claude.ai/settings/usage shows. One brew command, no cookie paste.",
};

export default function Home() {
  return <HomeClient />;
}
