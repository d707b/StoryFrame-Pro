export type PanelCount = 9 | 12;

export interface ArtStyle {
  id: string;
  emoji: string;
  nameEn: string;
  nameAr: string;
  description: string;
}

export enum AppStep {
  WELCOME = 0,
  PANEL_COUNT = 1,
  STORY_INPUT = 2,
  STYLE_SELECTION = 3,
  GENERATING = 4,
  RESULT = 5,
}

export interface StoryState {
  panelCount: PanelCount | null;
  topic: string;
  selectedStyle: ArtStyle | null;
  customStyle: string;
  generatedPrompt: string;
}
