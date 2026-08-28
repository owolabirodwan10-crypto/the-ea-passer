import Link from "next/link";
import { CircularLogo } from "@/components/ui/CircularLogo";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { href: "/marketplace?category=forex-robots", label: "Forex Robots" },
      { href: "/marketplace?category=mt4-eas", label: "MT4 EAs" },
      { href: "/marketplace?category=mt5-eas", label: "MT5 EAs" },
      { href: "/marketplace?category=gold-eas", label: "Gold EAs" },
      { href: "/marketplace?category=prop-firm-eas", label: "Prop Firm EAs" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/scout", label: "EA Scout" },
      { href: "/signals", label: "Signals" },
      { href: "/prop-firms", label: "Prop Firms" },
      { href: "/brokers", label: "Brokers" },
      { href: "/reviews", label: "Reviews" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/developer/products/new", label: "List Your EA" },
      { href: "/legal/developer-agreement", label: "Developer Agreement" },
      { href: "/legal/marketplace-rules", label: "Marketplace Rules" },
      { href: "/developer/payouts", label: "Payouts" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/blog", label: "Learn" },
      { href: "/support", label: "Help Center" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-borderSoft py-14">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-11 grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <CircularLogo size={34} />
              <span className="text-base font-bold">
                EAPA<span className="text-primaryBright">SER</span>
              </span>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-muted">
              A marketplace and intelligence platform for Forex Expert Advisors, developers and the
              traders who run them.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h5 className="mb-4 text-xs font-semibold uppercase tracking-wide text-mutedSoft">{col.title}</h5>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href} className="mb-2.5 block text-[13.5px] text-muted hover:text-text">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-6 text-xs text-mutedSoft">
          <span>Copyright EAPASER. All rights reserved.</span>
          <span>Not a financial advisor. Automated trading carries risk of loss.</span>
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-mutedSoft">
          Risk disclosure: Expert Advisors and automated trading systems do not guarantee profit and
          can result in the loss of invested capital. Performance information displayed on EAPASER,
          where shown, reflects data submitted by developers or admins with a stated source and
          verification status. Past results do not indicate future performance.
        </p>
      </div>
    </footer>
  );
}
