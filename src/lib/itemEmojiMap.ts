/**
 * Inventory Item → Emoji resolver
 * 
 * Broad keyword/synonym matching with semantic fallback categories.
 * Order matters: more specific patterns come before broader ones.
 */

const ITEM_EMOJI_MAP: [RegExp, string][] = [
  // ── Beach / Pool / Water / Inflatable ──
  [/inflatabl|pool.*float|floatie|pool.*raft|lounger|pool.*toy|air.*mattress/i, '🛟'],
  [/beach.*towel|beach.*blanket/i, '🏖️'],
  [/beach|shore|seaside|coast/i, '🏖️'],
  [/ocean|sea|wave|tide/i, '🌊'],
  [/island|tropical|paradise/i, '🏝️'],
  [/snorkel|diving|scuba/i, '🤿'],
  [/swim|pool/i, '🏊'],
  [/surfboard|surf/i, '🏄'],
  [/kayak|canoe|paddle/i, '🛶'],
  [/sailboat|sail|boat/i, '⛵'],
  [/fishing|fish.*rod/i, '🎣'],
  [/hammock/i, '🏖️'],
  [/life.*vest|life.*jacket/i, '🦺'],

  // ── Food & Drink ──
  [/coffee|espresso|latte|cappuccino|americano/i, '☕'],
  [/tea|matcha|chai/i, '🍵'],
  [/wine|merlot|cabernet|chardonnay/i, '🍷'],
  [/beer|ale|lager|ipa|stout/i, '🍺'],
  [/cocktail|margarita|mojito|martini/i, '🍸'],
  [/water.*bottle|hydro/i, '💧'],
  [/pizza/i, '🍕'],
  [/burger|hamburger/i, '🍔'],
  [/taco|burrito|tortilla/i, '🌮'],
  [/sushi|sashimi|maki/i, '🍣'],
  [/ramen|noodle|pho/i, '🍜'],
  [/pasta|spaghetti|penne/i, '🍝'],
  [/rice|fried.*rice/i, '🍚'],
  [/sandwich|sub|hoagie/i, '🥪'],
  [/salad|ranch.*dress|vinaigrette/i, '🥗'],
  [/hot.*sauce|sauce|sriracha|tabasco/i, '🌶️'],
  [/chocolate|candy|sweets/i, '🍫'],
  [/cookie|biscuit/i, '🍪'],
  [/donut|doughnut/i, '🍩'],
  [/cake|cupcake|pastry/i, '🎂'],
  [/ice.*cream|gelato|frozen.*yogurt/i, '🍦'],
  [/popcorn/i, '🍿'],
  [/chip|crisp|nachos/i, '🍟'],
  [/snack|treat|munchie/i, '🍿'],
  [/fruit|apple|banana|berry|mango/i, '🍎'],
  [/avocado|guac/i, '🥑'],
  [/cheese/i, '🧀'],
  [/egg|omelette/i, '🥚'],
  [/bread|toast|bagel|croissant/i, '🥐'],
  [/cook|pan|pot|spice|kitchen|spatula|whisk/i, '🍳'],
  [/grill|bbq|barbecue/i, '🔥'],
  [/wine.*glass|champagne|prosecco/i, '🥂'],
  [/protein|jerky/i, '🥩'],

  // ── Music & Audio ──
  [/guitar|ukulele|banjo/i, '🎸'],
  [/piano|keyboard.*music|keys.*music/i, '🎹'],
  [/drum|percussion/i, '🥁'],
  [/violin|cello|fiddle/i, '🎻'],
  [/music|playlist|song|spotify|vinyl|record/i, '🎵'],
  [/headphone|earbuds|airpod|earbud/i, '🎧'],
  [/speaker|bluetooth.*speaker|radio|boombox/i, '🔊'],
  [/podcast|audio/i, '🎙️'],
  [/microphone|mic|karaoke/i, '🎤'],

  // ── Books & Writing ──
  [/journal|notebook|diary|planner/i, '📓'],
  [/book|novel|read|kindle|e-reader/i, '📖'],
  [/write|blog|pen.*paper/i, '✍️'],
  [/pen|pencil|marker|highlighter/i, '✏️'],
  [/sketch|draw|illustrat/i, '✏️'],
  [/magazine|comic|manga/i, '📚'],

  // ── Tech & Gadgets ──
  [/laptop|macbook|chromebook|computer/i, '💻'],
  [/phone|iphone|android|smartphone/i, '📱'],
  [/tablet|ipad/i, '📱'],
  [/camera|dslr|photo|polaroid/i, '📸'],
  [/drone/i, '🚁'],
  [/watch|smartwatch|apple.*watch/i, '⌚'],
  [/charger|battery.*pack|power.*bank/i, '🔋'],
  [/usb|cable|adapter|dongle/i, '🔌'],
  [/keyboard/i, '⌨️'],
  [/mouse|trackpad/i, '🖱️'],
  [/monitor|screen|display/i, '🖥️'],
  [/vr|virtual.*reality|headset/i, '🥽'],
  [/console|playstation|xbox|switch|nintendo/i, '🎮'],
  [/controller|gamepad/i, '🎮'],

  // ── Games & Entertainment ──
  [/board.*game|card.*game|tabletop/i, '🎲'],
  [/game|gaming/i, '🎮'],
  [/dice/i, '🎲'],
  [/puzzle|jigsaw|rubik/i, '🧩'],
  [/chess/i, '♟️'],
  [/movie|film|dvd|blu.ray/i, '🎬'],
  [/tv|television|streaming/i, '📺'],
  [/lego|block|building.*set/i, '🧱'],

  // ── Sports & Outdoors ──
  [/soccer|football/i, '⚽'],
  [/basketball/i, '🏀'],
  [/baseball|softball/i, '⚾'],
  [/tennis|racket|racquet/i, '🎾'],
  [/volleyball/i, '🏐'],
  [/golf/i, '⛳'],
  [/hockey/i, '🏒'],
  [/bowling/i, '🎳'],
  [/boxing|gloves/i, '🥊'],
  [/ski|snowboard/i, '⛷️'],
  [/skate|skateboard|roller/i, '🛹'],
  [/bike|cycling|bicycle/i, '🚴'],
  [/run|marathon|jog|sneaker|shoe/i, '👟'],
  [/hik|trail|trek|backpack.*outdoor/i, '🥾'],
  [/climb|boulder|rock.*wall/i, '🧗'],
  [/camp|tent|sleeping.*bag/i, '⛺'],
  [/yoga|meditat|stretch/i, '🧘'],
  [/gym|weight|dumbbell|barbell|kettlebell/i, '🏋️'],
  [/jump.*rope|skip.*rope/i, '🤸'],
  [/frisbee|disc/i, '🥏'],
  [/ping.*pong|table.*tennis/i, '🏓'],
  [/badminton|shuttlecock/i, '🏸'],
  [/archery|bow.*arrow/i, '🏹'],
  [/martial.*art|karate|judo|taekwondo/i, '🥋'],

  // ── Nature & Plants ──
  [/plant|seed|succulent|cactus|fern/i, '🌱'],
  [/flower|bouquet|rose|tulip|daisy/i, '🌸'],
  [/garden|herb|basil|mint.*plant/i, '🌿'],
  [/tree|bonsai/i, '🌳'],
  [/mushroom/i, '🍄'],
  [/sun|sunshine|sunlight/i, '☀️'],
  [/star.*gaz|telescope|astrono/i, '🔭'],
  [/moon|lunar/i, '🌙'],

  // ── Animals & Pets ──
  [/cat|kitten|kitty|feline/i, '🐱'],
  [/dog|puppy|pup|canine|golden.*retriev|labrador/i, '🐶'],
  [/fish|aquarium|goldfish|betta/i, '🐠'],
  [/bird|parrot|parakeet/i, '🐦'],
  [/hamster|guinea.*pig|gerbil/i, '🐹'],
  [/rabbit|bunny/i, '🐰'],
  [/horse|pony/i, '🐴'],
  [/turtle|tortoise/i, '🐢'],
  [/snake|reptile|lizard/i, '🐍'],
  [/frog/i, '🐸'],

  // ── Clothing & Accessories ──
  [/sunglasses|shades/i, '🕶️'],
  [/hat|cap|beanie|visor/i, '🧢'],
  [/shoe|sneaker|boot|sandal|flip.*flop/i, '👟'],
  [/jacket|hoodie|coat|sweater|sweatshirt/i, '🧥'],
  [/scarf|wrap|shawl/i, '🧣'],
  [/backpack|rucksack|bag|tote|purse/i, '🎒'],
  [/suitcase|luggage|travel.*bag/i, '🧳'],
  [/watch|bracelet|jewelry|necklace/i, '⌚'],
  [/sock/i, '🧦'],
  [/mask|face.*mask/i, '😷'],

  // ── Home & Comfort ──
  [/blanket|throw|quilt|comforter/i, '🛏️'],
  [/pillow|cushion/i, '🛏️'],
  [/candle|incense/i, '🕯️'],
  [/lamp|light|lantern|flashlight|torch/i, '🔦'],
  [/mug|cup|tumbler|thermos/i, '☕'],
  [/teddy|stuffed.*animal|plush|plushie/i, '🧸'],
  [/soap|shampoo|lotion|sunscreen/i, '🧴'],
  [/towel/i, '🏖️'],
  [/umbrella/i, '☂️'],
  [/fan/i, '🌀'],
  [/clock|alarm/i, '⏰'],
  [/key|keychain/i, '🔑'],
  [/mirror/i, '🪞'],

  // ── Office & Work ──
  [/sticky.*note|post.?it/i, '📝'],
  [/whiteboard|marker.*board/i, '📋'],
  [/calendar|schedule/i, '📅'],
  [/spreadsheet|excel/i, '📊'],
  [/folder|binder|file/i, '📁'],
  [/stapler|paper.*clip|clip/i, '📎'],
  [/calculator/i, '🧮'],
  [/printer/i, '🖨️'],
  [/desk|table/i, '🪑'],
  [/chair|ergonomic/i, '🪑'],

  // ── Travel & Transport ──
  [/passport/i, '🛂'],
  [/plane|flight|airplane|airport/i, '✈️'],
  [/car|vehicle|drive/i, '🚗'],
  [/bus/i, '🚌'],
  [/train|metro|subway/i, '🚆'],
  [/map|atlas|globe/i, '🗺️'],
  [/compass|navigation/i, '🧭'],
  [/travel|trip|journey|vacation|holiday/i, '✈️'],

  // ── Art & Craft ──
  [/paint|watercolor|acrylic|easel/i, '🎨'],
  [/clay|pottery|ceramic|sculpture/i, '🏺'],
  [/knit|crochet|yarn|sew|needle|thread/i, '🧵'],
  [/craft|diy|glue.*gun|scrapbook/i, '✂️'],
  [/origami|paper.*fold/i, '📄'],
  [/sticker/i, '⭐'],

  // ── Party & Celebration ──
  [/party|celebrat|fiesta/i, '🎉'],
  [/balloon/i, '🎈'],
  [/confetti|streamer/i, '🎊'],
  [/gift|present|wrapped/i, '🎁'],
  [/birthday/i, '🎂'],
  [/firework/i, '🎆'],

  // ── Health & Self-care ──
  [/vitamin|supplement|medicine/i, '💊'],
  [/first.*aid|bandage|band-aid/i, '🩹'],
  [/tooth.*brush|dental|floss/i, '🪥'],
  [/sleep.*mask|eye.*mask/i, '😴'],
  [/essential.*oil|diffuser|aromatherapy/i, '💐'],

  // ── Tools & Utility ──
  [/knife|machete|sword|blade|multi.?tool|swiss.*army/i, '🔪'],
  [/rope|cord|paracord/i, '🪢'],
  [/duct.*tape|tape/i, '📦'],
  [/tool|wrench|hammer|screwdriver/i, '🔧'],
  [/fire.*starter|lighter|match/i, '🔥'],
  [/binocular/i, '🔭'],
  [/whistle/i, '📣'],
  [/magnet/i, '🧲'],

  // ── Catch-all broader categories (keep last) ──
  [/food|meal|lunch|dinner|breakfast|snack/i, '🍽️'],
  [/sport|athlet|exercise|workout/i, '🏅'],
  [/outdoor|nature|wild|adventure/i, '🏕️'],
  [/tech|gadget|device|electronic/i, '📱'],
  [/toy|play/i, '🧸'],
  [/money|cash|wallet|credit.*card/i, '💰'],
  [/love|heart/i, '❤️'],
  [/magic|wand|spell/i, '🪄'],
  [/robot|ai/i, '🤖'],
  [/space|rocket|astronaut/i, '🚀'],
  [/science|lab|experiment/i, '🧪'],
  [/crystal|gem|jewel/i, '💎'],
];

export function itemToEmoji(item: string): string {
  for (const [regex, emoji] of ITEM_EMOJI_MAP) {
    if (regex.test(item)) return emoji;
  }
  // If the input starts with an emoji character, use it
  if (/^\p{Emoji}/u.test(item)) return item.charAt(0);
  return '⭐';
}
