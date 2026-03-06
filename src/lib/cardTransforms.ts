import { CardAnswers, TransformedCard, CardTheme, CARD_THEMES } from './types';
import { formatAnswer } from './answerFormatter';
import { generateArchetype } from './archetypeGenerator';
import { itemToEmoji } from './itemEmojiMap';
import { generatePowerSource } from './powerSourceGenerator';
import { pickFromSeed } from './seedUtils';

/**
 * Pattern-based generators for card stats.
 * Archetype generation is handled by archetypeGenerator.ts
 */

const ABILITY_MAP: [RegExp, string[]][] = [
  [/bak/i, ['Cake Architect', 'Dough Whisperer', 'Pastry Sage']],
  [/cook/i, ['Flavor Master', 'Spice Alchemist', 'Kitchen Sorcerer']],
  [/music|band|sing|guitar|piano/i, ['Sound Shaper', 'Melody Weaver', 'Rhythm Sage']],
  [/run|marathon|jog/i, ['Endurance Runner', 'Pace Keeper', 'Mile Crusher']],
  [/paint|art|draw/i, ['Pixel Conjurer', 'Canvas Wizard', 'Color Alchemist']],
  [/read|book/i, ['Lore Keeper', 'Page Turner', 'Story Hoarder']],
  [/game|gaming/i, ['Quest Master', 'Loot Finder', 'Boss Slayer']],
  [/hik/i, ['Trail Blazer', 'Summit Chaser', 'Path Finder']],
  [/yoga|meditat/i, ['Zen Channeler', 'Inner Peace Pro', 'Balance Keeper']],
  [/photo/i, ['Light Catcher', 'Shutter Sage', 'Lens Master']],
  [/garden/i, ['Bloom Tender', 'Green Thumb', 'Plant Whisperer']],
  [/danc/i, ['Rhythm Rider', 'Dance Commander', 'Groove Master']],
  [/climb/i, ['Summit Seeker', 'Wall Crusher', 'Grip Master']],
  [/swim/i, ['Wave Dancer', 'Aqua Glider', 'Deep Diver']],
  [/write|blog|journal/i, ['Word Smith', 'Ink Slinger', 'Prose Crafter']],
  [/travel/i, ['World Walker', 'Globe Trotter', 'Horizon Chaser']],
  [/craft|diy|knit|sew/i, ['Craft Weaver', 'Stitch Wizard', 'DIY Sage']],
  [/code|program|hack/i, ['Code Mystic', 'Bug Slayer', 'Stack Overflow Sage']],
  [/surf/i, ['Wave Rider', 'Swell Chaser', 'Barrel Master']],
  [/ski|snowboard/i, ['Frost Glider', 'Powder Hound', 'Slope Shredder']],
];

const QUEST_PATTERNS: [RegExp, string[]][] = [
  [/pizza/i, ['Rid the World of Pizza', 'Pizza Abolition League', 'Anti-Pizza Crusade']],
  [/meeting/i, ['Shorten Every Meeting', 'Meeting Minimizer', 'Calendar Liberator']],
  [/pineapple/i, ['Pineapple All the Things', 'Tropical Takeover', 'Pineapple Evangelist']],
  [/coffee/i, ['Ban All Coffee', 'Caffeine-Free Future', 'Decaf Revolution']],
  [/email/i, ['Inbox Zero Forever', 'Email Eliminator', 'Inbox Liberator']],
  [/monday/i, ['Abolish Mondays', 'Monday Destroyer', 'Weekend Extender']],
  [/remote/i, ['Remote Everything', 'Office Abolisher', 'WFH Champion']],
  [/slack/i, ['Silence All Pings', 'Notification Nullifier', 'DND Enforcer']],
  [/tuna|fish/i, ['Convert Everyone to Tuna', 'Fish Evangelist', 'Seafood Crusader']],
  [/gross|overrated|bad|worst/i, ['Rid the World of It', 'Cancel It Forever', 'Banish the Cringe']],
  [/best|great|love/i, ['Spread the Gospel', 'Hype It Everywhere', 'Convert the Masses']],
];

