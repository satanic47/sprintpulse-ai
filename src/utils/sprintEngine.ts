import { SprintFormat, Tone, StandupStyle, ActionItem, GeneratedOutput, TemplateSettings } from '../types';

interface GenerationParams {
  voiceTranscript: string;
  gitLogs?: string;
  format: SprintFormat;
  tone: Tone;
  authorName?: string;
  templateSettings?: TemplateSettings;
}

export function generateSprintArtifact(params: GenerationParams): GeneratedOutput {
  const {
    voiceTranscript,
    gitLogs = '',
    format,
    tone,
    authorName = 'Developer',
    templateSettings = {
      style: 'scrum',
      emojis: true,
      includeGitLogs: true,
      includeActionItems: true
    }
  } = params;

  // Extract key sentences
  const sentences = voiceTranscript
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const words = voiceTranscript.trim().split(/\s+/).filter(Boolean).length;

  const yesterdaySentences: string[] = [];
  const todaySentences: string[] = [];
  const blockerSentences: string[] = [];
  const generalNotes: string[] = [];

  sentences.forEach(s => {
    const lower = s.toLowerCase();
    if (
      lower.includes('yesterday') ||
      lower.includes('finished') ||
      lower.includes('fixed') ||
      lower.includes('completed') ||
      lower.includes('solved') ||
      lower.includes('spent')
    ) {
      yesterdaySentences.push(cleanSentence(s));
    } else if (
      lower.includes('today') ||
      lower.includes('working on') ||
      lower.includes('wrapping up') ||
      lower.includes('implementing') ||
      lower.includes('next') ||
      lower.includes('focus')
    ) {
      todaySentences.push(cleanSentence(s));
    } else if (
      lower.includes('block') ||
      lower.includes('waiting') ||
      lower.includes('risk') ||
      lower.includes('issue') ||
      lower.includes('stuck') ||
      lower.includes('delay')
    ) {
      blockerSentences.push(cleanSentence(s));
    } else {
      generalNotes.push(cleanSentence(s));
    }
  });

  // Extract smart action items from blockers
  const actionItems: ActionItem[] = deriveActionItems(blockerSentences, sentences);

  // Parse git commits
  const parsedCommits = gitLogs
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => {
      const match = l.match(/(?:commit\s+)?([a-f0-9]{7,8})\s+(.*)/i);
      return match ? { hash: match[1], msg: match[2] } : { hash: '', msg: l };
    });

  let content = '';
  let title = '';
  let summary = '';

  const { emojis, style, includeGitLogs, includeActionItems } = templateSettings;

  switch (format) {
    case 'standup': {
      title = `Daily Standup — ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
      summary = `Standup notes synthesized from ${words} spoken words across ${yesterdaySentences.length + todaySentences.length} workstreams.`;

      const yesterdayList = formatBullets(
        yesterdaySentences.length > 0
          ? yesterdaySentences
          : ['Refined backlog items and investigated task requirements.'],
        tone
      );

      const todayList = formatBullets(
        todaySentences.length > 0
          ? todaySentences
          : ['Proceeding with core service implementation and test cases.'],
        tone
      );

      const blockersList =
        blockerSentences.length > 0
          ? blockerSentences.map(b => (emojis ? `• ⚠️ ${b}` : `• [BLOCKER] ${b}`)).join('\n')
          : emojis ? '• 🟢 No blockers — smooth sailing!' : '• None reported.';

      const gitSection =
        includeGitLogs && parsedCommits.length > 0
          ? `\n\n*Recent Git Activity:*\n${parsedCommits.map(c => `• \`${c.hash}\` ${c.msg}`).join('\n')}`
          : '';

      const actionItemSection =
        includeActionItems && actionItems.length > 0
          ? `\n\n*Smart Action Items & Next Steps:*\n${actionItems.map(a => `[ ] ${a.task} (${a.priority.toUpperCase()})`).join('\n')}`
          : '';

      if (style === 'kanban') {
        content = `*Kanban Workstream Digest* | ${authorName}
*Date:* ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

${emojis ? '📦' : ''} *COMPLETED (Moved to Done)*
${yesterdayList}

${emojis ? '⚡' : ''} *WIP (Currently in Flight)*
${todayList}

${emojis ? '🛑' : ''} *EXPEDITE / BOTTLENECKS*
${blockersList}${gitSection}${actionItemSection}

---
_Spoken via Wispr Flow 🎙️ • Formatted with SprintPulse AI_`;
      } else if (style === 'async-remote') {
        content = `*Async Remote Check-In* | ${authorName}
*Date:* ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

${emojis ? '🚀' : ''} *What Shipped*
${yesterdayList}

${emojis ? '🎯' : ''} *Next Focus*
${todayList}

${emojis ? '💬' : ''} *Heads Up & Dependencies*
${blockersList}${gitSection}${actionItemSection}

---
_Spoken via Wispr Flow 🎙️ • Formatted with SprintPulse AI_`;
      } else {
        content = `*Daily Standup Update* | ${authorName}
*Date:* ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

${emojis ? '⏪' : ''} *Yesterday (Completed)*
${yesterdayList}

${emojis ? '⏩' : ''} *Today (In Progress)*
${todayList}

${emojis ? '🛑' : ''} *Blockers & Dependencies*
${blockersList}${gitSection}${actionItemSection}

---
_Spoken via Wispr Flow 🎙️ • Formatted with SprintPulse AI_`;
      }
      break;
    }

    case 'pr': {
      title = `PR: ${derivePrTitle(voiceTranscript, parsedCommits)}`;
      summary = `Production-ready pull request description covering architectural changes and testing checklist.`;

      const commitBullets =
        parsedCommits.length > 0
          ? parsedCommits.map(c => `- \`${c.hash || 'git'}\`: ${c.msg}`).join('\n')
          : '- Core architectural enhancements and logic updates.';

      const changesBullets = sentences.slice(0, 5).map(s => `- ${s}`).join('\n');

      content = `## 📋 Pull Request Summary
${voiceTranscript}

### 🛠️ Key Changes
${changesBullets}

### 📦 Linked Commits
${commitBullets}

### 🧪 Verification & Testing
- [x] Unit tests passed locally
- [x] Integration / E2E verification verified
- [x] Edge-case telemetry and error handling checked
- [ ] Staging verification before production release

### 🔍 Reviewer Notes
> **Note for reviewer:** Built and documented using voice dictation via **Wispr Flow**. Please verify boundary conditions.`;
      break;
    }

    case 'linear': {
      title = `Sprint Goal Update: ${deriveSprintGoal(voiceTranscript)}`;
      summary = `Sprint status snapshot with risk breakdown and delivery estimate for Jira / Linear.`;

      content = `### 🎯 Sprint Objective Progress
**Overall Health:** 🟢 On Track | **Confidence:** High (85%)

**Executive Summary:**
${voiceTranscript}

#### 📌 Task Status Breakdown
${yesterdaySentences.map(s => `- [x] **DONE**: ${s}`).join('\n')}
${todaySentences.map(s => `- [/] **IN PROGRESS**: ${s}`).join('\n')}
${blockerSentences.map(s => `- [!] **RISK / DEPENDENCY**: ${s}`).join('\n')}

${parsedCommits.length > 0 ? `#### 🔗 Code References\n${parsedCommits.map(c => `- Ref: \`${c.hash}\` - ${c.msg}`).join('\n')}\n` : ''}
#### ⏱️ ETA & Delivery Target
- Target Branch: \`main\` / \`release-candidate\`
- Estimated Deployment: End of current sprint cycle`;
      break;
    }

    case 'release': {
      title = `Release Notes v${getSemanticVersion()} (${new Date().toLocaleDateString()})`;
      summary = `Formatted markdown release changelog with categorised features, bugfixes and breaking changes.`;

      const features = parsedCommits.filter(c => c.msg.startsWith('feat') || c.msg.includes('add') || c.msg.includes('new'));
      const fixes = parsedCommits.filter(c => c.msg.startsWith('fix') || c.msg.includes('bug') || c.msg.includes('resolve'));
      const chores = parsedCommits.filter(c => !features.includes(c) && !fixes.includes(c));

      content = `# Release Notes — v${getSemanticVersion()} 🚀

## 🌟 Highlights
${sentences.slice(0, 2).map(s => `> ${s}`).join('\n>\n')}

### 🚀 New Features & Enhancements
${features.length > 0
  ? features.map(f => `- **${f.msg}** (\`${f.hash}\`)`).join('\n')
  : '- Enhanced responsiveness and core service processing workflows.'}

