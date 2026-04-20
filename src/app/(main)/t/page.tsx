import Link from "next/link";
import type { Metadata } from "next";
import { discoverGuides } from "@m13v/seo-components/server";

export const metadata: Metadata = {
  title: "ClaudeMeter Guides",
  description:
    "Guides on surviving Claude Pro and Max plan limits: rolling 5-hour windows, weekly quotas, extra-usage pricing, menu bar workflow tips, and Claude Code patterns.",
};

export default function GuideIndexPage() {
  const guides = discoverGuides();
  const hasGuides = guides.length > 0;

  return (
    <>
      <section className="bg-primary-dark text-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Guides</h1>
          <p className="text-lg text-gray-300">
            Short, practical posts on surviving Claude plan limits, weekly quotas, and the 5-hour window.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {hasGuides ? (
            <div className="grid md:grid-cols-2 gap-6">
              {guides.map((g) => (
                <Link
                  key={g.slug}
                  href={g.href}
                  className="block rounded-lg border border-gray-200 p-6 hover:border-primary transition-colors"
                >
                  <h2 className="font-heading text-xl font-bold text-primary mb-2">{g.title}</h2>
                  <p className="text-gray-700 text-sm leading-relaxed">{g.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-gray-700 mb-2">Guides ship here soon.</p>
              <p className="text-sm text-gray-500">
                In the meantime, the{" "}
                <Link href="/how-it-works" className="text-cta hover:underline">
                  how-it-works
                </Link>{" "}
                page and{" "}
                <Link href="/faq" className="text-cta hover:underline">
                  FAQ
                </Link>{" "}
                cover the basics.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
