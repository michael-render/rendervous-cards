/**
 * Power Source Generator
 *
 * Generates a 2–3 word "Power Source" title from the user's motivation answer.
 *
 * Strategy:
 *  1. Identify the SPECIFIC motivation driver in the answer
 *  2. Generate a title that clearly reflects that exact driver
 *  3. If someone reads the answer and title side by side, the connection must feel obvious
 *
 * Titles should feel: specific, intentional, playful, card-worthy, clearly connected.
 * Titles should NOT feel: generic, abstract, interchangeable, cool-but-vague.
 */

import { pickFromSeed } from './seedUtils';

// ── Fine-grained motivation patterns ────────────────────────────────
// Each entry: [pattern, titles that CLEARLY reflect that specific motivation]
// Ordered from most specific → least specific so early matches win.

const MOTIVATION_PATTERNS: [RegExp, string[]][] = [
  // ── Joy / delight / making people happy ──
  [/(?:people|others?|everyone|audience|crowd)\s+(?:enjoy|hav(?:e|ing)\s+(?:a\s+)?(?:good|great|fun)|happy|smile|laugh|delight)/i,
    ['Crowd Delight', 'Joy Generator', 'Shared Joy', 'People Glow']],
  [/(?:enjoy|delight|joy|happiness)\s+(?:of|in|from)\s+(?:others|people|someone)/i,
    ['Joy Maker', 'Delight Engine', 'Shared Spark', 'Happy Signal']],
  [/(?:bring|spread|creat)\w*\s+(?:joy|happiness|delight|smiles|laughter)/i,
    ['Joy Bringer', 'Delight Crafter', 'Smile Spark', 'Happy Pulse']],
  [/(?:mak\w*|see\w*|watch\w*)\s+(?:people|others?|someone|them|everyone)\s+(?:happy|smile|laugh|light\s*up|glow|enjoy)/i,
    ['Joy Architect', 'Crowd Glow', 'Delight Spark', 'People Energy']],
  [/(?:joy|delight|happiness)/i,
    ['Joy Current', 'Delight Core', 'Happy Signal', 'Spark of Joy']],

  // ── Events / experiences / producing / hosting ──
  [/(?:event|show|concert|party|gather|festival|conference|meetup|performance)/i,
    ['Event Glow', 'Stage Spark', 'Crowd Energy', 'Live Pulse']],
  [/(?:produc|host|organiz|put\s+(?:on|together)|throw|run)\w*\s+(?:event|show|thing|experience)/i,
    ['Event Architect', 'Stage Builder', 'Experience Crafter', 'Show Runner']],
  [/(?:experience|moment|memor(?:y|ies))\s+(?:for|with|that)/i,
    ['Memory Maker', 'Moment Crafter', 'Experience Spark', 'Living Memory']],

  // ── Helping / supporting / enabling others ──
  [/help\w*\s+(?:people|others?|someone|team|folk|everybody|everyone)\s+(?:succeed|grow|thrive|win|level\s*up|reach|achiev|get\s+better)/i,
    ['Growth Fuel', 'Lift Signal', 'Success Spark', 'Rise Engine']],
  [/help\w*\s+(?:people|others?|someone|team)/i,
    ['Helper Core', 'Lift Engine', 'Support Pulse', 'People Fuel']],
  [/(?:support|empower|enable|uplift|encourage|cheer|champion|advocate)/i,
    ['Lift Signal', 'Champion Core', 'Support Spark', 'Empower Pulse']],
  [/(?:mentor|coach|guide|advise|counsel)/i,
    ['Guide Light', 'Mentor Pulse', 'Wisdom Spark', 'Coaching Core']],

  // ── Teaching / sharing knowledge ──
  [/(?:teach|educat|train|share\s+(?:knowledge|what\s+I|skills))/i,
    ['Knowledge Spark', 'Teaching Fire', 'Lesson Glow', 'Wisdom Share']],
  [/(?:pass\s+(?:on|along)|show.*(?:way|how|ropes))/i,
    ['Torch Passer', 'Way Shower', 'Path Light', 'Knowledge Bridge']],
  [/(?:learn|curious|discover|understand|figure.*out|knowledge)/i,
    ['Curiosity Engine', 'Deep Dive', 'Discovery Spark', 'Wonder Pulse']],

  // ── Building / creating / making / shipping ──
  [/(?:build|creat|mak|ship|craft|design|architect|construct|invent|prototype)\w*\s+(?:something|thing|product|tool|stuff|software|app|system)/i,
    ['Build Drive', 'Maker Core', 'Creation Pulse', 'Ship Signal']],
  [/(?:build|creat|mak|ship|craft)\w*\s+(?:from\s+scratch|new|cool|great|beautiful|useful)/i,
    ['Maker Spark', 'Build Glow', 'Creation Fire', 'Craft Engine']],
  [/(?:build|creat|mak|ship|craft|design|launch)/i,
    ['Builder Core', 'Maker Drive', 'Creation Signal', 'Craft Pulse']],

  // ── Problem solving / fixing / debugging ──
  [/(?:solv|fix|debug|untangl|troubleshoot|crack|figur)\w*\s+(?:hard|tough|complex|tricky|difficult|gnarly)\s+(?:problem|issue|bug|challenge)/i,
    ['Puzzle Cracker', 'Fix Mastery', 'Debug Wizard', 'Problem Slayer']],
  [/(?:solv|fix|debug|untangl|troubleshoot)\w*\s+(?:problem|issue|bug|challenge|puzzle)/i,
    ['Problem Solver', 'Fix Signal', 'Solution Spark', 'Debug Pulse']],
  [/(?:solv|fix|figur|challenge|puzzle|problem|debug)/i,
    ['Solver Core', 'Fix Drive', 'Problem Spark', 'Solution Engine']],

  // ── Bringing people together / community / connection ──
  [/(?:bring|pull|get)\w*\s+(?:people|team|folk|everyone|group)\s+(?:together|closer)/i,
    ['Gathering Force', 'Together Spark', 'Union Pulse', 'Circle Builder']],
  [/(?:communit|belong|togeth|collaborat|bond|tribe|fellowship)/i,
    ['Community Core', 'Together Signal', 'Bond Spark', 'Belonging Pulse']],
  [/(?:connect|relation|trust|team\s*work|partnership)/i,
    ['Connection Spark', 'Trust Signal', 'Bond Core', 'Team Pulse']],

  // ── Making people feel welcome / inclusion / belonging ──
  [/(?:welcom|inclus|safe\s+space|belong|comfort|at\s+home|seen\s+and\s+heard)/i,
    ['Welcome Signal', 'Safe Harbor', 'Belonging Glow', 'Open Door']],
  [/(?:care|kind|compassion|empathy|gentle|warm|nurtur)/i,
    ['Care Core', 'Warm Signal', 'Heart Pulse', 'Kindness Spark']],

  // ── Impact / making a difference / legacy ──
  [/(?:change|impact|differ)\w*\s+(?:the\s+)?(?:world|lives?|communit|societ|future)/i,
    ['Ripple Maker', 'Impact Pulse', 'Change Spark', 'Legacy Signal']],
  [/(?:impact|differ|matter|meaningful|purpose|mission|cause|legacy|contribut)/i,
    ['Impact Drive', 'Purpose Pulse', 'Mission Spark', 'Meaning Core']],

  // ── Progress / momentum / seeing results ──
  [/(?:progress|momentum|forward|results?|ship|launch|done|finish|complet|deliver)/i,
    ['Momentum Pulse', 'Progress Drive', 'Ship Signal', 'Done Engine']],
  [/(?:efficien|productiv|optimi|streamlin|automat)/i,
    ['Efficiency Spark', 'Flow Engine', 'Optimize Drive', 'Speed Pulse']],

  // ── Competition / winning / excellence ──
  [/(?:win|best|excell?|compet|top|first|beat|outperform)/i,
    ['Win Drive', 'Excellence Spark', 'Victory Pulse', 'Peak Signal']],
  [/(?:succeed|success|achiev|goal|ambit|recogni|award|accolade|prove)/i,
    ['Achievement Spark', 'Success Fuel', 'Goal Drive', 'Ambition Core']],

  // ── Mastery / depth / craft perfection ──
  [/(?:master|perfect|refin|hone|polish|craft|precision|disciplin|expert|depth)/i,
    ['Mastery Spark', 'Craft Depth', 'Precision Core', 'Skill Signal']],

  // ── Growth / evolution / becoming ──
  [/(?:grow|evolv|improv|better|transform|level\s*up|push\s+my)/i,
    ['Growth Pulse', 'Evolution Spark', 'Level-Up Drive', 'Becoming Core']],

  // ── Freedom / autonomy / independence ──
  [/(?:free|independ|autonom|own\s+path|self[\s-]direct|choice|my\s+way|liberty)/i,
    ['Freedom Spark', 'Own Path', 'Free Signal', 'Choice Drive']],

  // ── Stability / security / providing ──
  [/(?:secur|stab|safe|provid|reliab|protect|steady|foundation)/i,
    ['Steady Ground', 'Foundation Core', 'Anchor Drive', 'Security Pulse']],

  // ── Adventure / energy / fun / play ──
  [/(?:fun|play|adventur|excit|thrill|spontan|energy|alive|explor)/i,
    ['Adventure Spark', 'Play Pulse', 'Energy Core', 'Thrill Signal']],

  // ── Money / financial ──
  [/(?:money|earn|wealth|financ|pay|salary|reward|bonus)/i,
    ['Reward Drive', 'Earn Signal', 'Value Pulse', 'Reward Core']],

  // ── Leading / influencing / inspiring ──
  [/(?:lead|influenc|inspir|driv|motivat|rally|vision)/i,
    ['Inspire Signal', 'Lead Spark', 'Vision Drive', 'Rally Pulse']],
];