### 🐛 Bug Fixes & Resilience
${fixes.length > 0
  ? fixes.map(f => `- **${f.msg}** (\`${f.hash}\`)`).join('\n')
  : (yesterdaySentences.length > 0 ? yesterdaySentences.map(y => `- ${y}`).join('\n') : '- Addressed edge cases in cache invalidation and session lifecycles.')}

${chores.length > 0 ? `### 🧹 Maintenance & Refactoring\n${chores.map(c => `- ${c.msg} (\`${c.hash}\`)`).join('\n')}\n` : ''}
---
*Published automatically with SprintPulse AI • Powered by Wispr Flow*`;
      break;
    }

    case 'retro': {
      title = `Sprint Retrospective — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      summary = `Agile sprint retrospective covering 4 structured quadrants synthesized from spoken voice notes and git history.`;

      // Find shout-outs or mentions
      const mentions = voiceTranscript.match(/@(\w+)/g) || [];
      const uniqueMentions = Array.from(new Set(mentions));

      const shoutOuts = uniqueMentions.length > 0
        ? uniqueMentions.map(m => `• Kudos to ${m} for close collaboration, timely PR approvals, and cross-functional support!`).join('\n')
        : '• Kudos to the entire engineering team for unblocking deployment pipelines and maintaining high velocity!';

      const wellPoints = yesterdaySentences.length > 0
        ? yesterdaySentences.map(y => `• 🚀 ${y}`).join('\n')
        : '• 🚀 Maintained steady sprint velocity and addressed core platform priorities.';

      const bottleneckPoints = blockerSentences.length > 0
        ? blockerSentences.map(b => `• 🛑 ${b}`).join('\n')
        : '• 🛑 No catastrophic blockers; minor review latency before regression freezes.';

      const improvementPoints = actionItems.length > 0
        ? actionItems.map(a => `• 💡 [ACTION] ${a.task} (Priority: ${a.priority.toUpperCase()})`).join('\n')
        : '• 💡 Automate integration test flakiness detection in GitHub Actions CI.';

      content = `# 🔄 Agile Sprint Retrospective
**Facilitator:** ${authorName}
**Sprint Window:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
**Input Source:** Spoken Wispr Flow Transcripts (${words} words) & ${parsedCommits.length} Git Commits

---

### 🌟 1. What Went Exceptionally Well
${wellPoints}
${parsedCommits.length > 0 ? `*Key Git Highlights:* ${parsedCommits.slice(0, 3).map(c => `\`${c.hash}\` ${c.msg}`).join(', ')}` : ''}

### 🛑 2. Bottlenecks & Technical Debt Discovered
${bottleneckPoints}

### 💡 3. Actionable Process Improvements for Next Iteration
${improvementPoints}
${todaySentences.length > 0 ? todaySentences.map(t => `• 🎯 Target: ${t}`).join('\n') : ''}

### 🤝 4. Team Peer Shout-Outs & Kudos
${shoutOuts}

---
_Generated automatically with SprintPulse AI ⚡ • Voice-driven Agile Intelligence_`;
      break;
    }
  }

  const typingTimeSeconds = Math.round((words / 40) * 60);
  const speakingTimeSeconds = Math.round((words / 170) * 60);
  const timeSavedMinutes = Math.max(1, Math.round((typingTimeSeconds - speakingTimeSeconds) / 60));

  return {
    id: 'gen-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    format,
    title,
    content,
    summary,
    actionItems,
    stats: {
      words,
      tasksCount: yesterdaySentences.length + todaySentences.length,
      blockersCount: blockerSentences.length,
      speakingTimeSaved: `~${timeSavedMinutes} min saved`
    }
  };
}

