import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="this content is a placeholder pending legal review">
      <p>
        This page is a placeholder. EAPASER has not yet published a reviewed privacy policy.
        This scaffold is provided so the route exists and is wired into the footer, not as a
        substitute for actual legal drafting.
      </p>
      <p>
        Once published here, this page should describe what account, order, and usage data
        EAPASER collects, how license and download activity is logged, how long data is
        retained, and how a person can request access to or deletion of their data.
      </p>
      <p>
        Until a real policy is published, no legal claims about data handling should be inferred
        from this page.
      </p>
    </LegalPage>
  );
}