// ── Word-level fallback ─────────────────────────────────────────────
// If no pattern matched, extract the most meaningful noun/verb and build a title.

const ENERGY_VERBS: Record<string, string> = {
  help: 'Helper', build: 'Builder', create: 'Creator', make: 'Maker',
  teach: 'Teacher', learn: 'Learner', solve: 'Solver', fix: 'Fixer',
  connect: 'Connector', grow: 'Grower', lead: 'Leader', inspire: 'Inspirer',
  design: 'Designer', ship: 'Shipper', serve: 'Server', give: 'Giver',
  share: 'Sharer', explore: 'Explorer', discover: 'Discoverer',
  protect: 'Protector', mentor: 'Mentor', coach: 'Coach', guide: 'Guide',
  support: 'Supporter', empower: 'Empowerer', host: 'Host',
  produce: 'Producer', craft: 'Crafter', organize: 'Organizer',
  watch: 'Watcher', listen: 'Listener', care: 'Carer', nurture: 'Nurturer',
};

const ENERGY_NOUNS: Record<string, string> = {
  people: 'People', team: 'Team', community: 'Community',
  joy: 'Joy', delight: 'Delight', happiness: 'Happy',
  problem: 'Problem', challenge: 'Challenge', puzzle: 'Puzzle',
  impact: 'Impact', growth: 'Growth', progress: 'Progress',
  knowledge: 'Knowledge', idea: 'Idea', connection: 'Connection',
  trust: 'Trust', freedom: 'Freedom', adventure: 'Adventure',
  craft: 'Craft', excellence: 'Excellence', purpose: 'Purpose',
  beauty: 'Beauty', energy: 'Energy', spark: 'Spark',
  music: 'Music', art: 'Art', food: 'Food', code: 'Code',
  family: 'Family', friend: 'Friend', love: 'Love',
};

