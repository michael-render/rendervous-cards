/**
 * Archetype Title Generator
 * 
 * Classifies a user's "what I do at Render" description into one of 15 impact
 * categories and picks an unused title from that category's 12-item vocabulary.
 * Session-level de-duplication ensures ~100 users rarely share the same title.
 */

const CATEGORIES: { pattern: RegExp; titles: string[] }[] = [
  // 1) Culture / Experience / Workplace
  {
    pattern: /cultur|workplace|employ|enjoy|morale|vibe|happy|welcom|hospitality|onboard|office|perks|swag|team.*event|staff|retention|engag/i,
    titles: ['Culture Catalyst', 'Culture Architect', 'Experience Architect', 'Experience Designer', 'Workplace Alchemist', 'Vibe Curator', 'Joy Engineer', 'Community Architect', 'Hospitality Hero', 'Ritual Builder', 'People Energizer', 'Experience Orchestrator'],
  },
  // 2) Connector / Collaboration
  {
    pattern: /connect|collaborat|bridge|align|cross.?functional|bring.*together|between|partner|relationship|stakeholder/i,
    titles: ['Bridge Builder', 'Collaboration Catalyst', 'Connection Architect', 'Network Weaver', 'Team Unifier', 'Alignment Builder', 'Partnership Navigator', 'Community Connector', 'Cross-Team Conductor', 'Relationship Builder', 'Signal Booster', 'The Unifier'],
  },
  // 3) Problem Solver / Unblocker
  {
    pattern: /solv|unblock|fix|debug|figur|untangl|troubleshoot|weird.*problem|stuck|incident|triage|root.cause/i,
    titles: ['Problem Pathfinder', 'Solution Architect', 'Chaos Coordinator', 'Knot Untangler', 'Puzzle Solver', 'Obstacle Crusher', 'Systems Fixer', 'Debug Detective', 'Firebreak Builder', 'The Unblocker', 'Clarity Maker', 'Root-Cause Hunter'],
  },
  // 4) Builder / Maker / Creator
  {
    pattern: /build|ship|engineer|architect|code|develop|implement|creat|design.*system|prototype|launch|product/i,
    titles: ['Systems Builder', 'Craft Builder', 'Prototype Pilot', 'Idea Forge', 'Product Builder', 'Experience Builder', 'Maker-in-Chief', 'Creation Engine', 'The Builder', 'Blueprint Maker', 'Launch Builder', 'Build Catalyst'],
  },
  // 5) Operator / Execution / Delivery
  {
    pattern: /ops|operat|deliver|execut|logistic|run.*smooth|reliab|deploy|pipeline|ci.?cd|monitor|uptime|sre|infra/i,
    titles: ['Operations Orchestrator', 'Delivery Driver', 'Execution Engine', 'Flow Manager', 'Process Pilot', 'Logistics Lead', 'Smooth Operator', 'Runbook Keeper', 'Operations Architect', 'The Organizer', 'Reliability Builder', 'Throughput Tuner'],
  },
  // 6) Strategist / Planner / Prioritizer
  {
    pattern: /strateg|vision|direction|roadmap|priorit|big.*picture|north.*star|decision|trade.?off/i,
    titles: ['Strategy Navigator', 'Priority Pilot', 'Roadmap Architect', 'Planning Oracle', 'Decision Driver', 'Compass Keeper', 'The Strategist', 'Vision Translator', 'Direction Setter', 'Focus Builder', 'Strategy Shaper', 'Alignment Strategist'],
  },
  // 7) Organizer / Program / Project
  {
    pattern: /event|coordinat|plan|organiz|schedul|program|project|timeline|scope|meeting|milestone|calendar/i,
    titles: ['Program Architect', 'Calendar Commander', 'Project Pathfinder', 'Timeline Tamer', 'Scope Shepherd', 'Meeting Maestro', 'Coordination Captain', 'The Planner', 'Milestone Maker', 'Program Orchestrator', 'Planning Partner', 'The Scheduler'],
  },
  // 8) Communicator / Story / Influence
  {
    pattern: /writ|content|communic|story|narrat|document|messag|copywrite|blog|newsletter|brand.*voice|edit/i,
    titles: ['Story Crafter', 'Message Architect', 'Narrative Builder', 'Clarity Catalyst', 'Signal Curator', 'Communication Conductor', 'The Explainer', 'Story Strategist', 'Wordsmith Wizard', 'Comms Catalyst', 'Narrative Navigator', 'The Storyteller'],
  },
  // 9) Customer / Partner / Stakeholder Champion
  {
    pattern: /customer|client|partner|account|sale|revenue|deal|prospect|close|support|success|feedback|advocate/i,
    titles: ['Customer Champion', 'Partner Advocate', 'Relationship Navigator', 'Trust Builder', 'Stakeholder Whisperer', 'Client Catalyst', 'Customer Translator', 'Feedback Wrangler', 'Voice of Customer', 'The Advocate', 'Partner Builder', 'Trust Architect'],
  },
  // 10) Systems Thinker / Architecture / Scale
  {
    pattern: /system|platform|scale|complex|framework|abstraction|architecture|foundati|technical.*debt|pattern/i,
    titles: ['Systems Architect', 'Scale Builder', 'Complexity Tamer', 'Systems Navigator', 'Structure Shaper', 'Platform Planner', 'Framework Builder', 'The Architect', 'Systems Orchestrator', 'Pattern Seer', 'Systems Synthesizer', 'Scalability Strategist'],
  },
  // 11) Optimizer / Quality / Improvement
  {
    pattern: /improv|optimi|better|enhanc|refin|polish|streamlin|efficien|quality|friction|performance|process/i,
    titles: ['Optimization Engine', 'Quality Guardian', 'Process Improver', 'Efficiency Architect', 'Friction Fighter', 'Polish Specialist', 'Continuous Improver', 'The Refiner', 'Performance Tuner', 'Quality Builder', 'Precision Driver', 'Improvement Catalyst'],
  },
  // 12) Growth / Learning / Coaching
  {
    pattern: /teach|mentor|onboard|train|coach|guide|ramp.*up|grow|learn|develop.*people|enable|talent/i,
    titles: ['Growth Catalyst', 'Talent Amplifier', 'Coach in Chief', 'Learning Architect', 'Mentor Magnet', 'Confidence Builder', 'The Uplifter', 'Skill Builder', 'Growth Gardener', 'Enablement Architect', 'Momentum Coach', 'The Mentor'],
  },
  // 13) Experimenter / Innovation
  {
    pattern: /experiment|innovat|idea|curiosity|prototype|test|hypothes|explor|discover|hack|tinker|iterate/i,
    titles: ['Experiment Pilot', 'Innovation Catalyst', 'Idea Explorer', 'Curiosity Engine', 'Rapid Prototyper', 'The Tinkerer', 'Concept Runner', 'Discovery Driver', 'Lab Leader', 'Iteration Architect', 'The Explorer', 'Innovation Builder'],
  },
  // 14) Craft / Detail / Aesthetic (Design)
  {
    pattern: /design|ux|ui|visual|interface|user.*experience|pixel|aesthetic|brand|illustrat|typograph|layout/i,
    titles: ['Detail Detective', 'Craft Curator', 'Aesthetic Architect', 'Taste Maker', 'Design Driver', 'Pixel Polisher', 'Craft Builder', 'The Stylist', 'Visual Storycrafter', 'Craft Engineer', 'Design Orchestrator', 'The Curator'],
  },
  // 15) Momentum / Energy / Morale
  {
    pattern: /energy|excit|motivat|inspir|cheer|hype|spark|rally|enthusiasm|positiv|uplift|boost/i,
    titles: ['Momentum Maker', 'Spark Generator', 'Energy Catalyst', 'Hype Builder', 'Morale Engine', 'The Motivator', 'Cheer Captain', 'The Igniter', 'Vibes Amplifier', 'Momentum Architect', 'The Energizer', 'Team Booster'],
  },
  // 16) Data / Analytics / Insights
  {
    pattern: /data|analy|metric|insight|dashboard|report|measur|kpi|tracking|number|statistic|sql|query/i,
    titles: ['Data Navigator', 'Insight Architect', 'Metrics Maven', 'Analytics Alchemist', 'Dashboard Sage', 'Number Whisperer', 'Data Storyteller', 'Signal Decoder', 'Insight Hunter', 'Pattern Analyst', 'The Quantifier', 'Data Illuminator'],
  },
  // 17) Security / Trust / Compliance
  {
    pattern: /secur|trust|complian|audit|privacy|encrypt|vulnerab|risk|threat|govern|regulat|certif|soc2|gdpr/i,
    titles: ['Security Sentinel', 'Trust Guardian', 'Compliance Captain', 'Risk Navigator', 'Privacy Architect', 'Shield Bearer', 'The Protector', 'Audit Ace', 'Governance Guide', 'Security Architect', 'Risk Wrangler', 'Compliance Catalyst'],
  },
  // 18) Automation / Tooling / Developer Experience
  {
    pattern: /automat|tool|devex|developer.*experience|workflow|script|bot|integrat|intern.*tool|cli|sdk/i,
    titles: ['Automation Architect', 'Tooling Wizard', 'DevEx Champion', 'Workflow Weaver', 'Bot Builder', 'Script Sorcerer', 'Tool Forger', 'Integration Architect', 'The Automator', 'Pipeline Crafter', 'Efficiency Engineer', 'Toolchain Tamer'],
  },
  // 19) Community / Advocacy / Evangelism
  {
    pattern: /communit|advoca|evangel|ambassador|outreach|ecosystem|open.?source|developer.*rel|devrel|forum|meetup/i,
    titles: ['Community Builder', 'Developer Advocate', 'Ecosystem Architect', 'Ambassador-in-Chief', 'Outreach Orchestrator', 'Community Shepherd', 'The Evangelist', 'Voice Amplifier', 'Ecosystem Navigator', 'Community Catalyst', 'The Ambassador', 'Community Gardener'],
  },
  // 20) Finance / Budget / Resource Management
  {
    pattern: /financ|budget|cost|spend|forecast|allocat|resource.*manag|procurement|vendor|contract|invoice|billing/i,
    titles: ['Budget Architect', 'Resource Navigator', 'Finance Strategist', 'Cost Optimizer', 'Forecast Builder', 'Allocation Ace', 'The Treasurer', 'Spend Shepherd', 'Resource Orchestrator', 'Budget Guardian', 'Fiscal Navigator', 'Value Maximizer'],
  },
  // 21) Leadership / Management / Direction
  {
    pattern: /lead|manag|direct|supervis|oversee|head|chief|captain|steer|shepherd|own|accountability/i,
    titles: ['Team Captain', 'Direction Keeper', 'Leadership Catalyst', 'The Commander', 'Team Shepherd', 'Vision Keeper', 'People Leader', 'The Helmsman', 'Crew Captain', 'Leadership Architect', 'The Skipper', 'Team Navigator'],
  },
  // 22) Research / Discovery / User Research
  {
    pattern: /research|user.*research|study|survey|interview|usability|finding|insight.*gather|synthesis|persona|discovery/i,
    titles: ['Research Pioneer', 'Discovery Architect', 'Insight Gatherer', 'User Whisperer', 'Research Navigator', 'Finding Synthesizer', 'The Researcher', 'Persona Builder', 'Empathy Architect', 'Discovery Catalyst', 'Research Storyteller', 'Insight Synthesizer'],
  },
  // 23) Documentation / Knowledge / Wiki
  {
    pattern: /document|wiki|knowledge.*base|readme|runbook|handbook|playbook|reference|guide.*writ|spec|changelog/i,
    titles: ['Knowledge Keeper', 'Documentation Hero', 'Wiki Wizard', 'Handbook Architect', 'Playbook Builder', 'Reference Crafter', 'The Documenter', 'Knowledge Architect', 'Spec Writer', 'Runbook Builder', 'Guide Crafter', 'Knowledge Gardener'],
  },
  // 24) Sustainability / Impact / Mission
  {
    pattern: /sustain|impact|mission|purpose|social.*good|carbon|green|eco|planet|responsib|ethic|values/i,
    titles: ['Impact Architect', 'Mission Driver', 'Purpose Navigator', 'Sustainability Champion', 'Values Guardian', 'Impact Builder', 'The Changemaker', 'Mission Keeper', 'Purpose Catalyst', 'Impact Strategist', 'Ethics Navigator', 'Sustainability Builder'],
  },
  // 25) Speed / Agility / Iteration
  {
    pattern: /speed|fast|agil|sprint|rapid|quick|veloc|turnaround|pace|momentum|lean|scrum|kanban/i,
    titles: ['Velocity Architect', 'Sprint Captain', 'Agility Catalyst', 'Pace Setter', 'Rapid Builder', 'The Accelerator', 'Speed Demon', 'Velocity Engine', 'Sprint Strategist', 'Quick-Ship Captain', 'Turnaround Specialist', 'Lean Builder'],
  },
  // 26) Support / Help / Service
  {
    pattern: /help|assist|support.*ticket|service.*desk|troubleshoot|resolve|answer|respond|queue|escalat|ticket/i,
    titles: ['Support Hero', 'Resolution Architect', 'Help Navigator', 'Service Champion', 'Queue Crusher', 'Ticket Tamer', 'The Responder', 'Escalation Expert', 'Resolution Engine', 'Support Catalyst', 'Answer Architect', 'The Helper'],
  },
  // 27) Integration / API / Ecosystem
  {
    pattern: /api|integrat|webhook|endpoint|microservice|rest|graphql|connect.*system|middleware|gateway|plugin/i,
    titles: ['Integration Architect', 'API Artisan', 'Ecosystem Weaver', 'Middleware Maven', 'Gateway Builder', 'The Integrator', 'Plugin Pioneer', 'API Navigator', 'Connection Builder', 'Endpoint Engineer', 'Ecosystem Builder', 'API Orchestrator'],
  },
  // 28) Recruitment / Hiring / Talent Acquisition
  {
    pattern: /recruit|hir|talent.*acqui|interview|candidate|source|headhunt|pipeline.*talent|job.*post|offer/i,
    titles: ['Talent Scout', 'Hiring Architect', 'Recruitment Catalyst', 'Pipeline Builder', 'The Headhunter', 'Talent Magnet', 'Candidate Champion', 'Offer Orchestrator', 'Sourcing Sage', 'Hiring Navigator', 'Talent Finder', 'The Recruiter'],
  },
  // 29) Marketing / Growth / Demand
  {
    pattern: /market|growth.*market|demand|campaign|seo|advertising|funnel|conversion|awareness|positioning|go.?to.?market/i,
    titles: ['Growth Architect', 'Demand Builder', 'Campaign Commander', 'Funnel Navigator', 'Market Strategist', 'The Marketer', 'Conversion Catalyst', 'Awareness Architect', 'Growth Engine', 'Demand Catalyst', 'Market Navigator', 'Campaign Catalyst'],
  },
  // 30) Accessibility / Inclusion / Diversity
  {
    pattern: /accessib|a11y|inclus|divers|equity|belong|accommodat|screen.*read|aria|wcag|barrier|universal/i,
    titles: ['Accessibility Architect', 'Inclusion Catalyst', 'Equity Builder', 'Barrier Breaker', 'The Includer', 'Access Champion', 'Belonging Builder', 'Universal Designer', 'Inclusion Navigator', 'Equity Architect', 'A11y Advocate', 'Accessibility Champion'],
  },
];

