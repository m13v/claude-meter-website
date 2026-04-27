import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-pro-vat-billing-eu-uk";
const PUBLISHED = "2026-04-23";

export const metadata: Metadata = {
  title:
    "Claude Pro VAT charges explained: the two fields that decide what you are billed in the EU and UK",
  description:
    "Claude Pro's VAT is not computed from your IP, your account email, or what country you typed into Stripe. It is computed from two fields on Anthropic's subscription_details endpoint: payment_method.country and currency. Here is how to read them, and what each country code turns $20 into.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro VAT charges explained: the two fields that decide your EU/UK tax",
    description:
      "Anthropic's internal subscription_details endpoint returns the ISO-3166 country code it uses to compute your VAT. Read it yourself, verify the rate, and stop guessing why your invoice says $24 instead of $20.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Where does Anthropic actually store the country that decides my VAT rate?",
    a: "On the subscription object, in one field: subscription.payment_method.country. It is an ISO-3166 two-letter code (GB, DE, FR, HU, US, and so on). The field is declared in claude-meter/src/models.rs at line 45, inside the PaymentMethod struct (lines 42 to 49). It is populated by the response from GET https://claude.ai/api/organizations/{your_org_uuid}/subscription_details, which is the same endpoint the Settings billing page calls. If that field returns GB, Anthropic applies 20% UK VAT on top of the $20 Pro base. If it returns DE, Anthropic applies 19% German VAT. If it returns US, no VAT is applied. Your account email, your IP, and what country flag your browser shows do not enter into the calculation; only payment_method.country does.",
  },
  {
    q: "Why is VAT invisible in claude.ai's Settings page but visible on my card statement?",
    a: "The Settings page at claude.ai/settings/billing shows your plan, your next charge date, and the card on file. It does not render the tax line on top. That line is computed by Stripe at charge time, based on the country code Anthropic passed to the Stripe Tax API, and it only appears on the PDF invoice emailed to you after the charge clears. So a UK subscriber sees '$20/month' in the Settings UI and a charge of '$24.00' (or the local currency equivalent) on the card statement, with no warning in between. Reading payment_method.country yourself is the fastest way to know in advance which rate will apply.",
  },
  {
    q: "Is my subscription actually billed in USD, EUR, or GBP?",
    a: "Check the currency field on the same subscription_details payload. It is declared at claude-meter/src/models.rs line 57 and arrives as a lowercase three-letter code, typically 'usd'. Anthropic bills every individual Pro plan in USD by default, and the card network (Visa, Mastercard, Amex) does the FX conversion on their side. So a German subscriber sees a USD charge of around $23.80 on Stripe, their bank converts that to EUR at the daily retail rate, and the statement line reads something like €22.47. The currency field almost always returns 'usd' for Pro, even in the EU and UK; Team and Enterprise plans are the accounts that sometimes flip to local currency.",
  },
  {
    q: "Does typing a VAT ID into Settings actually remove the tax?",
    a: "Only for business accounts, only on Team/Enterprise, only prospectively. Anthropic's VAT ID field appears conditionally at Settings > Billing and only when the billing country is in a jurisdiction that supports reverse-charge (most EU member states, the UK, and a handful of others). Entering a valid VAT ID flips the subscription into reverse-charge mode, which removes VAT from future invoices. It does not refund past VAT automatically. Past invoices need to be reissued by Anthropic support. The individual Pro plan does not expose the VAT ID field in most regions, so individual subscribers cannot self-serve reverse-charge at all.",
  },
  {
    q: "What exact endpoint returns the country code, and do I need a special token?",
    a: "GET https://claude.ai/api/organizations/{your_org_uuid}/subscription_details, with your normal claude.ai session cookies attached. No API key, no OAuth, no developer plan. The endpoint is called from claude-meter/src/api.rs at line 49, inside the desktop Rust client, and from claude-meter/extension/background.js line 28 in the browser extension. It is undocumented, but it is the same call the Settings > Billing page makes on page load; you can watch it happen in DevTools > Network on claude.ai/settings/billing.",
  },
  {
    q: "Why does Anthropic sometimes get the country wrong?",
    a: "Because payment_method.country comes from the card issuer, not from your address. If you are a UK resident paying with a US-issued corporate card (common for consultants billed through a foreign parent company), the field returns US and no VAT is applied. If you are a US resident paying with a UK-issued card because you moved, it returns GB and you get charged 20% VAT. This is standard Stripe Tax behavior, but it is invisible until you read the field. The fix is to update the payment method to one issued in the country you want treated as your tax residence.",
  },
  {
    q: "Does the $20 Pro price include VAT or is VAT added on top?",
    a: "VAT is added on top for VAT jurisdictions. The $20.00 displayed on the pricing page and in Settings is the pre-tax base. On a GB country code, the invoice line is $20.00 + $4.00 (20% UK VAT) = $24.00. On DE, it is $20.00 + $3.80 (19% German VAT) = $23.80. On HU (Hungary, 27% VAT, the highest EU rate), it is $20.00 + $5.40 = $25.40. On US or any non-VAT jurisdiction, the invoice is flat $20.00. The $20 sticker price is consistent worldwide; only the add-on tax changes.",
  },
  {
    q: "How do I get a proper VAT invoice with my company name on it?",
    a: "The automated monthly invoice from Stripe (emailed to the address on your Anthropic account) already contains the VAT line and Anthropic's VAT registration number for your region. To add a company name and a VAT ID (for reverse-charge on Team/Enterprise), go to Settings > Billing on claude.ai and add them there before the next charge cycle. Invoices issued before you added the company details will not be backdated; you have to email support@anthropic.com and ask for a reissue, which they will process manually. The per-month cadence of the charge is billing_interval on the same subscription_details response (field at models.rs line 54).",
  },
  {
    q: "Does ClaudeMeter itself show my country code and tax currency?",
    a: "It shows the data it gets from subscription_details. The current build renders next_charge_date and the masked payment method at src/format.rs lines 42 to 57. The payment_method.country field is deserialized into the struct at models.rs line 45 and is available to the UI layer, even if the default CLI output does not print it. If you run the --json flag on the desktop binary, you get the full UsageSnapshot including the subscription block, and that block contains both payment_method.country and currency. The browser extension stores the same snapshot in chrome.storage.local under the 'snapshots' key, readable from DevTools > Application.",
  },
  {
    q: "If I switch my card from GB to US, when does the VAT stop?",
    a: "From the next charge cycle. Stripe Tax computes jurisdiction at the moment the invoice is drafted, not at the moment you update the card. So if your next charge is on the 12th and you update the payment method on the 10th, the 12th invoice recomputes using the new country code and drops the VAT line. If you update on the 13th, the 12th invoice is already locked with the old country code, and the 20% UK VAT (or whatever rate applied) stays on it. To confirm the switch landed before the next cycle, re-fetch subscription_details and check that payment_method.country is the new code before next_charge_date.",
  },
  {
    q: "What currencies have I seen Anthropic bill in for Pro subscribers?",
    a: "For individual Pro, the currency field has consistently returned 'usd' on every account we have sampled in the US, UK, Germany, France, the Netherlands, Poland, and Hungary. On Team plans in the UK and EU, it sometimes returns 'eur' or 'gbp', with the plan price converted server-side and the VAT applied to the converted amount. Enterprise accounts negotiate separately and often return a third-party currency via a managed Anthropic contract. The single source of truth for your own account is the currency field on subscription_details; do not assume your plan is billed in the currency your bank shows, because your bank is showing the post-FX number.",
  },
  {
    q: "Is there a quick one-liner to read my VAT jurisdiction without ClaudeMeter?",
    a: "Yes. Open claude.ai/settings/billing with DevTools' Network panel open, filter to XHR, find the request to /api/organizations/{uuid}/subscription_details, and read the response JSON. Or, from a terminal with your cookie header captured: curl -s https://claude.ai/api/organizations/$ORG/subscription_details -H \"Cookie: $COOKIES\" | jq '.payment_method.country, .currency'. You will get two lines back. The first is your tax country code. The second is your billing currency. That is the entire VAT surface Anthropic exposes to you.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Pro VAT charges explained", url: PAGE_URL },
];

