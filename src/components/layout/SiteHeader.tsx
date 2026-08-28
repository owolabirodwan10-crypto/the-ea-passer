import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primaryBright/30 flex-shrink-0">
            <Image src="/icon.png" alt="EAPASSER" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold text-primaryBright">EAPASSER</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/marketplace" className="text-muted hover:text-text transition">Marketplace</Link>
          <Link href="/performance" className="text-muted hover:text-text transition">Performance</Link>
          <Link href="/tools" className="text-muted hover:text-text transition">Tools</Link>
          <Link href="/support" className="text-muted hover:text-text transition">Support</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-text transition">Login</Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
      </div>
    </header>
  );
}