import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="this content is a placeholder pending legal review">
      <p>
        This page is a placeholder. EAPASER has not yet published reviewed terms of service.
        The route exists so navigation is not broken, not as a substitute for actual legal
        drafting.
      </p>
      <p>
        A finished version of this page should cover account eligibility, acceptable use of the
        marketplace, how licenses are granted and revoked, refund conditions, and dispute
        handling between customers and developers.
      </p>
      <p className="text-[13px] text-mutedSoft">
        See also: <a href="/legal/risk-disclosure" className="text-primaryBright hover:underline">Risk Disclosure</a>,{" "}
        <a href="/legal/developer-agreement" className="text-primaryBright hover:underline">Developer Agreement</a>.
      </p>
    </LegalPage>
  );
}
