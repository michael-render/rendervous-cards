import { CardAnswers, TransformedCard, CardTheme, CARD_THEMES } from './types';

const ARCHETYPE_ADJS = ['Culture', 'Momentum', 'Systems', 'Experience', 'Chaos', 'Clarity', 'Vision', 'Impact', 'Stealth', 'Cosmic', 'Ember', 'Drift'];
const ARCHETYPE_NOUNS = ['Architect', 'Maker', 'Sorcerer', 'Alchemist', 'Coordinator', 'Catalyst', 'Weaver', 'Navigator', 'Warden', 'Sage', 'Herald', 'Ranger'];

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

// Each category's titles are tightly coupled to the motivation driver they represent.
// The title must feel like a distilled identity of the motivation — not decorative.
const POWER_SOURCES: Record<string, string[]> = {
  // Empowerment, uplift, amplification — motivated by lifting others
  uplift:      ['Collective Current', 'The Quiet Lift', 'Bridge Builder', 'Catalyst Engine'],
  // Togetherness, trust, belonging — motivated by community and connection
  connection:  ['Trust Engine', 'The Common Thread', 'Bond Core', 'Circle Keeper'],
  // Construction, foundation, invention — motivated by making things real
  creation:    ['The Forge Path', 'Foundation Drive', 'Momentum Core', 'Blueprint Engine'],
  // Depth, refinement, discipline — motivated by mastering hard things
  mastery:     ['Curiosity Engine', 'The Deep Dive', 'Precision Core', 'Infinite Lens'],
  // Ascent, competition, spotlight — motivated by recognition and winning
  ambition:    ['The Relentless Ascent', 'Victory Drive', 'Summit Engine', 'Apex Core'],
  // Legacy, meaning, contribution — motivated by making a difference
  purpose:     ['Ripple Maker', 'North Star Drive', 'The Long Game', 'Legacy Core'],
  // Structure, clarity, resolution — motivated by solving and fixing
  resolution:  ['Structural Grip', 'The Clean Cut', 'Logic Forge', 'Clarity Engine'],
  // Self-improvement, alignment, becoming — motivated by personal evolution
  evolution:   ['Inner Compass', 'Quiet Force', 'Alignment Drive', 'The Steady Arc'],
  // Vitality, spark, aliveness — motivated by joy and energy
  vitality:    ['Wildfire Spark', 'Radiant Loop', 'The Bright Signal', 'Energy Well'],
  // Autonomy, freedom, self-direction — motivated by independence
  autonomy:    ['Untamed Core', 'The Open Road', 'Sovereign Drive', 'Free Signal'],
  // Safety, stability, protection — motivated by security and reliability
  stability:   ['Anchor Core', 'The Steady Ground', 'Foundation Hold', 'Root Engine'],
  // Teaching, sharing, guiding — motivated by passing on knowledge
  guidance:    ['Torch Bearer', 'The Given Light', 'Signal Tower', 'Wisdom Bridge'],
};

const FALLBACK_ABILITIES = ['Hidden Talent', 'Secret Skill', 'Mystery Power', 'Wild Card'];
const FALLBACK_QUESTS = ['Challenge the Status Quo', 'Shake Up the Norm', 'Defy Convention'];
const FALLBACK_MOVES = ['Efficiency Blast', 'Productivity Punch', 'Power Surge'];
const FALLBACK_POWERS = ['The Quiet Climb', 'Steady Burn', 'Inner Forge', 'Silent Engine'];

function pickFromSeed(arr: string[], seed: number): string {
  return arr[Math.abs(seed) % arr.length];
}

function matchOrDefaultSeeded(input: string, patterns: [RegExp, string[]][], fallback: string[], seed: number): string {
  for (const [regex, results] of patterns) {
    if (regex.test(input)) return pickFromSeed(results, seed);
  }
  return pickFromSeed(fallback, seed);
}

