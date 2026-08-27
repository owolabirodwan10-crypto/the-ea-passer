import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Risk Disclosure" };

export default function RiskDisclosurePage() {
  return (
    <LegalPage title="Risk Disclosure" updated="reflects the platform's current data handling">
      <p>
        EAPASER is a marketplace and discovery platform for Forex Expert Advisors and related
        products. EAPASER is not a financial advisor, broker, or fund manager, and does not
        manage anyone&apos;s trading capital.
      </p>
      <p>
        Expert Advisors and other automated trading systems do not guarantee profit. Automated
        trading, like all trading, carries a real risk of loss, including the loss of the full
        amount invested. Past performance, whether from a backtest or a live account, does not
        indicate future results.
      </p>
      <p>
        Where performance information is shown on a product page, it is submitted by the
        developer or an admin, and always displays its source and a verification status. EAPASER
        does not independently generate or estimate performance figures for any product.
      </p>
      <p>
        Before purchasing or running any EA, review its stated requirements, risk level, and
        performance evidence, and consider your own risk tolerance and financial situation.
      </p>
    </LegalPage>
  );
}
