export interface CardAnswers {
  name: string;
  role: string;
  hobby: string;
  unpopularOpinion: string;
  workHack: string;
  
  desertIslandItems: string;
  mundaneSuperpower: string;
  motivation: string;
  photoUrl?: string;
}

export interface InventoryItem {
  label: string;
  emoji: string;
}

export interface TransformedCard {
  name: string;
  archetypeTitle: string;
  specialAbility: string;
  specialAbilityDetail: string;
  sideQuest: string;
  sideQuestDetail: string;
  signatureMove: string;
  signatureMoveDetail: string;
  powerSource: string;
  powerSourceDetail: string;
  
  inventoryItems: InventoryItem[];
  theme: CardTheme;
}

export type CardTheme = 'coral' | 'mint' | 'sky' | 'lavender' | 'peach';

export const CARD_THEMES: CardTheme[] = ['coral', 'mint', 'sky', 'lavender', 'peach'];

export const THEME_GRADIENTS: Record<CardTheme, { from: string; to: string; accent: string }> = {
  coral: { from: 'from-coral-light', to: 'to-pink-light', accent: 'coral' },
  mint: { from: 'from-mint-light', to: 'to-green-light', accent: 'mint' },
  sky: { from: 'from-sky-light', to: 'to-lavender-light', accent: 'sky' },
  lavender: { from: 'from-lavender-light', to: 'to-pink-light', accent: 'lavender' },
  peach: { from: 'from-peach-light', to: 'to-coral-light', accent: 'peach' },
};
