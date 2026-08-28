import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/30 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primaryBright">EAPASSER</h3>
            <p className="text-sm text-muted mt-2">Professional Trading Technology</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/marketplace" className="hover:text-text transition">Marketplace</Link></li>
              <li><Link href="/performance" className="hover:text-text transition">Performance</Link></li>
              <li><Link href="/tools" className="hover:text-text transition">Tools</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/legal/risk-disclosure" className="hover:text-text transition">Risk Disclosure</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-text transition">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-text transition">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://t.me/propfirmeapasser1" target="_blank" rel="noopener noreferrer" className="hover:text-text transition">Telegram</a></li>
              <li><a href="mailto:support@eapasser.com" className="hover:text-text transition">support@eapasser.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted">
          © {new Date().getFullYear()} EAPASSER. All rights reserved.
        </div>
      </div>
    </footer>
  );
}