const MOVE_PATTERNS: [RegExp, string[]][] = [
  [/calendar|schedule/i, ['Calendar Tetris', 'Schedule Slam', 'Time Block Blitz']],
  [/template/i, ['Template Mastery', 'Copy-Paste Fury', 'Template Tornado']],
  [/shortcut|keyboard/i, ['Shortcut Surge', 'Hotkey Hurricane', 'Keystroke Storm']],
  [/automat/i, ['Auto-Pilot Mode', 'Bot Army Deploy', 'Automation Avalanche']],
  [/list|todo/i, ['List Launcher', 'Checkbox Blitz', 'Todo Tsunami']],
  [/focus|pomodoro/i, ['Focus Beam', 'Deep Work Dive', 'Flow State Slam']],
  [/note/i, ['Note Ninja', 'Scribble Strike', 'Notation Fury']],
  [/spreadsheet|excel/i, ['Spreadsheet Sorcery', 'Cell Slam', 'Formula Fury']],
  [/ai|gpt|chatgpt/i, ['AI Whisperer', 'Prompt Punch', 'Neural Strike']],
  [/block|time.?block/i, ['Time Fortress', 'Block Barricade', 'Schedule Shield']],
];

const FALLBACK_ABILITIES = ['Hidden Talent', 'Secret Skill', 'Mystery Power', 'Wild Card'];
const FALLBACK_QUESTS = ['Challenge the Status Quo', 'Shake Up the Norm', 'Defy Convention'];
const FALLBACK_MOVES = ['Efficiency Blast', 'Productivity Punch', 'Power Surge'];

// pickFromSeed is now imported from seedUtils

function matchOrDefaultSeeded(input: string, patterns: [RegExp, string[]][], fallback: string[], seed: number): string {
  for (const [regex, results] of patterns) {
    if (regex.test(input)) return pickFromSeed(results, seed);
  }
  return pickFromSeed(fallback, seed);
}


function generateSideQuest(opinion: string, seed: number): string {
  return matchOrDefaultSeeded(opinion, QUEST_PATTERNS, FALLBACK_QUESTS, seed);
}

// Fallback for side quest when no pattern matches and we have words
function generateSideQuestFallback(opinion: string, seed: number): string {
  const words = opinion.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 2) {
    const verbs = ['Eliminate All', 'Champion All', 'Enforce', 'Conquer', 'Overthrow', 'Reclaim'];
    const verb = pickFromSeed(verbs, seed);
    const subject = words.filter(w => !/^(is|are|the|a|an|my|i|it|be|to|of|in|on|so|do)$/i.test(w)).slice(0, 2).join(' ');
    return `${verb} ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
  }
  return pickFromSeed(FALLBACK_QUESTS, seed);
}

function generateSignatureMove(hack: string, seed: number): string {
  return matchOrDefaultSeeded(hack, MOVE_PATTERNS, FALLBACK_MOVES, seed);
}

// generatePowerSource is now imported from powerSourceGenerator

function generateSpecialAbility(hobby: string, seed: number): string {
  for (const [regex, results] of ABILITY_MAP) {
    if (regex.test(hobby)) return pickFromSeed(results, seed);
  }
  const words = hobby.split(' ').filter(w => w.length > 3).slice(0, 2);
  if (words.length >= 1) {
    const suffixes = ['Pro', 'Master', 'Wizard', 'Sage'];
    return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} ${pickFromSeed(suffixes, seed)}`;
  }
  return pickFromSeed(FALLBACK_ABILITIES, seed);
}


export function transformAnswers(answers: CardAnswers, themeIndex?: number, seed: number = 0): TransformedCard {
  const theme: CardTheme = CARD_THEMES[(themeIndex ?? Math.floor(Math.random() * CARD_THEMES.length)) % CARD_THEMES.length];

  const items = answers.desertIslandItems
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map(item => ({ label: formatAnswer(item).replace(/[.!]$/, ''), emoji: itemToEmoji(item) }));

  while (items.length < 3) {
    items.push({ label: ['Snacks', 'Journal', 'Compass'][items.length], emoji: ['🍿', '📓', '🧭'][items.length] });
  }

  return {
    name: answers.name,
    archetypeTitle: generateArchetype(answers.role, seed),
    specialAbility: generateSpecialAbility(answers.hobby, seed),
    specialAbilityDetail: formatAnswer(answers.hobby),
    sideQuest: generateSideQuest(answers.unpopularOpinion, seed),
    sideQuestDetail: formatAnswer(answers.unpopularOpinion),
    signatureMove: generateSignatureMove(answers.workHack, seed),
    signatureMoveDetail: formatAnswer(answers.workHack),
    powerSource: generatePowerSource(answers.motivation, seed),
    powerSourceDetail: formatAnswer(answers.motivation),
    
    inventoryItems: items,
    theme,
  };
}
