export interface ScrubResult {
  sanitized: string;
  redactedCount: number;
  detectedTypes: string[];
}

export function scrubSecrets(input: string): ScrubResult {
  if (!input) return { sanitized: '', redactedCount: 0, detectedTypes: [] };

  let text = input;
  let count = 0;
  const types = new Set<string>();

  // 1. AWS Access Key ID
  const awsRegex = /\bAKIA[0-9A-Z]{16}\b/g;
  if (awsRegex.test(text)) {
    types.add('AWS Access Key');
    text = text.replace(awsRegex, () => {
      count++;
      return '[REDACTED_AWS_KEY]';
    });
  }

  // 2. Stripe API Secret Key
  const stripeRegex = /\b[sr]k_live_[0-9a-zA-Z]{24,}\b/g;
  if (stripeRegex.test(text)) {
    types.add('Stripe API Key');
    text = text.replace(stripeRegex, () => {
      count++;
      return '[REDACTED_STRIPE_KEY]';
    });
  }

  // 3. GitHub Personal Access Tokens
  const githubRegex = /\b(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{50,})\b/g;
  if (githubRegex.test(text)) {
    types.add('GitHub Token');
    text = text.replace(githubRegex, () => {
      count++;
      return '[REDACTED_GITHUB_TOKEN]';
    });
  }

  // 4. JWT / Bearer tokens
  const jwtRegex = /\bBearer\s+eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/gi;
  if (jwtRegex.test(text)) {
    types.add('JWT Auth Token');
    text = text.replace(jwtRegex, () => {
      count++;
      return 'Bearer [REDACTED_JWT_TOKEN]';
    });
  }

  // 5. Generic key/token assignments (e.g., api_key=xyz, secret=xyz, password=xyz)
  const genericSecretRegex = /(?<=\b(?:password|passwd|api_key|secret_key|client_secret|auth_token)\s*[:=]\s*)(['"]?)(?:(?!\1)[^\s,;]+)\1/gi;
  if (genericSecretRegex.test(text)) {
    types.add('Sensitive Credential');
    text = text.replace(genericSecretRegex, () => {
      count++;
      return '[REDACTED_SECRET]';
    });
  }

  return {
    sanitized: text,
    redactedCount: count,
    detectedTypes: Array.from(types)
  };
}
