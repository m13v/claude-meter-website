import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsletterSignup } from "@m13v/seo-components";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <NewsletterSignup
        description="Get the occasional post on surviving Claude plan limits, weekly quotas, and the 5-hour window. No spam."
        buttonLabel="Subscribe"
        successMessage="Subscribed. Check your inbox."
      />
      <Footer />
    </>
  );
}
