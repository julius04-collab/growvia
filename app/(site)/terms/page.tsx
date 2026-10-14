import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <Prose title="Terms of Service">
      <p>
        These terms apply to your use of {site.name}. By creating an account or placing an order, you agree to them. This is a draft template and should be reviewed by a qualified professional before launch.
      </p>

      <h2>1. What we offer</h2>
      <p>
        {site.name} is an online platform where you can buy social media marketing services, such as followers, likes and views. Services are fulfilled through third-party suppliers.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must provide accurate information and keep your login details private.</li>
        <li>You are responsible for all activity under your account.</li>
        <li>You must be at least 18 years old, or have permission from a parent or guardian.</li>
      </ul>

      <h2>3. Orders</h2>
      <ul>
        <li>Make sure your profile or post is public and your link is correct before ordering.</li>
        <li>Orders cannot be changed or cancelled once they have started.</li>
        <li>Start times and delivery speeds are estimates, not guarantees.</li>
        <li>Do not place multiple orders for the same link at the same time, as this can cause errors.</li>
      </ul>

      <h2>4. No guarantee of permanence</h2>
      <p>
        Social media platforms change their systems and rules often. Numbers added through our services can drop over time. Where a service is marked with refill, we will top up a drop within the stated refill period. We cannot guarantee results beyond that.
      </p>

      <h2>5. Platform rules and your responsibility</h2>
      <p>
        Using marketing services may be restricted by the rules of the platform you use them on. You are responsible for following those rules and for any action a platform takes on your account. We are not responsible for account restrictions, removals or bans.
      </p>

      <h2>6. Payments and wallet</h2>
      <ul>
        <li>Orders are paid from your wallet balance, which you fund through our payment partners.</li>
        <li>Prices are shown in naira and may change. The price shown at checkout applies to your order.</li>
        <li>Wallet funds are used for orders on {site.name} and are refunded only as described in our Refund Policy.</li>
      </ul>

      <h2>7. Prohibited use</h2>
      <ul>
        <li>Using the service for unlawful, abusive or fraudulent purposes.</li>
        <li>Chargeback abuse or attempting to defraud us or our payment partners.</li>
        <li>Abusing our systems, including automated attacks or reselling access in a way that breaks these terms.</li>
      </ul>
      <p>We may suspend or close accounts that break these terms.</p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent allowed by law, {site.name} is not liable for indirect or consequential losses. Our total liability for any order is limited to the amount you paid for that order.
      </p>

      <h2>9. Changes</h2>
      <p>We may update these terms. Continued use of the service means you accept the updated terms.</p>

      <h2>10. Contact</h2>
      <p>Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </Prose>
  );
}
