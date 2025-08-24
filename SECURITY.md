# 🔒 Security Policy

## Supported Versions

We actively support the following versions of CodeSearch with security updates:

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅ Yes    |
| < 0.1   | ❌ No     |

## 🚨 Reporting a Vulnerability

We take the security of CodeSearch seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### 📧 How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **security@codesearch.ai**

Include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

### 🕐 Response Timeline

- **Initial Response**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Status Updates**: We will send you regular updates about our progress every 7 days
- **Resolution**: We aim to resolve critical vulnerabilities within 90 days

### 🏆 Recognition

We believe in recognizing security researchers who help keep CodeSearch secure:

- **Public Recognition**: With your permission, we'll acknowledge your contribution in our security advisories
- **Hall of Fame**: Security researchers will be listed in our security hall of fame
- **Swag**: Qualifying reports may receive CodeSearch swag

## 🛡️ Security Best Practices

### For Users

When using CodeSearch, please follow these security best practices:

#### 🔑 API Key Management

- **Never commit API keys** to version control
- **Use environment variables** for API keys
- **Rotate API keys regularly**
- **Use least-privilege access** for API keys

```bash
# ✅ Good - Use environment variables
export OPENAI_API_KEY="your-api-key"
export QDRANT_API_KEY="your-qdrant-key"

# ❌ Bad - Never hardcode in source
const apiKey = "sk-1234567890abcdef"; // DON'T DO THIS
```

#### 🗄️ Database Security

- **Use authentication** for your vector database
- **Enable TLS/SSL** for database connections
- **Restrict network access** to your database
- **Regular backups** with encryption

#### 🔒 Code Indexing

- **Review ignore patterns** to exclude sensitive files
- **Avoid indexing** configuration files with secrets
- **Be cautious** with private repositories

```typescript
// ✅ Good - Exclude sensitive files
const context = new Context({
  // ... other config
  ignorePatterns: [
    "**/.env*",
    "**/secrets/**",
    "**/*.key",
    "**/*.pem",
    "**/config/production.json",
  ],
});
```

### For Contributors

#### 🔍 Code Review

- **Security-focused reviews** for all PRs
- **Dependency scanning** for vulnerabilities
- **Static analysis** tools integration
- **Regular security audits**

#### 📦 Dependencies

- **Keep dependencies updated**
- **Audit dependencies regularly**
- **Use lock files** (package-lock.json, pnpm-lock.yaml)
- **Review dependency changes**

```bash
# Regular security audits
pnpm audit
pnpm audit --fix
```

## 🚫 Known Security Considerations

### Vector Database Access

- CodeSearch requires access to a vector database (Qdrant, Faiss)
- Ensure your vector database is properly secured
- Use authentication and network restrictions

### API Key Usage

- CodeSearch uses API keys for embedding providers (OpenAI, VoyageAI, etc.)
- API keys are used to generate embeddings from your code
- Ensure you trust the embedding provider with your code content

### Code Content

- CodeSearch processes and stores code content as vector embeddings
- Consider the sensitivity of your codebase before indexing
- Use appropriate ignore patterns for sensitive files

## 🔄 Security Updates

We will publish security advisories for any vulnerabilities found in CodeSearch:

- **GitHub Security Advisories**: Published on our GitHub repository
- **NPM Security Advisories**: Published with affected package versions
- **Release Notes**: Security fixes will be highlighted in release notes

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NPM Security Best Practices](https://docs.npmjs.com/security)

## 📞 Contact

For any security-related questions or concerns:

- **Email**: security@codesearch.ai
- **GitHub**: Create a private vulnerability report
- **Discord**: Reach out to maintainers in our [Discord server](https://discord.gg/mKc3R95yE5)

---

Thank you for helping keep CodeSearch and our community safe! 🙏
