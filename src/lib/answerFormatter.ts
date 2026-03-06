/**
 * Light-touch answer formatter.
 *
 * Goal: clean up the user's answer for display without breaking grammar or meaning.
 * Rules:
 *  - Strip common filler prefixes ("I like to", "I love", etc.) ONLY when safe
 *  - Fix capitalisation, punctuation, and obvious typos
 *  - Preserve articles, pronouns, possessives, and helper words
 *  - Convert the leading verb to gerund form when filler was stripped
 *  - Never drop words or create fragments
 *  - End with a period (single item) or exclamation (multiple items)
 */

// ── Filler stripping ────────────────────────────────────────────────

/**
 * Attempt to strip a filler prefix and return the remainder.
 * Returns null if stripping would produce an awkward fragment.
 */
const FILLER_RX = /^(?:i\s+(?:really\s+)?(?:like|love|enjoy|adore)\s+(?:to\s+)?)/i;

function tryStripFiller(text: string): { stripped: string; didStrip: boolean } {
  const match = text.match(FILLER_RX);
  if (!match) return { stripped: text, didStrip: false };

  const remainder = text.slice(match[0].length).trim();
  // Only strip if what's left is substantial (≥ 2 words or ≥ 6 chars)
  if (remainder.length < 6 && remainder.split(/\s+/).length < 2) {
    return { stripped: text, didStrip: false };
  }
  return { stripped: remainder, didStrip: true };
}

// ── Gerund helpers ──────────────────────────────────────────────────

const IRREGULAR_GERUNDS: Record<string, string> = {
  run: 'running', swim: 'swimming', sit: 'sitting', get: 'getting',
  put: 'putting', cut: 'cutting', hit: 'hitting', set: 'setting',
  win: 'winning', begin: 'beginning', plan: 'planning', shop: 'shopping',
  stop: 'stopping', travel: 'traveling', die: 'dying', lie: 'lying',
  tie: 'tying', make: 'making', bake: 'baking', take: 'taking',
  come: 'coming', have: 'having', give: 'giving', live: 'living',
  write: 'writing', ride: 'riding', drive: 'driving', create: 'creating',
  dance: 'dancing', hike: 'hiking', bike: 'biking', solve: 'solving',
  explore: 'exploring', use: 'using', move: 'moving', serve: 'serving',
  leave: 'leaving', manage: 'managing', organize: 'organizing',
  change: 'changing', hope: 'hoping', care: 'caring', share: 'sharing',
  inspire: 'inspiring', guide: 'guiding', host: 'hosting',
  go: 'going', do: 'doing', sing: 'singing', bring: 'bringing',
  think: 'thinking', eat: 'eating', drink: 'drinking', play: 'playing',
  watch: 'watching', read: 'reading', help: 'helping', work: 'working',
  cook: 'cooking', build: 'building', teach: 'teaching', learn: 'learning',
  hang: 'hanging', stick: 'sticking', spend: 'spending',
};

function toGerund(verb: string): string {
  const lower = verb.toLowerCase();
  if (lower.endsWith('ing')) return lower;
  if (IRREGULAR_GERUNDS[lower]) return IRREGULAR_GERUNDS[lower];
  if (lower.endsWith('e') && !lower.endsWith('ee')) return lower.slice(0, -1) + 'ing';
  if (/^[a-z]+[aeiou][bcdfghjklmnpqrstvwxyz]$/.test(lower) && lower.length <= 5) {
    return lower + lower[lower.length - 1] + 'ing';
  }
  return lower + 'ing';
}

/**
 * If the first word is a bare infinitive verb, convert it to gerund.
 * This is ONLY called after filler was stripped (e.g. "cook gourmet meals" → "cooking gourmet meals").
 */
const SKIP_WORDS = new Set([
  'to', 'the', 'a', 'an', 'my', 'our', 'their', 'his', 'her', 'its',
  'this', 'that', 'some', 'any', 'all', 'no', 'not', 'and', 'or', 'but',
  'in', 'on', 'at', 'by', 'for', 'of', 'up', 'out', 'off', 'with',
  'just', 'also', 'very', 'really', 'so', 'too', 'be', 'is', 'are',
]);

