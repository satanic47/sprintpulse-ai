import { SamplePreset } from '../types';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'auth-redis',
    title: 'OAuth Refresh & Redis Session Invalidation',
    role: 'Backend Engineer',
    description: 'Fixing token expiry loop and stale Redis session state during JWT refresh.',
    voiceTranscript: `Hey team, quick update. Yesterday I spent most of the afternoon tracking down that sneaky auth bug reported by QA where users were intermittently getting kicked back to the login screen. It turned out the refresh token rotation in auth-service was updating the database timestamp, but the Redis blacklist cache had a TTL race condition. I rewrote the token invalidation pipeline to execute an atomic Redis multi/exec transaction and added integration tests for simultaneous refresh calls.

Today I am wrapping up the edge cases for multi-device logout and wiring up telemetry logs for failed refresh attempts in Datadog. 

Blockers: None right now, just waiting for @sarah to review PR #142 so we can deploy to staging before the 3 PM regression freeze.`,
    gitLogs: `commit f98a12e fix(auth): make Redis token invalidation atomic with multi-exec
commit c41d80b test(auth): add concurrent refresh token integration tests
commit 71b3e8a refactor(redis): adjust TTL grace window to 15 seconds`,
    recommendedFormat: 'standup'
  },
  {
    id: 'stripe-webhook',
    title: 'Stripe Billing Webhook & Idempotency Key',
    role: 'Full-Stack Developer',
    description: 'Handling duplicate subscription renewal webhooks and updating billing tables.',
    voiceTranscript: `So this PR implements the new Stripe webhook listener for subscription lifecycle events. The main issue was handling duplicate webhook events when Stripe retries during network timeouts. I added an idempotency table in PostgreSQL with unique event IDs, verified the Stripe webhook signature with timing-safe comparison, and updated customer account status to past_due or active. Tested with Stripe CLI forwarding events locally and wrote mock unit tests for webhook payload signature forgery.`,
    gitLogs: `commit a841bc9 feat(billing): add Stripe webhook signature validation and handler
commit 55c0e12 feat(db): create webhook_idempotency table with unique event_id constraint
commit 1928fa3 test(billing): mock stripe signature forgery and duplicate retry payloads`,
    recommendedFormat: 'pr'
  },
  {
    id: 'k8s-migration',
    title: 'Kubernetes Helm Chart & GitHub Actions CI/CD',
    role: 'DevOps / Platform Engineer',
    description: 'Migrating legacy EC2 deployment scripts to automated Helm deployments on EKS.',
    voiceTranscript: `Sprint goal update for the containerization initiative: Yesterday finished migrating the notification microservice onto the new EKS cluster using our standardized Helm chart. Replaced old bash deploy scripts with a GitHub Actions workflow that builds multi-arch Docker images, scans with Trivy for CVEs, and deploys to staging via ArgoCD. 

Today working on configuring Horizontal Pod Autoscaling (HPA) based on custom Prometheus queue depth metrics from RabbitMQ. 

Risks and blockers: The staging RabbitMQ cluster needs the Prometheus exporter plugin enabled, submitted access request #899 to infrastructure security team.`,
    gitLogs: `commit 829ae41 ci: automate container build and Trivy vulnerability scan
commit 338b11c deploy(helm): standardize notification-service values and resource limits
commit 48cb901 chore(k8s): add HorizontalPodAutoscaler spec for RabbitMQ queue metrics`,
    recommendedFormat: 'linear'
  }
];
