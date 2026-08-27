import Link from "next/link";
import { CircularLogo } from "@/components/ui/CircularLogo";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/server/auth/current-user";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/scout", label: "EA Scout" },
  { href: "/signals", label: "Signals" },
  { href: "/prop-firms", label: "Prop Firms" },
  { href: "/brokers", label: "Brokers" },
  { href: "/blog", label: "Learn" },
  { href: "/developer", label: "Developers" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-borderSoft">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <CircularLogo size={36} />
          <span className="text-lg font-bold">
            EAPA<span className="text-primaryBright">SER</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted hover:text-text">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          {user ? (
            <Link href={user.role === "DEVELOPER" ? "/developer" : "/dashboard"}>
              <Button variant="ghost" size="sm">My account</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
          )}
          <Link href="/developer/products/new">
            <Button size="sm">List Your EA</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