function gerundifyLeadingVerb(text: string): string {
  const words = text.split(/\s+/);
  if (words.length === 0) return text;

  // Strip a leading "to" (bare infinitive marker) before gerundifying
  if (words[0].toLowerCase() === 'to' && words.length > 1) {
    words.shift();
  }

  const first = words[0].toLowerCase();
  // Already gerund — leave it
  if (first.endsWith('ing')) return words.join(' ');

  // Skip non-verb words
  if (SKIP_WORDS.has(first)) return words.join(' ');

  // Check if it looks like a known verb
  if (IRREGULAR_GERUNDS[first] || /^[a-z]{2,8}$/.test(first)) {
    words[0] = toGerund(first);
    return words.join(' ');
  }
  return words.join(' ');
}

// ── Spell-check helpers ─────────────────────────────────────────────

/**
 * Common misspellings → corrections.
 * Only includes words where the intended word is unambiguous.
 * Unknown words are left as-is to preserve names, slang, etc.
 */
const COMMON_MISSPELLINGS: Record<string, string> = {
  // a
  abandonned: 'abandoned', aberation: 'aberration', abilty: 'ability',
  abondance: 'abundance', absense: 'absence', absolutly: 'absolutely',
  abstraktion: 'abstraction', abundent: 'abundant', accademic: 'academic',
  accedentally: 'accidentally', acceptible: 'acceptable', accessable: 'accessible',
  accidentaly: 'accidentally', accomodate: 'accommodate', acommodate: 'accommodate',
  accompanyed: 'accompanied', accomplise: 'accomplish', accountabilty: 'accountability',
  accurracy: 'accuracy', accross: 'across', acerage: 'acreage',
  acheive: 'achieve', achive: 'achieve', acknowlege: 'acknowledge',
  acquaintence: 'acquaintance', acquiantance: 'acquaintance', aquisition: 'acquisition',
  adaquate: 'adequate', addionally: 'additionally', adress: 'address',
  adresing: 'addressing', advantagous: 'advantageous', advertisment: 'advertisement',
  advizable: 'advisable', agressive: 'aggressive', agreeement: 'agreement',
  alledge: 'allege', alot: 'a lot', amatuer: 'amateur', amature: 'amateur',
  ammount: 'amount', analasis: 'analysis', analize: 'analyze',
  anerexia: 'anorexia', anniversery: 'anniversary', annoucement: 'announcement',
  anomoly: 'anomaly', anonimous: 'anonymous', answar: 'answer',
  aparent: 'apparent', apparantly: 'apparently', apperance: 'appearance',
  applicabel: 'applicable', apreciate: 'appreciate', apropriate: 'appropriate',
  aquire: 'acquire', arcitecture: 'architecture', arguement: 'argument',
  arival: 'arrival', artical: 'article', assasination: 'assassination',
  assesment: 'assessment', assistence: 'assistance', assoicate: 'associate',
  athiest: 'atheist', atmospher: 'atmosphere', attatchment: 'attachment',
  attendence: 'attendance', attension: 'attention', authoritive: 'authoritative',
  availible: 'available', awfull: 'awful', awkard: 'awkward',
  // b
  balence: 'balance', bandwith: 'bandwidth', bankrupcy: 'bankruptcy',
  basicly: 'basically', beatiful: 'beautiful', beautifull: 'beautiful',
  becuase: 'because', beacuse: 'because', becasue: 'because', begining: 'beginning',
  behavor: 'behavior', beleive: 'believe', belive: 'believe',
  benificial: 'beneficial', benifit: 'benefit', bizzare: 'bizarre',
  bouyant: 'buoyant', boundry: 'boundary', breif: 'brief',
  brillant: 'brilliant', brocolli: 'broccoli', buisness: 'business',
  bussiness: 'business', buget: 'budget', buletin: 'bulletin',
  buracracy: 'bureaucracy', burgler: 'burglar',
  // c
  cafateria: 'cafeteria', calander: 'calendar', calandar: 'calendar',
  campain: 'campaign', cancelation: 'cancellation', candidite: 'candidate',
  capible: 'capable', catagory: 'category', cauhgt: 'caught',
  cematery: 'cemetery', censur: 'censor', certian: 'certain',
  chalenge: 'challenge', charactor: 'character', childern: 'children',
  cieling: 'ceiling', circut: 'circuit', circumfrence: 'circumference',
  colaborate: 'collaborate', collegues: 'colleagues', colleages: 'colleagues',
  collaegues: 'colleagues', collegaues: 'colleagues', colum: 'column',
  comming: 'coming', commited: 'committed', commitee: 'committee',
  communty: 'community', comparision: 'comparison', compatable: 'compatible',
  compitition: 'competition', completly: 'completely', comprhension: 'comprehension',
  concious: 'conscious', condtion: 'condition', conferance: 'conference',
  confedence: 'confidence', congradulations: 'congratulations',
  connecton: 'connection', conquor: 'conquer', consciense: 'conscience',
  consequnce: 'consequence', consistant: 'consistent', constently: 'constantly',
  constrainst: 'constraints', contaiminate: 'contaminate', contempory: 'contemporary',
  continously: 'continuously', contraversy: 'controversy',
  convienent: 'convenient', conveniant: 'convenient', copywrite: 'copyright',
  corilation: 'correlation', correspondance: 'correspondence', councelling: 'counseling',
  counterfiet: 'counterfeit', couragous: 'courageous', crediblity: 'credibility',
  critisism: 'criticism', cruical: 'crucial', curiousity: 'curiosity',
  curriculm: 'curriculum', custumer: 'customer',
  // d
  databage: 'database', decieve: 'deceive', decison: 'decision',
  decleration: 'declaration', defendent: 'defendant', definate: 'definite',
  definately: 'definitely', definitly: 'definitely', defintely: 'definitely',
  democrasy: 'democracy', demostrate: 'demonstrate', dependancy: 'dependency',
  deposite: 'deposit', desparate: 'desperate', develope: 'develop',
  developement: 'development', dialoge: 'dialogue', dictionery: 'dictionary',
  differant: 'different', diffrence: 'difference', dilemna: 'dilemma',
  dilligence: 'diligence', dimention: 'dimension', dinasaur: 'dinosaur',
  disapline: 'discipline', dissapear: 'disappear', dissapoint: 'disappoint',
  disasterous: 'disastrous', discribe: 'describe', dispaly: 'display',
  distribusion: 'distribution', diversty: 'diversity', documnet: 'document',
  dominent: 'dominant', dosent: 'doesn\'t', dramaticly: 'dramatically',
  // e
  ealier: 'earlier', ecstacy: 'ecstasy', efficency: 'efficiency',
  efford: 'effort', eigth: 'eighth', elegable: 'eligible',
  embarass: 'embarrass', embarras: 'embarrass', emergancy: 'emergency',
  emision: 'emission', emotinal: 'emotional', emphisis: 'emphasis',
  employe: 'employee', encoragement: 'encouragement', endever: 'endeavor',
  enginering: 'engineering', enormus: 'enormous', enterpreneur: 'entrepreneur',
  enthusiam: 'enthusiasm', entirly: 'entirely', enviroment: 'environment',
  enviornment: 'environment', equiptment: 'equipment', equivelant: 'equivalent',
  erronious: 'erroneous', essense: 'essence', esential: 'essential',
  establised: 'established', evalution: 'evaluation', eventualy: 'eventually',
  evidance: 'evidence', exagerate: 'exaggerate', examinaton: 'examination',
  excelent: 'excellent', excercise: 'exercise', exhilerate: 'exhilarate',
  existance: 'existence', expecially: 'especially', expediant: 'expedient',
  experiance: 'experience', exprience: 'experience', explantion: 'explanation',
  expresion: 'expression', extravagent: 'extravagant', extremly: 'extremely',
  // f
  facinate: 'fascinate', facilites: 'facilities', familar: 'familiar',
  fasinating: 'fascinating', favourable: 'favorable', feasability: 'feasibility',
  Febuary: 'February', firey: 'fiery', finaly: 'finally',
  financal: 'financial', flourescent: 'fluorescent', fluctuaton: 'fluctuation',
  forcast: 'forecast', foriegn: 'foreign', formallly: 'formally',
  formidible: 'formidable', formuler: 'formula', fortunatly: 'fortunately',
  fourty: 'forty', fraternaty: 'fraternity', freind: 'friend',
  frequantly: 'frequently', frustraion: 'frustration', fulfil: 'fulfill',
  fullfill: 'fulfill', funcional: 'functional', fundemental: 'fundamental',
  // g
  garantee: 'guarantee', garentee: 'guarantee', generaly: 'generally',
  genious: 'genius', geneology: 'genealogy', genuin: 'genuine',
  goverment: 'government', governmnet: 'government', gaurd: 'guard',
  guidence: 'guidance', grammer: 'grammar', gratefull: 'grateful',
  grevious: 'grievous', guage: 'gauge', guerrila: 'guerrilla',
  // h
  halusinate: 'hallucinate', happend: 'happened', harrass: 'harass',
  headquaters: 'headquarters', heighth: 'height', heirarchy: 'hierarchy',
  hemorrage: 'hemorrhage', hesistant: 'hesitant', hinderance: 'hindrance',
  hipocrite: 'hypocrite', horizonal: 'horizontal', hosptial: 'hospital',
  humourous: 'humorous', hygene: 'hygiene', hypathetical: 'hypothetical',
  // i
  idealy: 'ideally', identifed: 'identified', ignorence: 'ignorance',
  ilegal: 'illegal', imaginery: 'imaginary', imanent: 'imminent',
  immediatly: 'immediately', imediately: 'immediately', implemtation: 'implementation',
  improtant: 'important', inagurate: 'inaugurate', incidently: 'incidentally',
  incredable: 'incredible', independant: 'independent', indespensable: 'indispensable',
  infalible: 'infallible', influense: 'influence', infomation: 'information',
  infrastructer: 'infrastructure', inheritence: 'inheritance', initaly: 'initially',
  inocent: 'innocent', inovation: 'innovation', insistant: 'insistent',
  insurence: 'insurance', inteligence: 'intelligence', intensly: 'intensely',
  intresting: 'interesting', intersting: 'interesting', interprate: 'interpret',
  interveiw: 'interview', introvertd: 'introverted', investigaton: 'investigation',
  involvment: 'involvement', iresistible: 'irresistible', iregular: 'irregular',
  irritabel: 'irritable', issolate: 'isolate',
  // j-k
  jeapardy: 'jeopardy', jewlery: 'jewelry', journy: 'journey',
  judgement: 'judgment', jurisdicion: 'jurisdiction', justifed: 'justified',
  kindergarden: 'kindergarten', knowlege: 'knowledge', knowledgable: 'knowledgeable',
  // l
  labratory: 'laboratory', languge: 'language', laison: 'liaison', liason: 'liaison',
  leasure: 'leisure', legitimite: 'legitimate', lenght: 'length',
  libarary: 'library', libary: 'library', licance: 'license', liscense: 'license',
  lightening: 'lightning', likley: 'likely', limosine: 'limousine',
  litature: 'literature', lonliness: 'loneliness', luxery: 'luxury',
  // m
  magizine: 'magazine', magnificant: 'magnificent', maintainance: 'maintenance',
  majoriy: 'majority', managment: 'management', maneuvre: 'maneuver',
  manifacture: 'manufacture', mathmatics: 'mathematics', medevil: 'medieval',
  medcine: 'medicine', memento: 'memento', millenium: 'millennium',
  millitary: 'military', minature: 'miniature', mischevious: 'mischievous',
  mispell: 'misspell', mispelled: 'misspelled', misteek: 'mistake',
  moniter: 'monitor', morgage: 'mortgage', mountian: 'mountain',
  moustach: 'mustache', multible: 'multiple', munisipal: 'municipal',
  mysterous: 'mysterious',
  // n
  naritive: 'narrative', naturaly: 'naturally', neccessary: 'necessary',
  necesary: 'necessary', negotation: 'negotiation', neigbor: 'neighbor',
  neighbour: 'neighbor', nerveous: 'nervous', netwerk: 'network',
  nuance: 'nuance', noticable: 'noticeable', notifacation: 'notification',
  nuculer: 'nuclear', nuisanse: 'nuisance',
  // o
  obediant: 'obedient', obstacel: 'obstacle', obvioulsy: 'obviously',
  occassion: 'occasion', occurence: 'occurrence', occured: 'occurred',
  offical: 'official', oficial: 'official', omision: 'omission',
  opponant: 'opponent', oportunity: 'opportunity', optomistic: 'optimistic',
  orchastra: 'orchestra', ordinariy: 'ordinary', orginal: 'original',
  outragous: 'outrageous', overhere: 'over here',
  // p
  panicced: 'panicked', paralel: 'parallel', parliment: 'parliament',
  particurly: 'particularly', partisipate: 'participate', passtime: 'pastime',
  pateint: 'patient', peice: 'piece', perceive: 'perceive',
  percentege: 'percentage', performence: 'performance', permanant: 'permanent',
  permision: 'permission', peronal: 'personal', perseverence: 'perseverance',
  persistant: 'persistent', personel: 'personnel', persue: 'pursue',
  perticuler: 'particular', pessimisim: 'pessimism', phenomenom: 'phenomenon',
  philosphy: 'philosophy', phisical: 'physical', plagerism: 'plagiarism',
  plasure: 'pleasure', plausable: 'plausible', pnuemonia: 'pneumonia',
  poisen: 'poison', politican: 'politician', posession: 'possession',
  possiblity: 'possibility', potatos: 'potatoes', practicly: 'practically',
  preceed: 'precede', precidence: 'precedence', predesessor: 'predecessor',
  prefrence: 'preference', pregnent: 'pregnant', prejedice: 'prejudice',
  preperation: 'preparation', presance: 'presence', prestigous: 'prestigious',
  previus: 'previous', primative: 'primitive', privelege: 'privilege',
  probaly: 'probably', proceedure: 'procedure', proffesional: 'professional',
  profesional: 'professional', proficent: 'proficient', prominant: 'prominent',
  pronounciation: 'pronunciation', propoganda: 'propaganda', prosparity: 'prosperity',
  protien: 'protein', provicial: 'provincial', psycology: 'psychology',
  publically: 'publicly', puplish: 'publish', purposly: 'purposely',
  // q-r
  qualifed: 'qualified', quantaty: 'quantity', quarentine: 'quarantine',
  questionaire: 'questionnaire', realy: 'really', reasonible: 'reasonable',
  rebelion: 'rebellion', reccommend: 'recommend', recieve: 'receive',
  reccomend: 'recommend', recomend: 'recommend', recognise: 'recognize',
  reconize: 'recognize', refered: 'referred', referance: 'reference',
  rehersal: 'rehearsal', relevent: 'relevant', religous: 'religious',
  reluctent: 'reluctant', remeber: 'remember', remberance: 'remembrance',
  rennovation: 'renovation', repitition: 'repetition', representive: 'representative',
  repuation: 'reputation', requirment: 'requirement', resemblence: 'resemblance',
  resevoir: 'reservoir', resistence: 'resistance', resorces: 'resources',
  resouces: 'resources', resourses: 'resources', responce: 'response',
  responsable: 'responsible', restarunt: 'restaurant', restaurent: 'restaurant',
  reveiw: 'review', revolusion: 'revolution', ridiculus: 'ridiculous',
  rythm: 'rhythm', rediculous: 'ridiculous',
  // s
  sacrafice: 'sacrifice', safty: 'safety', sanatize: 'sanitize',
  satisfacton: 'satisfaction', scedule: 'schedule', scehdule: 'schedule',
  scholership: 'scholarship', sceintific: 'scientific', scinario: 'scenario',
  secratary: 'secretary', sencere: 'sincere', sensable: 'sensible',
  sentance: 'sentence', seperate: 'separate', seargent: 'sergeant',
  sevral: 'several', sieze: 'seize', signiture: 'signature',
  signifcant: 'significant', simalar: 'similar', similiar: 'similar',
  sincerly: 'sincerely', situaton: 'situation', skepticle: 'skeptical',
  socailly: 'socially', soilder: 'soldier', soveriegn: 'sovereign',
  speach: 'speech', speciman: 'specimen', sponser: 'sponsor',
  spontanious: 'spontaneous', stategic: 'strategic', statment: 'statement',
  steriotype: 'stereotype', stimulous: 'stimulus', stomache: 'stomach',
  stratagic: 'strategic', strengh: 'strength', strenous: 'strenuous',
  stuborn: 'stubborn', subconcious: 'subconscious', subsidary: 'subsidiary',
  substansial: 'substantial', substitude: 'substitute', succesful: 'successful',
  successfull: 'successful', sufficent: 'sufficient', sumary: 'summary',
  supercede: 'supersede', superseede: 'supersede', supress: 'suppress',
  suprise: 'surprise', surprize: 'surprise', surveliance: 'surveillance',
  suspicous: 'suspicious', sustanability: 'sustainability', sylabus: 'syllabus',
  symetry: 'symmetry', sympathise: 'sympathize', symtom: 'symptom',
  // t
  talen: 'talent', tarif: 'tariff', teamwerk: 'teamwork',
  tecnology: 'technology', tempature: 'temperature', temporarely: 'temporarily',
  tendancy: 'tendency', teratory: 'territory', therefor: 'therefore',
  thier: 'their', thorogh: 'thorough', threshhold: 'threshold',
  tommorow: 'tomorrow', tommorrow: 'tomorrow', tounge: 'tongue',
  towords: 'towards', tradional: 'traditional', tragicly: 'tragically',
  tramendous: 'tremendous', transfered: 'transferred', transparancy: 'transparency',
  truely: 'truly', twelth: 'twelfth', tyrany: 'tyranny',
  // u-v
  unanamous: 'unanimous', uncomfertable: 'uncomfortable', underate: 'underrate',
  understandible: 'understandable', unfortunatly: 'unfortunately', uniqe: 'unique',
  unnecesary: 'unnecessary', untill: 'until', upholstry: 'upholstery',
  usally: 'usually', utalize: 'utilize', vaccum: 'vacuum',
  valuble: 'valuable', vegatable: 'vegetable', vehical: 'vehicle',
  vengance: 'vengeance', versatle: 'versatile', vigourous: 'vigorous',
  villan: 'villain', visable: 'visible', volunter: 'volunteer',
  vulnerble: 'vulnerable',
  // w-z
  waranty: 'warranty', Wedensday: 'Wednesday', wellfare: 'welfare',
  wether: 'whether', wierd: 'weird', withdrawl: 'withdrawal',
  witheld: 'withheld', wonderfull: 'wonderful', writting: 'writing',
  yeild: 'yield', zealos: 'zealous',
};