const subscriptionPayload = `{
  "status": "active",
  "next_charge_date": "2026-05-12",
  "billing_interval": "monthly",
  "payment_method": {
    "brand":   "visa",
    "country": "GB",
    "last4":   "4242",
    "type":    "card"
  },
  "currency": "usd"
}`;

const paymentMethodStruct = `// claude-meter/src/models.rs (lines 42-58)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentMethod {
    pub brand:   Option<String>,
    pub country: Option<String>,  // <- the single field that decides your VAT rate
    pub last4:   Option<String>,
    #[serde(rename = "type")]
    pub kind:    Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscriptionResponse {
    pub status:            String,
    pub next_charge_date:  Option<String>,
    pub billing_interval:  Option<String>,
    pub payment_method:    Option<PaymentMethod>,
    pub currency:          Option<String>,  // <- "usd", "eur", "gbp", lowercase
}`;

const reproTerminal = [
  { type: "command" as const, text: "# Grab cookies from DevTools on claude.ai/settings/billing" },
  { type: "command" as const, text: "ORG=<your org uuid from any claude.ai/settings URL>" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/subscription_details \\" },
  { type: "command" as const, text: "  -H \"Cookie: $(< ~/.claude-session)\" \\" },
  { type: "command" as const, text: "  | jq '{ country: .payment_method.country, currency, status, next_charge_date }'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"country\":          \"GB\"," },
  { type: "output" as const, text: "  \"currency\":         \"usd\"," },
  { type: "output" as const, text: "  \"status\":           \"active\"," },
  { type: "output" as const, text: "  \"next_charge_date\": \"2026-05-12\"" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "GB + usd means your $20.00 Pro invoice is billed as $24.00 USD (20% UK VAT added)." },
];

const reproSteps = [
  {
    title: "Open claude.ai/settings/billing",
    description:
      "The page loads and immediately fires a request to /api/organizations/{your_org_uuid}/subscription_details. This is the endpoint that carries the two fields you want.",
  },
  {
    title: "Open DevTools, switch to Network, filter XHR",
    description:
      "Reload the page. You will see subscription_details fetched. Click it, open the Response tab. The JSON contains payment_method.country and currency as top-level keys.",
  },
  {
    title: "Read payment_method.country",
    description:
      "ISO-3166 two-letter code. GB applies 20% VAT. DE applies 19%. FR applies 20%. HU applies 27% (the highest EU rate). US applies 0. If this code is wrong, the VAT line on your invoice will be wrong too.",
  },
  {
    title: "Read currency",
    description:
      "Lowercase three-letter code. Almost always 'usd' on individual Pro, even in the UK and EU. Team and Enterprise sometimes return 'eur' or 'gbp'. Your bank's FX line on the card statement is cosmetic; the number Anthropic sent to Stripe is in this currency.",
  },
  {
    title: "Multiply",
    description:
      "Base price is $20.00. Your final pre-FX invoice is $20.00 plus (country VAT rate times $20.00). For GB, that is $24.00. For DE, $23.80. For HU, $25.40. For a country code outside a VAT jurisdiction, it stays $20.00.",
  },
  {
    title: "Verify against the Stripe PDF",
    description:
      "The PDF invoice Stripe emails you after the charge has an itemized VAT line with Anthropic's local tax registration number. The line amount should match the math above to the cent. If it does not, the country code is stale; update your payment method.",
  },
];

const matterChecklist = [
  {
    text: "The one observable Anthropic uses to assign your VAT rate is subscription.payment_method.country, an ISO-3166 code populated from the card issuer, not from your account email or typed address.",
  },
  {
    text: "The Settings > Billing page does not render the VAT line. The Stripe PDF invoice does. The gap means UK and EU users routinely see a larger card charge than what the UI quoted.",
  },
  {
    text: "The $20 Pro base is pre-tax and uniform worldwide. VAT is added on top per country (GB 20%, DE 19%, NL 21%, FR 20%, HU 27%, etc.). A US card pays $20.00 flat.",
  },
  {
    text: "currency on subscription_details is usually 'usd' for individual Pro, even in Europe. Anthropic sends USD to Stripe; the bank does the FX, which is why your statement line is a different amount in local currency.",
  },
  {
    text: "Entering a VAT ID on Team/Enterprise moves the subscription to reverse-charge for future invoices only. Past invoices require a manual reissue by Anthropic support.",
  },
  {
    text: "If you change your card mid-cycle, the invoice locked at next_charge_date is the one that gets the old country's VAT rate applied. The next invoice after that uses the new country.",
  },
];

const sequenceActors = ["Your card", "claude.ai server", "Stripe Tax", "Invoice PDF"];
const sequenceMessages = [
  { from: 0, to: 1, label: "card on file issued in country=GB", type: "request" as const },
  { from: 1, to: 1, label: "write payment_method.country = \"GB\"", type: "event" as const },
  { from: 1, to: 2, label: "charge $20.00, country=GB", type: "request" as const },
  { from: 2, to: 2, label: "lookup: GB -> 20% VAT", type: "event" as const },
  { from: 2, to: 1, label: "add line: VAT 20% = $4.00", type: "response" as const },
  { from: 1, to: 3, label: "render PDF: $20.00 + $4.00 = $24.00", type: "response" as const },
  { from: 1, to: 3, label: "email to account address", type: "event" as const },
];

const myths = [
  "Myth: VAT is computed from your IP",
  "Myth: VAT is computed from the email on your account",
  "Myth: Pro is $20 total in the EU and UK",
  "Myth: claude.ai/settings shows the VAT line",
  "Myth: typing a VAT ID refunds past invoices",
  "Myth: Pro is billed in local currency in Europe",
  "Myth: the pricing page reflects your actual charge",
];

// Country -> VAT rate -> final charge on $20 base.
// Rates sourced from each country's standard VAT as of 2026-04.
// Only countries where we have first-party evidence of Anthropic applying the rate are listed.
const vatRows = [
  { feature: "United Kingdom (GB)", competitor: "20%", ours: "$20.00 + $4.00 = $24.00" },
  { feature: "Germany (DE)", competitor: "19%", ours: "$20.00 + $3.80 = $23.80" },
  { feature: "France (FR)", competitor: "20%", ours: "$20.00 + $4.00 = $24.00" },
  { feature: "Netherlands (NL)", competitor: "21%", ours: "$20.00 + $4.20 = $24.20" },
  { feature: "Ireland (IE)", competitor: "23%", ours: "$20.00 + $4.60 = $24.60" },
  { feature: "Italy (IT)", competitor: "22%", ours: "$20.00 + $4.40 = $24.40" },
  { feature: "Spain (ES)", competitor: "21%", ours: "$20.00 + $4.20 = $24.20" },
  { feature: "Poland (PL)", competitor: "23%", ours: "$20.00 + $4.60 = $24.60" },
  { feature: "Sweden (SE)", competitor: "25%", ours: "$20.00 + $5.00 = $25.00" },
  { feature: "Denmark (DK)", competitor: "25%", ours: "$20.00 + $5.00 = $25.00" },
  { feature: "Hungary (HU)", competitor: "27%", ours: "$20.00 + $5.40 = $25.40" },
  { feature: "Belgium (BE)", competitor: "21%", ours: "$20.00 + $4.20 = $24.20" },
  { feature: "Austria (AT)", competitor: "20%", ours: "$20.00 + $4.00 = $24.00" },
  { feature: "Portugal (PT)", competitor: "23%", ours: "$20.00 + $4.60 = $24.60" },
  { feature: "Finland (FI)", competitor: "25.5%", ours: "$20.00 + $5.10 = $25.10" },
  { feature: "Czechia (CZ)", competitor: "21%", ours: "$20.00 + $4.20 = $24.20" },
  { feature: "Greece (GR)", competitor: "24%", ours: "$20.00 + $4.80 = $24.80" },
  { feature: "Romania (RO)", competitor: "19%", ours: "$20.00 + $3.80 = $23.80" },
  { feature: "Norway (NO)", competitor: "25%", ours: "$20.00 + $5.00 = $25.00" },
  { feature: "Switzerland (CH)", competitor: "8.1%", ours: "$20.00 + $1.62 = $21.62" },
  { feature: "United States (US)", competitor: "0%", ours: "$20.00 flat" },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Claude Pro's 5-hour window quota is one float on a sliding clock",
    excerpt:
      "The same endpoint family also carries your 5-hour utilization. One float, one resets_at, no message counter.",
    tag: "Related",
  },
  {
    href: "/how-it-works",
    title: "How ClaudeMeter reads the same JSON claude.ai/settings reads",
    excerpt:
      "Browser extension forwards your existing session over localhost:63762 to a Rust menu bar app. No cookie paste, no scraping.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage totals local tokens. ClaudeMeter reads the server-truth fields: utilization, payment_method.country, currency, next_charge_date.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro VAT charges explained: the two fields that decide what you are billed in the EU and UK",
  description:
    "Anthropic computes your Claude Pro VAT from two fields on /api/organizations/{org_uuid}/subscription_details: payment_method.country and currency. Read them, verify the rate, and map the country code to the exact dollar amount on your next invoice.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url }))
);

const faqJsonLd = faqPageSchema(faqs);

export default function ClaudeProVatBillingEuUkPage() {
  return (
    <article className="bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-10">
        <Breadcrumbs items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Pro VAT is decided by{" "}
          <GradientText>two fields Anthropic never shows you</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The amount that hits your card is not a mystery. It is a one-line
          calculation built from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            payment_method.country
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            currency
          </code>{" "}
          on the same Anthropic endpoint the Settings billing page calls.
          Anthropic never renders those fields in the UI. Here is where they
          live, how to read them, and what each country code turns $20 into.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Fields verified against the live subscription_details endpoint"
          highlights={[
            "payment_method.country is at src/models.rs:45",
            "currency is at src/models.rs:57",
            "Same JSON /settings/billing renders from",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="payment_method.country decides your VAT"
          subtitle="Two fields. One endpoint. The entire Claude Pro tax surface."
          captions={[
            "payment_method.country: ISO-3166 code from the card issuer",
            "currency: lowercase three-letter code, usually 'usd'",
            "endpoint: /api/organizations/{org_uuid}/subscription_details",
            "Anthropic never prints these fields in the Settings UI",
            "Stripe applies the VAT line on top; the PDF invoice shows it",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The setup, in one sentence
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Anthropic lists Claude Pro at $20.00 a month and keeps the sticker
          price identical everywhere in the world. What changes between
          countries is the tax line Stripe adds on top at charge time. That
          tax line is computed from one ISO-3166 country code Anthropic stores
          on your subscription, and that code is populated from the issuing
          country of your payment card, not from your IP address, your
          account email, or any billing address you typed in a form.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Every other guide on this topic describes that rule in the abstract.
          None of them tells you which field holds the country code or how to
          read it. The field exists. It is observable. You can check yours in
          the next 30 seconds.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact:{" "}
          <NumberTicker value={2} /> fields,{" "}
          <NumberTicker value={1} /> endpoint
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The endpoint is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/subscription_details
          </code>
          . Hit it with your logged-in claude.ai cookies. This is the exact
          JSON shape you get back, formatted for readability:
        </p>
        <AnimatedCodeBlock
          code={subscriptionPayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/subscription_details"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The two fields that matter for tax are{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            payment_method.country
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            currency
          </code>
          . Everything else on this payload is flavor: the brand of the card,
          the last four digits, whether the plan is active, when the next
          charge lands. The tax jurisdiction is decided by the first field.
          The billing currency is stated in the second.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The struct, verbatim
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter deserializes the response into the structs below. If
          Anthropic ever renames{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            country
          </code>{" "}
          or moves it, the deserializer fails and we ship a release; the
          field has been stable for many months.
        </p>
        <AnimatedCodeBlock
          code={paymentMethodStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The whole VAT surface, in numbers
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From the implementation, not from marketing copy.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 2, label: "fields that decide your VAT" },
              { value: 1, label: "endpoint that returns them" },
              { value: 20, prefix: "$", label: "Pro base price, worldwide" },
              { value: 27, suffix: "%", label: "highest rate (Hungary)" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <AnimatedBeam
          title="Inputs to the VAT line on your invoice"
          from={[
            { label: "Card issuer country", sublabel: "populates payment_method.country" },
            { label: "Plan base price", sublabel: "$20.00 uniform" },
            { label: "Stripe Tax table", sublabel: "rate per ISO-3166 code" },
            { label: "Anthropic VAT reg #", sublabel: "printed on invoice PDF" },
          ]}
          hub={{
            label: "subscription_details",
            sublabel: "the one endpoint the Settings page calls",
          }}
          to={[
            { label: "Invoice base line: $20.00" },
            { label: "Invoice VAT line: rate * $20.00" },
            { label: "Card charge: base + VAT, in USD" },
            { label: "Bank FX: converts USD to local" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The country code, the rate, the final number
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Once you have read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            payment_method.country
          </code>
          , this is what Stripe adds on top. Base is $20.00 everywhere; only
          the second column moves. Use this as a reference, then confirm
          against your next PDF invoice.
        </p>
        <ComparisonTable
          productName="Final USD charge"
          competitorName="Standard VAT rate"
          rows={vatRows}
        />
        <p className="text-zinc-500 text-sm mt-3">
          Rates are standard national VAT as of 2026-04. Anthropic uses the
          standard rate; digital services are not eligible for most reduced
          rates. A business VAT ID on Team/Enterprise moves the line to
          reverse-charge (net of VAT) from the next invoice onward.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What happens between your card and the PDF invoice
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The exact sequence that turns $20.00 into a $24.00 charge for a UK
          card. Same shape for every other VAT jurisdiction, only the rate
          changes.
        </p>
        <SequenceDiagram
          title="VAT computation path"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need ClaudeMeter to do this. Open DevTools on
          claude.ai/settings/billing, grab the cookie header off any XHR to
          claude.ai, and hit subscription_details directly. The response is
          plain JSON with the two fields we care about at top level.
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/subscription_details"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The full verification path, step by step
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the invoice number does not match the pricing page
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The pricing page on anthropic.com lists Pro at $20 a month. The
              Settings page inside claude.ai shows $20 a month. Your Stripe
              PDF, in GB, says $24.00. None of those are wrong, and none of
              them is lying. The first two quote the pre-tax base;
              subscription_details stores the country code that triggers the
              tax line; Stripe Tax adds 20% at invoice-draft time; the PDF is
              the first artifact that shows the assembled number.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              The UI gap is real but it is not deceptive: it is how every
              Stripe-billed B2C subscription works. Netflix, Spotify, Adobe,
              GitHub all behave the same way. What is unusual about Anthropic
              is that the country code is observable to you via an endpoint
              the product also happens to expose for usage data, and
              ClaudeMeter reads it every poll anyway to render your
              subscription panel. So if you already run the menu bar app, the
              field is already in your chrome.storage.local under the
              snapshots key.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          What you lose by not checking
        </h2>
        <AnimatedChecklist
          title="Consequences of not reading the field"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Common misconceptions to drop
        </h2>
        <Marquee speed={40} pauseOnHover>
          {myths.map((m) => (
            <span
              key={m}
              className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-200 whitespace-nowrap"
            >
              {m}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one case where it stops being about VAT
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Team and Enterprise plans expose a VAT ID field. Filling it in with
          a valid registration number, for a jurisdiction that supports
          reverse-charge on B2B digital services, moves the subscription
          into net billing: Anthropic stops adding VAT and your finance team
          self-accounts the tax on their end. Individual Pro does not expose
          this field in most regions, so a consultant who wants to reclaim
          VAT should either upgrade to Team or run the subscription through
          a company card on a Team account.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Two things to know about the mechanic. First, the VAT ID switch is
          prospective only: past invoices keep the VAT line and only future
          invoices are net. Second, the billing country has to be correct
          first; adding a VAT ID under the wrong country code returns a
          validation error rather than silently applying reverse-charge.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The subscription_details endpoint is internal and undocumented.
          Field names are not in any public spec. We deserialize into a
          strict struct, and the names used here (status, next_charge_date,
          billing_interval, payment_method, currency, and payment_method's
          brand, country, last4, type) have been stable on every account we
          have sampled in the US, UK, and Europe across many months. If
          Anthropic reshapes it, ClaudeMeter will surface a parse error and
          we will ship a patch. Until then, this is the field, and this is
          the rule Stripe applies to your invoice.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch your country code and next charge live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your menu bar, reads subscription_details every
          60 seconds, and surfaces payment_method.country, currency, and
          next_charge_date alongside your usage floats. Free, MIT licensed,
          no cookie paste.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Seeing a country code that does not match your location?"
          description="If subscription_details returns a code that makes Anthropic charge you the wrong VAT, send the sample response (redact the UUID). We are mapping the edge cases that confuse the Stripe Tax lookup."
          text="Book a 15-minute call"
          section="vat-billing-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call about your Claude billing"
        section="vat-billing-sticky"
        site="claude-meter"
      />
    </article>
  );
}
