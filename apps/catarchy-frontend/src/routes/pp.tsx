import { HeaderBackButton, Scaffold } from "@/features/common";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pp")({
  component: RouteComponent,
});

const content = `Privacy Policy

Effective Date: April 25, 2026
Operator: Aiiiden
Contact: admin@catarchy.net

---

1. Overview

This Privacy Policy describes how Catarchy ("the Protocol") collects, uses, and protects your information. By using the Protocol, you agree to the practices described here.

We collect only the minimum data necessary to operate the Protocol. We do not sell your personal information to third parties.

---

2. Data We Collect

Account Data
- Email address — used solely for authentication and verification; never displayed publicly
- Password — stored as a one-way cryptographic hash; we never store your plaintext password
- Handle — your public identity within the Protocol

Session Data
- Refresh tokens — retained for up to 7 days to maintain authenticated sessions
- Access tokens — short-lived (15 minutes); not stored server-side

Notification Data
- Device push tokens — collected only if you opt in to push notifications; used solely to deliver notifications to your device

Usage Data
- Standard server logs (timestamps, IP addresses) for security and diagnostic purposes; retained for no more than 90 days and not used for profiling

In-Protocol Data
- Content and activity generated through your use of the Protocol

Personality Assessment Data (Big Five / OCEAN)
- We collect your responses to generate Big Five personality trait scores (1–10 scale).
- These scores are stored on our servers and used only for internal features such as personality-based matching and recommendations.
- Your Big Five scores are not visible to other users at any time.
- We do not display or share individual scores in profiles, posts, or community features.

---

3. How We Use Your Data

We use the data we collect to:
- Authenticate and maintain your account
- Deliver push notifications you have opted in to
- Operate and improve the Protocol
- Generate and use Big Five personality scores for internal matching and recommendation features
- Detect and prevent abuse or unauthorized access
- Process payments via third-party providers (we never store payment card details)

---

4. Third-Party Services

We share limited data with third-party services solely to operate the Protocol. These providers have their own privacy policies governing their use of data.

Push notifications are delivered via Google Firebase Cloud Messaging.
Payments are processed by a third-party payment provider.
Certain Protocol features may use third-party AI services. Only non-identifying, in-Protocol data is sent to these services.

---

5. Data Retention

Account data is retained until you delete your account. Upon deletion, your personal data is removed in accordance with this policy. Some anonymized or aggregated records may be retained for Protocol integrity purposes.

---

6. Your Rights

You may request access to, correction of, or deletion of your personal data at any time. To exercise any of these rights, contact us at admin@catarchy.net. We will respond within 30 days.

---

7. Security

We apply industry-standard security measures to protect your data, including cryptographic password hashing and encrypted data transmission. No system is entirely secure, and we cannot guarantee absolute protection against unauthorized access.

---

8. Data Breach Response

In the event of a data breach that affects your personal information, we will:
- Notify affected users via email within 72 hours of becoming aware of the breach, where feasible
- Describe the nature of the breach, the data involved, and the steps we are taking to address it
- Provide guidance on steps you can take to protect yourself

If you suspect unauthorized access to your account, contact us immediately at admin@catarchy.net.

---

9. International Users

The Protocol is operated from servers that may be located outside your country of residence. By using the Protocol, you consent to the transfer and processing of your data in those locations.

If you are located in the European Economic Area (EEA) or the United Kingdom, you have rights under the General Data Protection Regulation (GDPR) or UK GDPR, including the right to data portability, the right to restrict processing, and the right to lodge a complaint with your local supervisory authority.

If you are located in the Republic of Korea, we process your data in accordance with the Personal Information Protection Act (PIPA). You may contact us at admin@catarchy.net to exercise your rights under applicable law.

You are responsible for complying with all applicable laws in your jurisdiction when using the Protocol.

---

10. Age Restriction

The Protocol is intended for users 18 years of age or older. We do not knowingly collect data from minors. If we become aware that a minor has registered, the account will be terminated and associated data deleted.

---

11. Governing Law & California Residents

This Privacy Policy is governed by the laws of the State of California, without regard to conflict of law principles.

If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), including:
- The right to know what personal information we collect and how it is used
- The right to delete your personal information
- The right to correct inaccurate personal information
- The right to opt out of the sale or sharing of personal information (we do not sell or share your personal information)
- The right to non-discrimination for exercising your privacy rights

To exercise any of these rights, contact us at admin@catarchy.net.

---

12. Changes to This Policy

We may update this Privacy Policy at any time. Material changes will be communicated via in-app notice or email. Continued use of the Protocol after changes take effect constitutes acceptance.

---

13. Personality Assessment Disclaimer

The Big Five personality assessment within Catarchy is provided for entertainment and self-exploration purposes only. Results do not constitute psychological diagnosis, medical advice, or any form of professional evaluation, and must not be used for employment decisions or any other professional purpose. We make no guarantees regarding the accuracy of the results.

---

14. Contact

For any privacy-related concerns, contact us at:
admin@catarchy.net`;

function RouteComponent() {
  return (
    <Scaffold>
      <Scaffold.Header title="Privacy Policy" left={<HeaderBackButton />} />
      <Scaffold.Body>
        <pre className="p-4 text-base whitespace-pre-wrap break-words overflow-x-hidden font-[inherit] leading-relaxed">
          {content}
        </pre>
      </Scaffold.Body>
    </Scaffold>
  );
}
