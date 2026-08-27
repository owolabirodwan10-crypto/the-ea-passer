import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Developer Agreement" };

export default function DeveloperAgreementPage() {
  return (
    <LegalPage title="Developer Agreement" updated="this content is a placeholder pending legal review">
      <p>This page is a placeholder pending real legal drafting. It should eventually set out, in enforceable terms:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>The commission split EAPASER takes on each sale (currently configured per developer as a commission rate on their account).</li>
        <li>What admin review checks for before a product is approved, and grounds for rejection or suspension.</li>
        <li>Ownership and licensing of the developer&apos;s intellectual property.</li>
        <li>Payout schedule, minimum thresholds, and required payout provider information.</li>
        <li>Conditions under which a listing can be delisted after going live.</li>
      </ul>
    </LegalPage>
  );
}