function deriveActionItems(blockers: string[], allSentences: string[]): ActionItem[] {
  const items: ActionItem[] = [];

  blockers.forEach((blocker, idx) => {
    const lower = blocker.toLowerCase();
    if (lower.includes('review') || lower.includes('@')) {
      const match = blocker.match(/@(\w+)/);
      items.push({
        id: `ai-${idx}`,
        task: `Ping ${match ? `@${match[1]}` : 'assigned reviewer'} on Slack for PR approval`,
        priority: 'high'
      });
    } else if (lower.includes('access') || lower.includes('credential') || lower.includes('devops')) {
      items.push({
        id: `ai-${idx}`,
        task: 'File internal IT/Infra access ticket for staging credentials',
        priority: 'high'
      });
    } else if (lower.includes('bug') || lower.includes('edge case') || lower.includes('reproduce')) {
      items.push({
        id: `ai-${idx}`,
        task: 'Create minimal reproduction script and attach error telemetry',
        priority: 'medium'
      });
    } else {
      items.push({
        id: `ai-${idx}`,
        task: `Follow up on unblocking: "${blocker.slice(0, 45)}..."`,
        priority: 'medium'
      });
    }
  });

  if (items.length === 0 && allSentences.length > 2) {
    items.push({
      id: 'ai-default',
      task: 'Trigger staging regression test suite before release cutoff',
      priority: 'low'
    });
  }

  return items;
}

function cleanSentence(s: string): string {
  let cleaned = s.trim();
  cleaned = cleaned.replace(/^(so|okay|well|basically|um|hey team,?|quick update,?)\s+/i, '');
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

function formatBullets(items: string[], tone: Tone): string {
  if (tone === 'concise') {
    return items.map(item => `• ${item.split(',')[0]}.`).join('\n');
  }
  if (tone === 'executive') {
    return items.map(item => `• Delivered: ${item}`).join('\n');
  }
  return items.map(item => `• ${item}`).join('\n');
}

function derivePrTitle(transcript: string, commits: { msg: string }[]): string {
  if (commits.length > 0 && commits[0].msg) {
    return commits[0].msg;
  }
  const firstSentence = transcript.split('.')[0] || 'Feature Enhancement';
  return firstSentence.slice(0, 60);
}

function deriveSprintGoal(transcript: string): string {
  const match = transcript.match(/(?:sprint goal|focus|initiative|working on|implementing)\s+([^.]+)/i);
  return match ? match[1].trim() : 'Core Infrastructure & Service Stability';
}

function getSemanticVersion(): string {
  const date = new Date();
  return `1.${date.getMonth() + 1}.${date.getDate()}`;
}
