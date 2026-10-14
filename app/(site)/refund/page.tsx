import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Refund Policy" };

export default function Refund() {
  return (
    <Prose title="Refund Policy">
      <p>
        This policy explains when you can get a refund from {site.name}. This is a draft template and should be reviewed by a qualified professional before launch.
      </p>

      <h2>1. When you get a refund</h2>
      <ul>
        <li><strong>Undelivered orders:</strong> if an order cannot be delivered, the full amount is returned to your wallet.</li>
        <li><strong>Partially delivered orders:</strong> you are refunded for the part that was not delivered.</li>
        <li><strong>Cancelled orders:</strong> if an order is cancelled before it starts, the amount is returned to your wallet.</li>
      </ul>

      <h2>2. When you do not get a refund</h2>
      <ul>
        <li>Orders placed with a wrong link, or for a private account or post.</li>
        <li>Orders that have started or been completed as described.</li>
        <li>Counts that drop on a service that does not include refill.</li>
        <li>Actions taken by a platform against your account.</li>
      </ul>

      <h2>3. Refill</h2>
      <p>
        On services marked with refill, if the count drops within the refill period shown on the service, contact support and we will top it up.
      </p>

      <h2>4. Where refunds go</h2>
      <p>
        Refunds are credited to your {site.name} wallet. Wallet balance can be used for any future order. Cash-out of wallet balance to your bank account is handled case by case; contact support.
      </p>

      <h2>5. Failed or duplicate payments</h2>
      <p>
        If a payment was taken but your wallet was not credited, or you were charged twice, contact us with your payment reference and we will resolve it.
      </p>

      <h2>6. How to request help</h2>
      <p>
        Open a support ticket from your dashboard or email <a href={`mailto:${site.email}`}>{site.email}</a> with your order ID.
      </p>
    </Prose>
  );
}