const FALLBACK_TITLES = [
  'Impact Maker', 'Momentum Builder', 'Systems Navigator', 'Clarity Architect',
  'Quiet Operator', 'Catalyst Engine', 'Signal Builder', 'Scope Wrangler',
  'The Generalist', 'Versatility Engine', 'Mission Driver', 'Adaptive Builder',
  'Silent Force', 'Glue Person', 'Utility Player', 'The Linchpin',
  'Swiss-Army Builder', 'Invisible Architect', 'Steady Hand', 'The Dependable',
  'Wildcard Operator', 'All-Terrain Builder', 'Flex Specialist', 'The Reliable',
];

/** Module-level set tracking used titles for the session. */
const usedTitles = new Set<string>();

/** Reset the de-duplication set (e.g., between batches). */
export function resetArchetypeTracker(): void {
  usedTitles.clear();
}

function pickUnused(titles: string[], seed: number): string {
  // Deterministic pick based on seed only — no shared mutable state
  const idx = Math.abs(seed) % titles.length;
  return titles[idx];
}

export function generateArchetype(roleDescription: string, seed: number): string {
  const lower = roleDescription.toLowerCase();

  // Score each category — pick best match (most keywords hit)
  let bestCategory: typeof CATEGORIES[number] | null = null;
  let bestScore = 0;

  for (const cat of CATEGORIES) {
    const matches = lower.match(cat.pattern);
    if (matches) {
      // Use match length as a rough relevance score
      const score = matches[0].length;
      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    }
  }

  if (bestCategory) {
    return pickUnused(bestCategory.titles, seed);
  }

  return pickUnused(FALLBACK_TITLES, seed);
}