function correctSpelling(text: string): string {
  return text.replace(/\b[a-zA-Z]+\b/g, (word) => {
    const lower = word.toLowerCase();
    const correction = COMMON_MISSPELLINGS[lower];
    if (!correction) return word;
    // Preserve original casing pattern
    if (word[0] === word[0].toUpperCase()) {
      return correction.charAt(0).toUpperCase() + correction.slice(1);
    }
    return correction;
  });
}

// ── Cleanup helpers ─────────────────────────────────────────────────

/** Fix lone lowercase "i" → "I" */
function fixLoneI(text: string): string {
  return text.replace(/\bi\b/g, 'I');
}

/** Capitalize first letter */
function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip trailing punctuation so we can add our own */
function stripTrailingPunct(s: string): string {
  return s.replace(/[\s.,!?;:]+$/, '');
}

// ── Handle "X and Y" where both halves need gerund after filler strip ──

function gerundifyParallelParts(text: string, didStrip: boolean): string {
  if (!didStrip) return text;

  // Handle "cook meals and go dancing" → "cooking meals and going dancing"
  // Split on " and " only at the top level
  const andParts = text.split(/\s+and\s+/i);
  if (andParts.length <= 1) return gerundifyLeadingVerb(text);

  return andParts.map(part => gerundifyLeadingVerb(part.trim())).join(' and ');
}

// ── Main export ─────────────────────────────────────────────────────

export function formatAnswer(raw: string): string {
  if (!raw || !raw.trim()) return '';

  let text = raw.trim();

  // 1. Try to strip filler prefix
  const { stripped, didStrip } = tryStripFiller(text);
  text = stripped;

  // 2. If filler was stripped, gerundify leading verb(s)
  text = gerundifyParallelParts(text, didStrip);

  // 3. Light cleanup
  text = correctSpelling(text);
  text = fixLoneI(text);
  text = stripTrailingPunct(text);

  // 4. Capitalize first letter
  text = capitalize(text);

  // 5. Final punctuation — period for statements, exclamation if it feels listy/energetic
  const hasMultipleParts = /\band\b/i.test(text) || text.includes(',');
  text += hasMultipleParts ? '!' : '.';

  return text;
}
