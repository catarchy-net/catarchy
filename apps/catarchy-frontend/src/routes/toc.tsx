import { HeaderBackButton, Scaffold } from "@/features/common";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/toc")({
  component: RouteComponent,
});

const content = `Terms of Service

Effective Date: April 25, 2026
Operator: Aiiiden
Contact: admin@catarchy.net

---

1. Agreement to Terms

By accessing or using Catarchy ("the Protocol"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Protocol.

---

2. Eligibility

You must be at least 18 years of age to use the Protocol. By using Catarchy, you represent and warrant that you meet this requirement. Accounts found to be in violation of this requirement may be terminated without notice.

---

3. Account Registration

To participate, you register with an email address and a password. The email is used solely for authentication and verification — it is never displayed publicly and is not part of your in-Protocol identity.

Your handle (2–32 characters, letters/numbers/underscores only) is your sole public identity within Catarchy. Handles are unique and non-transferable.

You are responsible for:
- Maintaining the confidentiality of your credentials
- All activity that occurs under your account

We reserve the right to reclaim or suspend handles found to be impersonating others.

---

4. Paid Features

Certain features within the Protocol may require payment. By purchasing any paid feature, you agree that:
- All purchases are final and non-refundable unless required by applicable law
- Paid features are tied to your account and are non-transferable
- In-Protocol items or privileges have no real-world monetary value and cannot be redeemed for cash
- The operator reserves the right to modify, limit, or discontinue paid features at any time with reasonable notice

We do not store payment card information. Payment processing is handled entirely by third-party providers.

---

5. Personality Matching

We use your Big Five personality scores solely on the server side to provide matching and recommendation features. These scores are not made public and remain private to you. Matching suggestions are provided for entertainment and social purposes only.

---

6. Prohibited Conduct

You agree not to:
- Exploit, manipulate, or abuse the Protocol's mechanics
- Use automated tools, bots, or scripts to interact with the Protocol without explicit written permission
- Impersonate any person or entity
- Attempt to interfere with other users' accounts or the Protocol's infrastructure
- Use the Protocol for any unlawful purpose

We reserve the right to suspend or permanently terminate accounts engaging in prohibited conduct.

---

7. Intellectual Property

All content, branding, and code associated with Catarchy is owned by or licensed to the operator. You are granted a limited, non-exclusive, non-transferable license to use the Protocol for personal, non-commercial purposes.

You retain ownership of any content you submit, but grant us a worldwide, royalty-free license to use and display such content solely in connection with operating the Protocol.

---

8. Disclaimers

THE PROTOCOL IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE MAKE NO GUARANTEES REGARDING UPTIME, DATA PERSISTENCE, OR CONTINUITY OF SERVICE.

The operator is not liable for any loss of progress, in-Protocol assets, or account data resulting from protocol changes or technical failures.

---

9. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE OPERATOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PROTOCOL, INCLUDING LOSS OF DATA OR IN-PROTOCOL ASSETS.

Our total liability to you for any claim shall not exceed the amount you paid to us in the 30 days preceding the claim.

---

10. Termination

We reserve the right to suspend or terminate your access at any time, for any reason, including violation of these Terms. Upon termination, your account data may be deleted in accordance with our Privacy Policy.

You may delete your account at any time by contacting admin@catarchy.net.

---

11. Changes to These Terms

We may update these Terms at any time. Material changes will be communicated via in-app notice or email. Continued use of the Protocol after the effective date of updated Terms constitutes acceptance.

---

12. Governing Law

These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.

Any disputes arising out of or relating to these Terms or the Protocol shall be resolved exclusively in the state or federal courts located in San Francisco County, California. You consent to the personal jurisdiction and venue of such courts.

---

13. Dispute Resolution

For any disputes arising from your use of the Protocol, please contact us first at admin@catarchy.net. We will make a good-faith effort to resolve the matter directly.

---

14. Contact

admin@catarchy.net`;

function RouteComponent() {
  return (
    <Scaffold>
      <Scaffold.Header title="Terms of Service" left={<HeaderBackButton />} />
      <Scaffold.Body>
        <pre className="p-4 text-base whitespace-pre-wrap break-words overflow-x-hidden font-[inherit] leading-relaxed">
          {content}
        </pre>
      </Scaffold.Body>
    </Scaffold>
  );
}