const SUFFIXES = ['Spark', 'Pulse', 'Core', 'Signal', 'Drive', 'Glow', 'Engine'];

const FINAL_FALLBACK = ['Quiet Fire', 'Steady Glow', 'Inner Spark', 'Deep Drive'];

/**
 * Generate a Power Source title from the user's motivation answer.
 *
 * The title must clearly reflect the specific motivation described.
 * If someone reads the answer and the title side by side,
 * the connection should feel obvious and intentional.
 */
export function generatePowerSource(motivation: string, seed: number): string {
  const text = motivation.trim();
  if (!text) return pickFromSeed(FINAL_FALLBACK, seed);

  // Step 1: Try pattern matching (most specific patterns first)
  for (const [pattern, titles] of MOTIVATION_PATTERNS) {
    if (pattern.test(text)) {
      return pickFromSeed(titles, seed);
    }
  }

  // Step 2: Word-level extraction fallback
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // Find the most meaningful verb
  let verbTitle: string | null = null;
  for (const word of words) {
    const stem = word.replace(/(?:ing|ed|s|er|tion|ment)$/, '');
    if (ENERGY_VERBS[stem] || ENERGY_VERBS[word]) {
      verbTitle = ENERGY_VERBS[stem] || ENERGY_VERBS[word];
      break;
    }
  }

  // Find the most meaningful noun
  let nounTitle: string | null = null;
  for (const word of words) {
    const clean = word.replace(/s$/, '');
    if (ENERGY_NOUNS[clean] || ENERGY_NOUNS[word]) {
      nounTitle = ENERGY_NOUNS[clean] || ENERGY_NOUNS[word];
      break;
    }
  }

  // Combine verb + suffix, or noun + suffix
  if (verbTitle && nounTitle) {
    return `${nounTitle} ${verbTitle}`;
  }
  if (verbTitle) {
    return `${verbTitle} ${pickFromSeed(SUFFIXES, seed)}`;
  }
  if (nounTitle) {
    return `${nounTitle} ${pickFromSeed(SUFFIXES, seed)}`;
  }

  // Step 3: Final fallback — extract a key word and pair it
  const meaningful = words.filter(w => w.length > 4 && !/^(about|would|could|should|really|always|never|thing|every|being|there|their|these|those|where|which|while|other|after|before|since|until|still|might|maybe)$/i.test(w));
  if (meaningful.length > 0) {
    const keyword = meaningful[0];
    const cap = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    return `${cap} ${pickFromSeed(SUFFIXES, seed)}`;
  }

  return pickFromSeed(FINAL_FALLBACK, seed);
}
