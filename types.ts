
export enum AppStep {
  UPLOAD = 'UPLOAD',
  SIZE_SELECTION = 'SIZE_SELECTION',
  MODE_SELECTION = 'MODE_SELECTION',
  USER_PROMPT_INPUT = 'USER_PROMPT_INPUT',
  SYSTEM_DIRECTION = 'SYSTEM_DIRECTION',
  PROMPT_PREVIEW = 'PROMPT_PREVIEW',
  SHOT_TYPE = 'SHOT_TYPE',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  SESSION_END = 'SESSION_END'
}

export enum ImageSize {
  SQUARE = '1:1',
  PORTRAIT = '4:5',
  REEL = '9:16',
  LANDSCAPE = '16:9'
}

export enum PromptMode {
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

export enum CreativeDirection {
  SAFE_CLEAN = 'Safe / Clean Commercial',
  BOLD_IMPACT = 'Bold / High-Impact Ad',
  LIFESTYLE = 'Lifestyle / Natural',
  EXPERIMENTAL = 'Experimental / Creative'
}

export enum ShotType {
  CLOSE_UP = 'Close-up / Product Focus',
  LIFESTYLE_INTERACTION = 'Lifestyle / Model Interaction',
  ACTION = 'Action / Motion Shot',
  HERO = 'Hero / Ad Key Visual'
}

export interface SessionState {
  productImage: string | null;
  modelImage: string | null;
  selectedSize: ImageSize | null;
  promptMode: PromptMode | null;
  userPrompt: string | null;
  systemPrompt: string | null;
  creativeDirection: CreativeDirection | null;
  shotType: ShotType | null;
  generatedImageUrl: string | null;
}
