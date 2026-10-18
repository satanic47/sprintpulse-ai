export type SprintFormat = 'standup' | 'pr' | 'linear' | 'release' | 'retro';

export type Tone = 'concise' | 'detailed' | 'bulleted' | 'executive';

export type StandupStyle = 'scrum' | 'kanban' | 'async-remote';

export interface ActionItem {
  id: string;
  task: string;
  suggestedOwner?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SamplePreset {
  id: string;
  title: string;
  role: string;
  description: string;
  voiceTranscript: string;
  gitLogs: string;
  recommendedFormat: SprintFormat;
}

export interface GeneratedOutput {
  id: string;
  timestamp: string;
  format: SprintFormat;
  title: string;
  content: string;
  summary: string;
  actionItems: ActionItem[];
  stats: {
    words: number;
    tasksCount: number;
    blockersCount: number;
    speakingTimeSaved: string;
  };
}

export interface TeamMemberUpdate {
  id: string;
  name: string;
  role: string;
  avatar: string;
  transcript: string;
  output?: GeneratedOutput;
}

export interface TemplateSettings {
  style: StandupStyle;
  emojis: boolean;
  includeGitLogs: boolean;
  includeActionItems: boolean;
}