function generateArchetype(role: string, motivation: string, seed: number): string {
  const hash = (role + motivation).split('').reduce((a, c) => a + c.charCodeAt(0), 0) + seed;
  const adj = ARCHETYPE_ADJS[hash % ARCHETYPE_ADJS.length];
  const noun = ARCHETYPE_NOUNS[(hash + 3) % ARCHETYPE_NOUNS.length];
  return `${adj} ${noun}`;
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

/**
 * Generates a Power Source title from the user's motivation answer.
 * 
 * Strategy: identify the ROOT DRIVER behind the answer, not surface keywords.
 * The output must feel like a distilled identity of the motivation.
 * If someone reads the Power Source and the original motivation side by side,
 * the connection should feel intentional and obvious.
 */
function generatePowerSource(motivation: string, seed: number): string {
  const lower = motivation.toLowerCase();

  // ── Uplift: motivated by helping others succeed, empowering, mentoring ──
  if (/help.*(succeed|grow|win)|empower|uplift|mentor|coach|guide|lift.*(up|other)|cheer.*(on|for)|advocate/i.test(lower))
    return pickFromSeed(POWER_SOURCES.uplift, seed);

  // ── Connection: motivated by community, belonging, togetherness ──
  if (/people|team|communit|connect|together|collaborat|belong|relationship|bond|tribe|family|friend/i.test(lower))
    return pickFromSeed(POWER_SOURCES.connection, seed);

  // ── Creation: motivated by building, making, inventing, shipping ──
  if (/build|creat|mak|design|craft|ship|architect|construct|invent|prototype|launch/i.test(lower))
    return pickFromSeed(POWER_SOURCES.creation, seed);

  // ── Mastery: motivated by depth, skill refinement, understanding deeply ──
  if (/master|learn|curio|understand|discover|explor|depth|refin|disciplin|study|skill|expert|craft.*perfect/i.test(lower))
    return pickFromSeed(POWER_SOURCES.mastery, seed);

  // ── Ambition: motivated by winning, recognition, being the best ──
  if (/win|success|achiev|goal|ambit|best|excel|top|first|recogni|compet|prove|spotlight|award|accolade/i.test(lower))
    return pickFromSeed(POWER_SOURCES.ambition, seed);

  // ── Purpose: motivated by meaning, legacy, making a difference ──
  if (/impact|change.*world|meaning|purpose|matter|differ|legacy|contribut|cause|mission|greater.good/i.test(lower))
    return pickFromSeed(POWER_SOURCES.purpose, seed);

  // ── Resolution: motivated by solving problems, fixing, figuring out ──
  if (/solv|problem|fix|figur|challenge|puzzle|debug|untangl|crack|troubleshoot|streamlin/i.test(lower))
    return pickFromSeed(POWER_SOURCES.resolution, seed);

  // ── Evolution: motivated by personal growth, becoming better ──
  if (/better|improv|evolv|progress|forward|push|grow.*self|self.improv|level.up|transform|becom/i.test(lower))
    return pickFromSeed(POWER_SOURCES.evolution, seed);

  // ── Vitality: motivated by joy, energy, passion, feeling alive ──
  if (/joy|fun|happy|love|excit|passion|energy|alive|thrill|adventur|play|spontan/i.test(lower))
    return pickFromSeed(POWER_SOURCES.vitality, seed);

  // ── Autonomy: motivated by freedom, independence, self-direction ──
  if (/free|independ|autonom|own.*path|self.direct|liberty|choice|control.*own|my.*way/i.test(lower))
    return pickFromSeed(POWER_SOURCES.autonomy, seed);

  // ── Stability: motivated by security, safety, providing ──
  if (/secur|stab|safe|provid|reliab|protect|comfort|steady|predictab|foundation/i.test(lower))
    return pickFromSeed(POWER_SOURCES.stability, seed);

  // ── Guidance: motivated by teaching, sharing knowledge, mentoring others ──
  if (/teach|share.*knowledge|educat|train|inspire.*other|show.*way|pass.*on|nurtur/i.test(lower))
    return pickFromSeed(POWER_SOURCES.guidance, seed);

  // ── Semantic fallback: try to infer the driver from support/help verbs ──
  if (/support|encourag|care|nurtur|listen/i.test(lower)) return pickFromSeed(POWER_SOURCES.uplift, seed);
  if (/think|analyz|reason|logic|strateg/i.test(lower)) return pickFromSeed(POWER_SOURCES.resolution, seed);
  if (/lead|influence|inspir|driv/i.test(lower)) return pickFromSeed(POWER_SOURCES.purpose, seed);
  if (/money|earn|wealth|financ|reward/i.test(lower)) return pickFromSeed(POWER_SOURCES.ambition, seed);

  return pickFromSeed(FALLBACK_POWERS, seed);
}

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

const ITEM_EMOJI_MAP: [RegExp, string][] = [
  [/book|novel|read/i, '📖'], [/guitar|music|ukulele/i, '🎸'], [/cat/i, '🐱'], [/dog/i, '🐶'],
  [/phone/i, '📱'], [/camera|photo/i, '📸'], [/headphone|earbuds|airpod/i, '🎧'], [/sunglasses|shades/i, '🕶️'],
  [/blanket|pillow/i, '🛏️'], [/coffee/i, '☕'], [/tea/i, '🍵'], [/wine|beer|drink/i, '🍷'],
  [/chocolate|candy|snack/i, '🍫'], [/journal|notebook|diary/i, '📓'], [/pen|pencil/i, '✏️'],
  [/knife|machete|sword/i, '🔪'], [/sunscreen|lotion/i, '🧴'], [/hammock/i, '🏖️'],
  [/fishing/i, '🎣'], [/surfboard|surf/i, '🏄'], [/soccer|football/i, '⚽'], [/basketball/i, '🏀'],
  [/paint|art|canvas/i, '🎨'], [/plant|seed|garden/i, '🌱'], [/map|compass/i, '🧭'],
  [/game|cards|board/i, '🎲'], [/puzzle/i, '🧩'], [/cook|pan|pot|spice/i, '🍳'],
  [/hot sauce|sauce|sriracha/i, '🌶️'], [/sketch|draw/i, '✏️'], [/laptop|computer/i, '💻'],
  [/speaker|radio/i, '🔊'], [/yoga|mat/i, '🧘'], [/hat|cap/i, '🧢'], [/shoe|sneaker/i, '👟'],
  [/ring|tube|float/i, '🛟'], [/teddy|stuffed|plush/i, '🧸'], [/candle/i, '🕯️'],
];

function itemToEmoji(item: string): string {
  for (const [regex, emoji] of ITEM_EMOJI_MAP) {
    if (regex.test(item)) return emoji;
  }
  if (/^\p{Emoji}/u.test(item)) return item.charAt(0);
  return '✨';
}

export function transformAnswers(answers: CardAnswers, themeIndex?: number, seed: number = 0): TransformedCard {
  const theme: CardTheme = CARD_THEMES[(themeIndex ?? Math.floor(Math.random() * CARD_THEMES.length)) % CARD_THEMES.length];

  const items = answers.desertIslandItems
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map(item => ({ label: item, emoji: itemToEmoji(item) }));

  while (items.length < 3) {
    items.push({ label: ['Snacks', 'Journal', 'Compass'][items.length], emoji: ['🍿', '📓', '🧭'][items.length] });
  }

  return {
    name: answers.name,
    archetypeTitle: generateArchetype(answers.role, answers.motivation, seed),
    specialAbility: generateSpecialAbility(answers.hobby, seed),
    sideQuest: generateSideQuest(answers.unpopularOpinion, seed),
    signatureMove: generateSignatureMove(answers.workHack, seed),
    powerSource: generatePowerSource(answers.motivation, seed),
    
    inventoryItems: items,
    theme,
  };
}
