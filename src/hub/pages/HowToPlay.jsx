import { useEffect, useState } from 'react';
import { useBBG } from '../../store/useBBG';

const SECTIONS = [
  { id: 'overview',   label: '🎯 OVERVIEW' },
  { id: 'flow',       label: '🔄 GAME FLOW' },
  { id: 'resources',  label: '💰 RESOURCES' },
  { id: 'districts',  label: '🏙️ DISTRICTS' },
  { id: 'tiers',      label: '🏗️ DEVELOPMENT' },
  { id: 'combat',     label: '⚔️ COMBAT' },
  { id: 'cards',      label: '🃏 CARDS' },
  { id: 'factions',   label: '👑 FACTIONS' },
  { id: 'paths',      label: '🛤️ PATHS TO WEALTH' },
  { id: 'win',        label: '🏆 WIN CONDITIONS' },
  { id: 'modes',      label: '🌐 PARTY vs ONLINE' },
  { id: 'tips',       label: '💡 STRATEGY' },
];

export default function HowToPlay({ embedded = false, onClose }) {
  const { setPage } = useBBG();
  const [active, setActive] = useState('overview');

  function close() {
    if (embedded && onClose) onClose();
    else setPage('hub');
  }

  return (
    <div className={embedded ? 'fixed inset-0 z-50 bg-black/90 grain overflow-y-auto' : 'min-h-screen grain'}>
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6 sticky top-0 bg-bbg-void/95 py-3 z-10 backdrop-blur">
          <div>
            <div className="font-display text-4xl text-bbg-gold tracking-wider">📖 HOW TO PLAY</div>
            <div className="text-bbg-muted font-mono text-xs">GANG WARS · BBG OFFICIAL GUIDE</div>
          </div>
          <button className="btn" onClick={close}>{embedded ? '✕ CLOSE' : '← BACK'}</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          {/* Sidebar TOC */}
          <nav className="md:sticky md:top-24 md:self-start space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full text-left px-3 py-2 rounded font-display tracking-wider text-sm transition ${
                  active === s.id ? 'bg-bbg-gold text-black' : 'bg-bbg-raised hover:bg-bbg-hover text-bbg-text'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <main className="bbg-card-base p-6 min-h-[600px]">
            {active === 'overview'  && <Overview />}
            {active === 'flow'      && <Flow />}
            {active === 'resources' && <Resources />}
            {active === 'districts' && <Districts />}
            {active === 'tiers'     && <Tiers />}
            {active === 'combat'    && <Combat />}
            {active === 'cards'     && <Cards />}
            {active === 'factions'  && <Factions />}
            {active === 'paths'     && <Paths />}
            {active === 'win'       && <WinConditions />}
            {active === 'modes'     && <Modes />}
            {active === 'tips'      && <Tips />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── SECTIONS ────────────────────────────────────────────────

function H({ children }) {
  return <h2 className="font-display text-3xl text-bbg-gold tracking-wider mb-3">{children}</h2>;
}
function H3({ children }) {
  return <h3 className="font-display text-xl text-bbg-gold2 tracking-wider mt-5 mb-2">{children}</h3>;
}
function P({ children }) {
  return <p className="text-bbg-text leading-relaxed mb-3">{children}</p>;
}
function Note({ children, color = 'gold' }) {
  const map = { gold: 'border-bbg-gold bg-bbg-gold/5', red: 'border-bbg-red bg-bbg-red/5', green: 'border-bbg-green bg-bbg-green/5' };
  return <div className={`border-l-4 px-3 py-2 my-3 text-sm ${map[color]}`}>{children}</div>;
}
function Row({ k, v }) {
  return <div className="flex gap-4 py-1.5 border-b border-bbg-border text-sm"><span className="text-bbg-muted font-mono w-32 flex-shrink-0">{k}</span><span className="flex-1">{v}</span></div>;
}

function Overview() {
  return (
    <>
      <H>Overview</H>
      <P>
        <strong className="text-bbg-gold">Gang Wars</strong> is a strategy game about controlling districts in a city,
        building criminal empires across Trap houses, Corner stores, Social hubs, and Underground operations.
        2 to 8 players. 15 minutes to over an hour depending on mode.
      </P>
      <P>
        The hex board represents a city. Each tile is a <em>district</em> with a number token (2–12) and a type.
        On your turn you roll two dice — every district matching the rolled total produces resources for whoever owns it.
        You then spend resources to claim more territory, build it up, attack rivals, or play action cards.
      </P>
      <Note>
        <strong>Goal:</strong> hit the wealth threshold for your mode (Quick/Medium), <em>or</em> be the last crew standing (Long mode).
      </Note>
      <H3>What you'll be doing</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Rolling dice to earn resources from your districts</li>
        <li>Spending Cash to claim and develop new districts</li>
        <li>Spending Muscle to attack rivals and take their territory</li>
        <li>Playing Action cards for one-time effects (heists, takeovers, intel)</li>
        <li>Reacting to Event cards that hit the whole table</li>
        <li>Using your faction's unique Active and Passive abilities</li>
        <li>Trading resources with other players (or scamming them)</li>
      </ul>
    </>
  );
}

function Flow() {
  return (
    <>
      <H>Game Flow</H>
      <P>The game runs in <strong>rounds</strong>. Each round, every player takes one turn in order. A turn has 3 phases:</P>

      <H3>1 · ROLL phase</H3>
      <P>You roll <strong>2d6</strong>. The total triggers <em>every</em> district on the board with that number — including other players'. Whoever owns a matching district earns resources from it (more if it's developed). You also draw 1 card.</P>
      <Note color="gold">If an Event card is drawn, it triggers immediately and affects the whole round.</Note>

      <H3>2 · ACT phase</H3>
      <P>Spend resources however you like, in any order:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Claim</strong> an unclaimed tile → 100 Cash · becomes your Operation (tier 1)</li>
        <li><strong>Develop</strong> your tile → 300 Cash to upgrade to Trap (tier 2), 600 Cash for Empire (tier 3)</li>
        <li><strong>Attack</strong> an enemy tile → 200 Muscle × tier · dice combat</li>
        <li><strong>Hustle</strong> → spend 100 Clout to draw 2 cards (1×/turn)</li>
        <li><strong>Scout</strong> → spend 75 Connect to peek at any player's hand + resources (1×/turn)</li>
        <li><strong>Play a card</strong> from your hand → pay its cost, apply effect</li>
        <li><strong>Use your faction ability</strong> → once per turn, varies by faction</li>
        <li><strong>Trade</strong> with any player at any time during the round</li>
      </ul>
      <Note>
        <strong>Hustle</strong> and <strong>Scout</strong> give Clout and Connect a baseline use every turn —
        you don't need a card in hand to spend them.
      </Note>

      <H3>3 · END TURN (Tax phase)</H3>
      <P>When you click <strong>END TURN</strong>, your tile holdings determine a <strong>tax rate</strong>. Every other player pays that % of their current Cash:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Each <strong>Tier-1 Operation</strong> you own → <strong>1%</strong></li>
        <li>Each <strong>Tier-2 Trap</strong> → <strong>2%</strong></li>
        <li>Each <strong>Tier-3 Empire</strong> → <strong>3%</strong></li>
      </ul>
      <P className="mt-3"><strong>Examples:</strong></P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>You own 6 × Tier-1 → opponents pay 6% of their cash</li>
        <li>You own 3 × T1 + 2 × T2 + 1 × T3 → 3% + 4% + 3% = <strong>10%</strong></li>
      </ul>
      <Note color="gold">
        Tax now scales with your <em>territory dominance</em>. The more (and bigger) tiles you hold, the heavier
        the rent everyone pays you. This makes claiming and developing the dominant strategy.
      </Note>

      <H3>Anti-softlock safeguards</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Poverty floor:</strong> if your total wealth is under <strong>200</strong>, you pay <strong>no tax</strong>. Rebuild without bleeding.</li>
        <li><strong>NY Rats discount:</strong> NY pays half tax across the board (intel network).</li>
        <li><strong>Conversion cards:</strong> Bag Run (100 Muscle → 200 Cash), Recruit (200 Cash → 200 Muscle), Network (100 Cash → 200 Connect) prevent dead-ends.</li>
        <li><strong>HUSTLE</strong> (100 Clout → 2 cards) and <strong>Plug Drop</strong> (200 Cash → +200 random) keep options open.</li>
      </ul>
    </>
  );
}

function Resources() {
  return (
    <>
      <H>Resources</H>
      <P>Four currencies. Every one has a purpose. Total wealth (sum of all four) is what wins Quick/Medium games.</P>

      <H3>💵 CASH</H3>
      <P>The wealth-engine resource. Two ways to earn it:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Trap districts</strong> — produce Cash on roll match (the only tile type that yields Cash)</li>
        <li><strong>Tax</strong> — every end-of-turn, opponents pay 1/2/3% of their cash per Tier 1/2/3 tile you own</li>
        <li><em>Plus:</em> trade, Bag Run conversion card, Plug Drop random, Heist theft, Wild center bonus</li>
      </ul>
      <P className="mt-2">Spent on:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Claim a tile:</strong> 100 Cash</li>
        <li><strong>Develop:</strong> 300 Cash (Op→Trap), 600 Cash (Trap→Empire)</li>
        <li><strong>Tax payments:</strong> automatically, when opponents end their turn</li>
        <li><strong>Card costs:</strong> Hostile Takeover, Bail Money, Loaded, Plug Drop, Recruit, Network</li>
      </ul>

      <H3>💪 MUSCLE</H3>
      <P>Earned from <strong>Corner</strong> districts. Used for combat and aggression.</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Attacks:</strong> 200 Muscle × target tier (200/400/600)</li>
        <li><strong>Attack roll bonus:</strong> +1 per 500 Muscle stockpiled</li>
        <li><strong>Card costs:</strong> Shakedown, Drive-By, Hostile Takeover, Extortion</li>
      </ul>

      <H3>📱 CLOUT</H3>
      <P>Earned from <strong>Social</strong> districts. The face/reputation currency — fuels card draws and influence plays.</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>HUSTLE</strong> action (any turn): 100 Clout → draw 2 cards</li>
        <li><strong>Card costs:</strong> Block Party (200), Flip the Script (300), Glow Up (250)</li>
        <li><strong>Faction abilities:</strong> LA Kings' Front Operations (50)</li>
        <li><strong>Atlanta passive:</strong> bonus Clout for 3+ connected same-type districts</li>
      </ul>

      <H3>🔗 CONNECT</H3>
      <P>Earned from <strong>Underground</strong> districts. Information & networking — fuels intel, protection, and tile manipulation.</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>SCOUT</strong> action (any turn): 75 Connect → peek at any player's full hand + resources</li>
        <li><strong>Card costs:</strong> Witness Protection (200), Snitch (100), Territory Swap (400), Tunnel Vision (250)</li>
        <li><strong>Faction abilities:</strong> NY Rats' Street Intel (50)</li>
        <li><strong>Network</strong> card: convert Cash → Connect at favorable rate</li>
      </ul>

      <Note>
        <strong>Strategy note:</strong> Cash builds the empire, Muscle defends it. Clout & Connect run the trickery.
        A balanced crew has all four. A specialist faction (Compton/Atlanta/etc.) leans hard one way.
      </Note>
    </>
  );
}

function Districts() {
  const districts = [
    { name: 'Trap',        c: '#cc4422', p: 'Cash',    desc: 'The money-printer of the board. Rolling its number prints Cash.' },
    { name: 'Corner',      c: '#cc2244', p: 'Muscle',  desc: 'Foot soldiers, weapons, the streets. Yields Muscle for combat.' },
    { name: 'Social',      c: '#8844cc', p: 'Clout',   desc: 'Clubs, rappers, social media. Yields Clout — the influence currency.' },
    { name: 'Underground', c: '#224488', p: 'Connect', desc: 'Plugs, bagmen, dirty cops. Yields Connect — the network.' },
    { name: 'Wild',        c: '#cc8822', p: 'Random',  desc: 'Rare neutral tiles. Yields a random resource each roll.' },
  ];
  return (
    <>
      <H>District Types</H>
      <P>Every tile on the board is one of five types. Type determines what resource the tile yields.</P>
      {districts.map(d => (
        <div key={d.name} className="bbg-card-base p-3 mb-2 flex items-center gap-3" style={{ borderColor: d.c }}>
          <div className="w-3 h-12" style={{ background: d.c }} />
          <div className="flex-1">
            <div className="font-display text-xl tracking-wider" style={{ color: d.c }}>{d.name.toUpperCase()}</div>
            <div className="text-xs text-bbg-muted">{d.desc}</div>
          </div>
          <div className="font-mono text-xs px-3 py-1 bg-bbg-raised rounded">→ {d.p}</div>
        </div>
      ))}
      <H3>Number Tokens</H3>
      <P>Every tile has a number 2–12 (except the center wild). When that number is rolled, the tile produces.</P>
      <Note color="red">
        <strong>6 and 8 are HOT</strong> — the most-rolled numbers. Tiles with 6 or 8 are gold.
        <strong> 2 and 12 are COLD</strong> — rolled rarely. Don't pay full price for those.
      </Note>

      <H3>⭐ The Wild Center (no number)</H3>
      <P>The center hex sits empty until claimed. Once owned, it's the most valuable tile on the board:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Produces a <strong>random resource</strong> on EVERY roll (5 / 10 / 15 / 20 by tier)</li>
        <li>Owner draws a <strong>bonus card every other roll</strong></li>
        <li>Develops normally (300 Cash for Trap, 600 for Empire)</li>
      </ul>
      <Note color="gold">Whoever locks down the center early has a steady drip income forever. Worth fighting for.</Note>

      <H3>🚨 Roll of 7 — THE FEDS</H3>
      <P>7 is the single most-rolled total — but lives on no tile. Every roll of 7 triggers a city raid:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Every player with <strong>1500+ total wealth</strong> pays a 100-cash fine to the bank</li>
        <li>The active player <strong>skims 50 of every resource</strong> from the wealthiest opponent</li>
      </ul>
      <Note color="red">
        7 happens often (~17% of rolls). The leader pays a tax for being ahead, the active player pulls
        ahead by skimming. This is the catch-up mechanic that prevents runaway leads.
      </Note>
    </>
  );
}

function Tiers() {
  return (
    <>
      <H>Development</H>
      <P>Every claimed tile starts as an <strong>Operation</strong> (tier 1). You spend Cash to upgrade it. Higher tier = more yield + more tax.</P>

      <div className="bbg-card-base p-4 mb-3">
        <div className="font-display text-xl text-bbg-gold tracking-wider">TIER 1 · OPERATION</div>
        <div className="grid grid-cols-3 text-sm mt-2">
          <Row k="Claim cost" v="100 Cash" />
          <Row k="Yield" v="2× base on roll" />
          <Row k="Tax" v="50 Cash" />
        </div>
      </div>
      <div className="bbg-card-base p-4 mb-3 border-bbg-gold">
        <div className="font-display text-xl text-bbg-gold tracking-wider">TIER 2 · TRAP</div>
        <div className="grid grid-cols-3 text-sm mt-2">
          <Row k="Upgrade cost" v="300 Cash" />
          <Row k="Yield" v="3× base on roll" />
          <Row k="Tax" v="150 Cash" />
        </div>
      </div>
      <div className="bbg-card-base p-4 mb-3 border-bbg-red">
        <div className="font-display text-xl text-bbg-red tracking-wider">TIER 3 · EMPIRE</div>
        <div className="grid grid-cols-3 text-sm mt-2">
          <Row k="Upgrade cost" v="600 Cash" />
          <Row k="Yield" v="4× base on roll" />
          <Row k="Tax" v="350 Cash" />
        </div>
      </div>

      <Note>
        Base yield is 80–120 depending on type. The actual cash from a roll is roughly
        <code className="font-mono mx-1">baseYield × tier_multiplier ÷ 10</code>
        — so a tier-3 Trap on a 6/8 token can pay out 30–40 Cash <em>per roll</em>.
      </Note>
    </>
  );
}

function Combat() {
  return (
    <>
      <H>Combat</H>
      <P>To attack, click <strong>⚔️ ATTACK</strong>, then tap an enemy tile.</P>

      <H3>Cost</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Attacking a Tier 1 tile: <strong>200 Muscle</strong></li>
        <li>Attacking a Tier 2 Trap: <strong>400 Muscle</strong></li>
        <li>Attacking a Tier 3 Empire: <strong>600 Muscle</strong></li>
      </ul>
      <Note color="red">If you fail the attack, you lose <strong>50% extra Muscle</strong> on top of the cost. Picking fights is expensive.</Note>

      <H3>Resolving combat</H3>
      <P>Both sides roll <strong>2d6</strong>. Modifiers:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Attacker:</strong> +1 per 500 Muscle stockpiled</li>
        <li><strong>Defender:</strong> +1.5 × tier (so a Tier 3 Empire gets +4)</li>
        <li><strong>O Block Warriors</strong> roll defense twice and keep the higher</li>
      </ul>
      <P>Higher total wins. Ties go to the defender.</P>

      <H3>What you win</H3>
      <P>If you win, you take the tile <em>at tier 1</em> (the development gets damaged in the takeover). The defender keeps the rest of their stuff. If they had no other tiles, they're <strong>eliminated</strong>.</P>

      <H3>Defenses you should know</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Witness Protection</strong> card → immune to all attacks for 1 round</li>
        <li><strong>City Crackdown</strong> event → no attacks at all this round</li>
        <li><strong>O Block</strong> faction passive → defensive bias built-in</li>
      </ul>
    </>
  );
}

function Cards() {
  const action = [
    { n:'Shakedown',         c:'100 Muscle',     d:'Steal 40% of target player\'s Cash',                          t:'pick player' },
    { n:'Drive-By',          c:'150 Muscle',     d:'Destroy one tier of an enemy district',                       t:'pick enemy tile' },
    { n:'Hostile Takeover',  c:'500 M + 300 $',  d:'Claim any Tier-1 enemy tile without combat',                  t:'pick T1 enemy tile' },
    { n:'Heist',             c:'250 Muscle',     d:'Steal 250 of one resource from target player',                t:'player + resource' },
    { n:'Smoke Out',         c:'100 Muscle',     d:'Target discards a random card',                                t:'pick player' },
    { n:'Extortion',         c:'200 Muscle',     d:'Demand 200 of any resource — refusal = lose a tier',           t:'player + resource' },
    { n:'Block Party',       c:'200 Clout',      d:'Players on your tiles pay double tax this round',              t:'no target' },
    { n:'Flip the Script',   c:'300 Clout',      d:'Reverse tax this round — taxers pay you',                      t:'no target' },
    { n:'Glow Up',           c:'250 Clout',      d:'Free 1-tier upgrade on your lowest-tier tile',                 t:'no target' },
    { n:'Witness Protection',c:'200 Connect',    d:'Immune to all attacks for 1 round',                            t:'no target' },
    { n:'Snitch',            c:'100 Connect',    d:'Reveal any player\'s full hand to everyone',                   t:'pick player' },
    { n:'Territory Swap',    c:'400 Connect',    d:'Force-swap your last claimed tile for any enemy tile',         t:'pick enemy tile' },
    { n:'Bail Money',        c:'400 Cash',       d:'Reset any enemy district back to unclaimed',                   t:'pick enemy tile' },
    { n:'Loaded',            c:'300 Cash',       d:'Draw 3 cards immediately',                                     t:'no target' },
    { n:'Plug Drop',         c:'200 Cash',       d:'Gain +200 of a random resource',                               t:'no target' },
    { n:'Recruit',           c:'200 Cash',       d:'Convert: 200 Cash → 200 Muscle',                              t:'no target' },
    { n:'Bag Run',           c:'100 Muscle',     d:'Convert: 100 Muscle → 200 Cash',                              t:'no target' },
    { n:'Network',           c:'100 Cash',       d:'Convert: 100 Cash → 200 Connect',                             t:'no target' },
    { n:'Under the Table',   c:'free',           d:'Your next trade this round is tax-free',                       t:'no target' },
    { n:'Come Up',           c:'free',           d:'Draw 3 cards, keep 2',                                         t:'no target' },
  ];
  const event = [
    { n:'City Crackdown',   d:'No attacks allowed this round.' },
    { n:'Economic Boom',    d:'All districts produce double resources this round.' },
    { n:'Gang Truce',       d:'No attacks. Mandatory trade round.' },
    { n:'New Blood',        d:'Two unclaimed districts open up at the city edges.' },
    { n:'The Feds',         d:'Player with the most Muscle loses half of it.' },
    { n:'Rent Strike',      d:'No tax collection this round.' },
    { n:'Block Fire',       d:'A random occupied tile goes neutral.' },
    { n:'Supply Chain',     d:'All resource costs reduced 25% this round.' },
    { n:'War Season',       d:'Attacks cost 50% less Muscle this round.' },
    { n:'The Drought',      d:'Resource yields halved this round.' },
  ];
  return (
    <>
      <H>Cards</H>
      <P>Two types: <strong className="text-bbg-gold">Action cards</strong> (you choose to play, costs resources) and <strong className="text-clout">Event cards</strong> (trigger on draw, hit the whole table).</P>

      <H3>How to play a card</H3>
      <ol className="list-decimal pl-6 space-y-1 text-sm mb-2">
        <li>Open the <strong>HAND</strong> tab on phone, or scroll the card hand on TV.</li>
        <li>Tap <strong>PLAY</strong> on the card you want.</li>
        <li>If the card needs a target, the picker pops up — tap a player, tile, or resource.</li>
        <li>Effect resolves immediately and the card hits the discard pile.</li>
      </ol>

      <H3>Action cards</H3>
      <div className="space-y-1 text-xs">
        {action.map(a => (
          <div key={a.n} className="grid grid-cols-12 gap-2 bg-bbg-raised px-2 py-1.5 rounded">
            <span className="col-span-3 font-display tracking-wider">{a.n.toUpperCase()}</span>
            <span className="col-span-2 font-mono text-bbg-gold">{a.c}</span>
            <span className="col-span-5 text-bbg-text">{a.d}</span>
            <span className="col-span-2 font-mono text-bbg-muted">{a.t}</span>
          </div>
        ))}
      </div>

      <H3>Event cards</H3>
      <P>Triggered automatically when drawn. The whole round is affected.</P>
      <Note color="gold"><strong>Craigwood Gangstas</strong> draw an extra card every time an event triggers. Chaos benefits chaos.</Note>
      <div className="space-y-1 text-xs">
        {event.map(e => (
          <div key={e.n} className="grid grid-cols-12 gap-2 bg-bbg-raised px-2 py-1.5 rounded">
            <span className="col-span-4 font-display tracking-wider text-clout">{e.n.toUpperCase()}</span>
            <span className="col-span-8 text-bbg-text">{e.d}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Factions() {
  const f = [
    { n:'O Block Warriors',     c:'#cc2222', city:'Chicago',     style:'Defense',     diff:'Easy',
      pass:'Iron Grip — +2 Muscle/round from any tile held 3+ rounds',
      act:'Hold the Block — defense rolls twice, keeps higher',
      start:'150$ · 300M · 100C · 100K · 3 cards · 1 starting tile' },
    { n:'Compton Controllers',  c:'#2255cc', city:'Compton',     style:'Economy',     diff:'Medium',
      pass:'West Coast Financing — passive Cash even off-roll',
      act:'25% develop discount this turn',
      start:'400$ · 100M · 150C · 100K · 3 cards' },
    { n:'New York Rats',        c:'#ccaa00', city:'New York',    style:'Information', diff:'Hard',
      pass:'Intel Network — pay HALF tax to other players',
      act:'Street Intel — peek at any hand or resources (50 Connect)',
      start:'200$ · 150M · 150C · 350K · 5 cards' },
    { n:'Atlanta-Stan Soldiers',c:'#22aa44', city:'Atlanta',     style:'Clout',       diff:'Medium',
      pass:'Trap Star — bonus Clout for 3+ connected tiles',
      act:'Flip the Bag — convert any resource 2:1 into Clout',
      start:'150$ · 150M · 350C · 100K · 3 cards' },
    { n:'Craigwood Gangstas',   c:'#cc6600', city:'Craigwood',   style:'Chaos',       diff:'Hard',
      pass:'Ride or Die — +1 card on every Event triggered',
      act:'Wild Out — spend 3 of any resource, force a player to reroll',
      start:'200$ · 200M · 200C · 150K · 6 cards' },
    { n:'LA Kings',             c:'#8822cc', city:'Los Angeles', style:'Soft Power',  diff:'Medium',
      pass:'Industry Plant — +1 Clout from every trade at the table',
      act:'Front Operations — make 5 resources untaxable this round (50 Clout)',
      start:'200$ · 200M · 200C · 200K · 3 cards' },
  ];
  return (
    <>
      <H>The Six Factions</H>
      <P>Each crew member of the BBG family runs a different city's playstyle. Pick the one that matches how you want to play.</P>
      {f.map(x => (
        <div key={x.n} className="bbg-card-base p-4 mb-3" style={{ borderColor: x.c }}>
          <div className="flex items-center justify-between mb-1">
            <div className="font-display text-xl tracking-wider" style={{ color: x.c }}>{x.n.toUpperCase()}</div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${x.c}33`, color: x.c }}>{x.style}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bbg-raised">{x.diff}</span>
            </div>
          </div>
          <div className="text-xs text-bbg-muted font-mono mb-2">{x.city}</div>
          <div className="text-sm space-y-1">
            <div><span className="text-bbg-gold font-bold">PASSIVE:</span> {x.pass}</div>
            <div><span className="text-bbg-gold font-bold">ACTIVE:</span> {x.act}</div>
            <div className="text-xs text-bbg-muted font-mono mt-2">{x.start}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function Paths() {
  return (
    <>
      <H>Paths to Wealth & Cards</H>
      <P>Wealth (sum of all 4 resources) wins Quick/Medium games. Here's every way to grow it — and every way to keep cards in your hand.</P>

      <H3>💰 5 ways to generate wealth</H3>
      <ol className="list-decimal pl-6 space-y-2 text-sm">
        <li><strong>Roll matches.</strong> Own a tile, roll its number, get its yield. Trap tiles → Cash, Corner → Muscle, Social → Clout, Underground → Connect. Hot tiles (6/8 token, 5/36 odds) are gold.</li>
        <li><strong>Develop tiers.</strong> Tier 2 yields 50% more than Tier 1; Tier 3 yields 100% more. Pay 300/600 once, earn forever.</li>
        <li><strong>Tax.</strong> Tax rate = 1% × (your T1 tiles) + 2% × T2 + 3% × T3. Every opponent pays that % of their cash when you end your turn.</li>
        <li><strong>Wild center.</strong> Own (0,0) and you produce on EVERY roll, regardless of dice (5/10/15/20 + bonus card every other roll).</li>
        <li><strong>The Feds skim.</strong> Roll a 7 → you steal 50 of every resource from the wealthiest opponent.</li>
      </ol>

      <H3>🃏 5 ways to draw cards</H3>
      <ol className="list-decimal pl-6 space-y-2 text-sm">
        <li><strong>Auto-draw on roll.</strong> Every dice roll → 1 card to the active player.</li>
        <li><strong>HUSTLE action.</strong> Spend 100 Clout for 2 cards. Once per turn.</li>
        <li><strong>Loaded card.</strong> Spend 300 Cash → 3 cards.</li>
        <li><strong>Come Up card.</strong> Free → draw 3, keep 2.</li>
        <li><strong>Craigwood passive.</strong> Pick this faction → +1 card every time an event triggers.</li>
      </ol>

      <H3>🔄 Convert when stuck</H3>
      <P>Three conversion cards turn excess into something useful:</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Bag Run</strong> (100 Muscle → 200 Cash) — turn fighting power into building power</li>
        <li><strong>Recruit</strong> (200 Cash → 200 Muscle) — turn cash into combat readiness</li>
        <li><strong>Network</strong> (100 Cash → 200 Connect) — break into the intel game cheaply</li>
      </ul>

      <H3>⚠️ Avoiding softlocks</H3>
      <P>The combo of <strong>poverty floor</strong> (no tax under 200 wealth), <strong>soft cap</strong> (25% max per tax), <strong>HUSTLE/SCOUT</strong> baseline actions, and <strong>conversion cards</strong> means you should never be able to do nothing. If you're below 200 wealth, focus on:</P>
      <ol className="list-decimal pl-6 space-y-1 text-sm">
        <li>Rolling — you're tax-exempt while you rebuild</li>
        <li>Trading — propose a swap to anyone for fast cash injection</li>
        <li>Conversion cards — Bag Run if you have any Muscle</li>
        <li>Plug Drop (200 Cash → +200 random) — gambles for any resource</li>
      </ol>
    </>
  );
}

function WinConditions() {
  return (
    <>
      <H>How to Win</H>

      <H3>Quick mode (15–25 min)</H3>
      <P>First to <strong className="text-bbg-gold">1,000 total wealth</strong> (sum of all 4 resources) wins. Best for short sessions, 4 players max.</P>

      <H3>Medium mode (26–45 min) — default</H3>
      <P>First to <strong className="text-bbg-gold">2,000 total wealth</strong> wins. Full board, all faction abilities, neighborhood bonuses, seasonal modifiers active. 6 players max.</P>

      <H3>Long mode (45 min – 1 hr+)</H3>
      <P><strong className="text-bbg-red">Elimination only.</strong> Last player standing wins. Up to 8 players. Every player must confirm the warning before host can start — long mode does not save.</P>

      <H3>Elimination</H3>
      <P>You're out when you have <strong>zero territories AND zero total resources</strong>. This usually happens after a forced bankrupt-tax cascade or a final-territory loss in combat.</P>
      <Note>The wealth-threshold check happens at the end of every turn. If you push above the line on someone else's tax payment, that's a win.</Note>
    </>
  );
}

function Modes() {
  return (
    <>
      <H>Party vs Online</H>

      <H3>🏠 Party Mode (Couch)</H3>
      <P>One person hosts on a TV/PC. Everyone else joins from their phone by scanning a QR code. The TV shows the board. Phones show each player's private hand and action buttons.</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Up to 8 players + bots</li>
        <li>Phones connect over the same Wi-Fi as the host</li>
        <li>Add bots from the host panel for solo play</li>
        <li>Lobbies are one-off (each game gets a fresh code)</li>
      </ul>

      <H3>🌐 Online Mode</H3>
      <P>One shared room. Everyone clicking ONLINE PLAY from any machine lands in the same lobby. No codes, no copy-paste.</P>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Pick your crew member — others see you arrive</li>
        <li>Each crew member can only be claimed by one socket</li>
        <li>First-in is host; rehomes if they leave</li>
        <li>2+ players, all ready → host can start</li>
      </ul>

      <H3>🐺 Solo with Bots</H3>
      <P>From the party host panel, set bot count 1–5. Bots auto-pick remaining factions and play their own turns. Use this to learn the game.</P>
    </>
  );
}

function Tips() {
  return (
    <>
      <H>Strategy Tips</H>

      <H3>Early game</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Claim 6/8-token tiles first — they roll most often</li>
        <li>Don't develop everything to tier 2 right away — spread your claims wider for token coverage</li>
        <li>Watch the deck. Holding <strong>Witness Protection</strong> changes your risk math entirely</li>
      </ul>

      <H3>Mid game</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Develop tier 2 BEFORE tier 3 of anything else — tax compounds fast</li>
        <li>Track who's wealthy — they're closest to threshold-win and the prime attack target</li>
        <li>Trade aggressively. Convert excess Cash into Muscle for a strike, or Clout for cards</li>
      </ul>

      <H3>Late game</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Threshold-win sneaks up on the table. Saving cards like <strong>Block Party</strong> or <strong>Flip the Script</strong> for the kingmaker round wins games</li>
        <li>Coalition: even temporary alliances against the leader work — they have to pay tax twice</li>
        <li>Eliminations cascade. One bankrupt player feeds Cash to whoever ended their turn — protect tier-3 players from being singled out</li>
      </ul>

      <H3>By faction</H3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong className="text-oblock">O Block:</strong> turtle. Hold 3 tiles for 3+ rounds and the Iron Grip income compounds. You're hard to dislodge.</li>
        <li><strong className="text-compton">Compton:</strong> outspend everyone. The 25% develop discount + passive cash means you out-tax every opponent by mid-game.</li>
        <li><strong className="text-newyork">NY Rats:</strong> intel + sneaky. Peek hands before key turns. Use Free Pass to push through enemy lines.</li>
        <li><strong className="text-atlanta">Atlanta:</strong> connected districts win. Build a chain of 3+ adjacent same-type tiles for the big Clout bonus.</li>
        <li><strong className="text-craigwood">Craigwood:</strong> chaos. You start with 6 cards. Force events to fire. Wild Out at the worst moment for someone else.</li>
        <li><strong className="text-lakings">LA Kings:</strong> trade tax. Be the broker. The Industry Plant Clout adds up — encourage trades you're not even in.</li>
      </ul>
    </>
  );
}
