import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <Prose title="Privacy Policy">
      <p>
        This policy explains what information {site.name} collects and how we use it. This is a draft template and should be reviewed by a qualified professional before launch, including against the Nigeria Data Protection Act.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, email address and password (stored securely, never in plain text).</li>
        <li><strong>Order details:</strong> the links, services and quantities you order.</li>
        <li><strong>Payment details:</strong> payments are processed by our payment partners. We do not store your card number.</li>
        <li><strong>Technical data:</strong> IP address, device and browser information, for security and fraud prevention.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To create your account, process orders and credit your wallet.</li>
        <li>To provide support and send order and payment notices.</li>
        <li>To prevent fraud and keep the platform secure.</li>
        <li>To meet legal obligations.</li>
      </ul>

      <h2>3. Who we share it with</h2>
      <p>
        We share only what is needed with payment processors, our service suppliers (for example, the link you want a service delivered to), and hosting and email providers. We do not sell your personal data.
      </p>

      <h2>4. Passwords for social accounts</h2>
      <p>We never ask for the passwords of your social media accounts. Do not share them with anyone.</p>

      <h2>5. Data retention and security</h2>
      <p>
        We keep your data for as long as your account is active and as required by law. We use reasonable technical measures to protect it, but no system is completely secure.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask to access, correct or delete your personal data by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>7. Cookies</h2>
      <p>We use essential cookies to keep you logged in and the site working.</p>

      <h2>8. Changes</h2>
      <p>We may update this policy and will change the date above when we do.</p>
    </Prose>
  );
}
