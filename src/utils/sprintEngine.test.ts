import { describe, it, expect } from 'vitest';
import { generateSprintArtifact } from './sprintEngine';
import { scrubSecrets } from './secretScrubber';

describe('SprintPulse AI Synthesis Engine', () => {
  it('should synthesize daily standup from natural language voice input', () => {
    const transcript =
      'Yesterday I completed the OAuth refresh token multi-exec transaction. Today I am implementing Stripe webhook verification. Blocker: waiting on @sarah for code review.';
    const gitLogs = 'commit 9a1f4b2 feat(auth): atomic token invalidation in Redis';

    const output = generateSprintArtifact({
      voiceTranscript: transcript,
      gitLogs,
      format: 'standup',
      tone: 'detailed',
      authorName: 'Test Dev'
    });

    expect(output.title).toContain('Daily Standup');
    expect(output.content).toContain('Yesterday (Completed)');
    expect(output.content).toContain('Today (In Progress)');
    expect(output.content).toContain('Blockers & Dependencies');
    expect(output.content).toContain('9a1f4b2');
    expect(output.actionItems.length).toBeGreaterThan(0);
    expect(output.actionItems[0].task).toContain('@sarah');
  });

  it('should handle empty or whitespace-only voice transcript gracefully', () => {
    const output = generateSprintArtifact({
      voiceTranscript: '   ',
      format: 'standup',
      tone: 'concise'
    });

    expect(output.title).toContain('Daily Standup');
    expect(output.stats.words).toBe(0);
  });

  it('should parse conventional git commit prefixes in release notes format', () => {
    const transcript = 'Release version milestone update.';
    const gitLogs = `commit f412abc feat(auth): add MFA support
commit 89b12cc fix(cache): resolve TTL expiration race condition
commit 331cd55 chore(deps): upgrade vite to 8.3`;

    const output = generateSprintArtifact({
      voiceTranscript: transcript,
      gitLogs,
      format: 'release',
      tone: 'bulleted'
    });

    expect(output.content).toContain('New Features & Enhancements');
    expect(output.content).toContain('Bug Fixes & Resilience');
    expect(output.content).toContain('f412abc');
  });

  it('should synthesize four structured quadrants in sprint retrospective format', () => {
    const transcript =
      'Yesterday we shipped the EKS migration smoothly. Bottleneck: staging database migration took 45 minutes due to index rebuilds. Kudos to @sarah for staying late to test!';
    const gitLogs = 'commit a1b2c3d feat(k8s): helm chart deployment';

    const output = generateSprintArtifact({
      voiceTranscript: transcript,
      gitLogs,
      format: 'retro',
      tone: 'detailed',
      authorName: 'Sprint Lead'
    });

    expect(output.title).toContain('Sprint Retrospective');
    expect(output.content).toContain('1. What Went Exceptionally Well');
    expect(output.content).toContain('2. Bottlenecks & Technical Debt Discovered');
    expect(output.content).toContain('3. Actionable Process Improvements');
    expect(output.content).toContain('4. Team Peer Shout-Outs & Kudos');
    expect(output.content).toContain('@sarah');
  });
});

describe('Automated Secret Scrubber', () => {
  it('should detect and mask AWS access keys', () => {
    const raw = 'Configured AWS S3 bucket with key ' + 'AKIA' + 'IOSFODNN7EXAMPLE for asset storage.';
    const result = scrubSecrets(raw);

    expect(result.redactedCount).toBe(1);
    expect(result.detectedTypes).toContain('AWS Access Key');
    expect(result.sanitized).toContain('[REDACTED_AWS_KEY]');
    expect(result.sanitized).not.toContain('AKIAIOSFODNN7EXAMPLE');
  });

  it('should detect and mask Stripe live secret keys', () => {
    const mockKey = 'sk_' + 'live_' + '51Mz0FakeStripeKey1234567890abcdef';
    const raw = `Testing webhook listener with ${mockKey}.`;
    const result = scrubSecrets(raw);

    expect(result.redactedCount).toBe(1);
    expect(result.detectedTypes).toContain('Stripe API Key');
    expect(result.sanitized).toContain('[REDACTED_STRIPE_KEY]');
  });
});
