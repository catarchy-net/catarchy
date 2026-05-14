# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Latest (`main`) | ✅ |
| Older branches | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues to **admin@catarchy.net** with the subject line `[SECURITY] <brief description>`.
If email is unavailable, submit a private report via **GitHub Security Advisories** (repository **Security** tab).

Include the following in your report:

- Description of the vulnerability and its potential impact
- Steps to reproduce (proof of concept if possible)
- Affected endpoint, component, or file path
- Suggested fix (optional)

You can expect an acknowledgment within **48 hours**.

Estimated resolution timelines by severity:
- **Critical**: within **7 days**
- **High**: within **14 days**
- **Medium**: within **30 days**
- **Low**: best effort, typically within **60 days**

## Scope

The following are in scope for security reports:

- **Authentication & Authorization** — JWT token handling, session management, privilege escalation
- **API endpoints** — `api.catarchy.net` (Elysia backend on Cloudflare Workers)
- **Data exposure** — unintended access to user data via Cloudflare D1
- **AI prompt injection** — malicious inputs affecting AI-generated responses
- **Wallet/blockchain integration** — vulnerabilities in viem usage or signature verification
- **Dependency vulnerabilities** — CVEs and security issues of any severity in both direct and transitive dependencies (`elysia`, `drizzle-orm`, `bcryptjs`, etc.)

## Out of Scope

- Denial of service attacks
- Brute force without rate-limiting bypass
- Social engineering or phishing
- Vulnerabilities in third-party services (Cloudflare, Resend, Anthropic, etc.)
- Issues requiring physical access to infrastructure

## Security Best Practices (for contributors)

- Never commit secrets, API keys, or `.env` files — use Cloudflare Workers secrets (`wrangler secret`)
- All user input must be validated via Zod schemas before processing
- JWT secrets must be rotated immediately if exposed
- AI API keys (Anthropic, Alibaba) are high-value targets — treat them like passwords
