const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Speaker Series Brainstorm";
pres.theme = { headFontFace: "Poppins", bodyFontFace: "Poppins" };

const W = 13.333, H = 7.5;
const WHITE = "FFFFFF", SOFT = "B4BBDD", MUTED = "7F88B3", LINE = "2E3A78";
const REG = "Poppins", LIGHT = "Poppins Light", MED = "Poppins Medium", SEMI = "Poppins SemiBold";
const C = { sys: "6FD6FF", metal: "FF9F5A", ai: "B39DFF", mkt: "5EE0A0", health: "FF7AA8", fun: "FFD166" };
const img = f => "image/png;base64," + fs.readFileSync(path.join(__dirname, "img", f)).toString("base64");
const SIZES = JSON.parse(fs.readFileSync(path.join(__dirname, "img/sizes.json"), "utf8"));
const ratio = f => SIZES[f][0] / SIZES[f][1];

let page = 0;
function slide(bgFile, footer = true) {
  const s = pres.addSlide();
  s.background = { data: img(bgFile) };
  page++;
  if (footer) {
    s.addText("AZ Professional Development  ·  Speaker Series", { x: 0.6, y: 7.02, w: 6, h: 0.24, fontFace: REG, fontSize: 9, color: MUTED, margin: 0, isTextBox: true });
    s.addText(String(page), { x: W - 1.1, y: 7.02, w: 0.5, h: 0.24, fontFace: REG, fontSize: 9, color: MUTED, align: "right", margin: 0, isTextBox: true });
  }
  return s;
}
const T = (s, t, o) => s.addText(t, Object.assign({ fontFace: REG, color: WHITE, margin: 0, isTextBox: true, valign: "top" }, o));
const panel = (s, x, y, w, h, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign(
  { x, y, w, h, rectRadius: 0.16, fill: { color: "FFFFFF", transparency: 94 }, line: { color: "FFFFFF", transparency: 88, width: 0.75 } }, o));
const kicker = (s, t, color, x = 0.6, y = 0.55) => T(s, t, { x, y, w: 8, h: 0.26, fontFace: MED, fontSize: 11, color, charSpacing: 2 });
const title = (s, t, o = {}) => T(s, t, Object.assign({ x: 0.6, y: 0.85, w: 11.5, h: 0.8, fontFace: SEMI, fontSize: 34 }, o));

// "Who to book" / "Ask them" pair used on every talk block
function whoAsk(s, t, x, y, w, color, size = 10.5) {
  T(s, [
    { text: "Who  ", options: { fontFace: MED, color, breakLine: false } },
    { text: t.who, options: { color: SOFT, breakLine: true } },
    { text: "Ask  ", options: { fontFace: MED, color } },
    { text: t.ask, options: { color: WHITE, italic: true, fontFace: LIGHT } },
  ], { x, y, w, h: 0.9, fontSize: size, paraSpaceAfter: 4 });
}

// ------------------------------------------------------------------ content
const THEMES = [
  { key: "sys", name: "Systems that can't go down", sub: "Stories from the teams that get paged at 3am.", talks: [
    { t: "The DNS Bug That Took Down Half the Internet", star: 4, hook: "One empty DNS record inside AWS took Venmo, Snapchat and Fortnite offline for most of a day.", who: "SRE or incident commander at a cloud provider", ask: "What do you check first when everything is red?" },
    { t: "Trillions of Messages, One Migration", hook: "Discord moved every message it stores to a new database and went from 177 nodes to 72.", who: "Database engineer at a big consumer app", ask: "How do you test a migration you only get to run once?" },
    { t: "Charging a Card Exactly Once", hook: "Retries, timeouts and idempotency keys, or why double charges are the scariest bug in fintech.", who: "Payments engineer at Stripe, Ramp or Brex", ask: "What's the worst money bug you've seen reach prod?" },
  ] },
  { key: "metal", name: "Close to the metal", sub: "For the people who want to know what the computer is actually doing.", talks: [
    { t: "Rust Won the Kernel", hook: "Linux 7.0 shipped in April with Rust no longer marked experimental. New drivers are being written in it.", who: "Systems engineer on Android, Cloudflare or a kernel team", ask: "Where does Rust still get in your way?" },
    { t: "The Kernel Behind Every Chatbot", hook: "GPU kernels decide how fast and how cheap AI is. Most of the speedup comes from memory, not math.", who: "GPU performance engineer at NVIDIA or an AI lab", ask: "How do you know a kernel can't get any faster?" },
    { t: "Your Code Is Slow and the Profiler Knows Why", hook: "Flame graphs, cache misses and the one-line changes that make things 10x faster.", who: "Performance engineer at a trading firm or big tech", ask: "What's the biggest win you got from a tiny change?" },
  ] },
  { key: "ai", name: "Building with AI", sub: "What the job looks like now that models write a lot of the code.", talks: [
    { t: "75% of Google's New Code Is AI-Written", star: 2, hook: "That's Sundar Pichai's number from April. So what do engineers actually spend their day on now?", who: "Staff engineer who led an AI coding rollout", ask: "What do you look for in new grads now?" },
    { t: "Evals Are the New Unit Tests", hook: "How teams find out a model update quietly broke their product before users do.", who: "Applied AI engineer shipping LLM features", ask: "What's an eval that caught something humans missed?" },
    { t: "Why AI Keeps Getting Cheaper", hook: "Kimi K3 has 2.8T parameters but only runs 104B of them per token. Tricks like that keep cutting prices.", who: "Inference engineer at Together, Fireworks or Baseten", ask: "What's the real bottleneck: chips, memory or power?" },
  ] },
  { key: "mkt", name: "Markets", sub: "For the finance and quant crowd, and the engineers who build for them.", talks: [
    { t: "Microseconds Are Money", star: 1, hook: "Light moves faster through air than glass, so firms built microwave towers from Chicago to New Jersey.", who: "Low-latency dev or quant dev at a prop shop", ask: "Where's the next microsecond coming from?" },
    { t: "Betting on Everything", star: 3, hook: "Kalshi and Polymarket traded $53B in July, more than 10x what they did last September.", who: "Trader on an event-contracts desk", ask: "Where do retail traders give away the most edge?" },
    { t: "How Market Makers Actually Make Money", hook: "Spreads, inventory and adverse selection. Being right about the price isn't enough.", who: "Options trader at Optiver, IMC or SIG", ask: "What's a trade you were right about and still lost on?" },
    { t: "Stablecoins Got a Rulebook", hook: "The GENIUS Act became law in July 2025, and banks spent this year building the rails.", who: "Payments or digital-assets lead at a bank or fintech", ask: "Would you run payroll on stablecoins today?" },
  ] },
  { key: "health", name: "Health tech", sub: "Where software meets patients and the stakes go up.", talks: [
    { t: "The AI That Writes Your Doctor's Notes", star: 5, hook: "Epic launched AI Charting in February. Abridge is already in 300+ health systems.", who: "Engineer at an ambient-scribe company", ask: "What happens when it mishears a dosage?" },
    { t: "Software the FDA Signs Off On", hook: "About 1,500 AI devices are FDA-cleared, most of them reading scans in radiology.", who: "ML or regulatory engineer at a medtech company", ask: "How do you update a model the FDA already cleared?" },
    { t: "Your Medical Records Finally Have an API", hook: "Over 1,000 Epic hospitals are live on TEFCA, and FHIR lets apps pull a patient's full history.", who: "Interoperability engineer at Epic or a health-data startup", ask: "Why did this take until 2026?" },
  ] },
  { key: "fun", name: "Wildcards", sub: "Not career advice. Just really fun.", talks: [
    { t: "Rebuilding Mario 64 From Scratch", hook: "Fans turned the N64 game back into readable C. Now it runs at 60fps on basically anything.", who: "Reverse engineer or security researcher", ask: "How do you read code that was never meant to be read?" },
    { t: "Why Fighting Games Rewind Time", hook: "Rollback netcode guesses your opponent's input, then quietly rewinds a few frames when it guessed wrong.", who: "Netcode engineer at a game studio", ask: "How many frames can you rewind before players notice?" },
  ] },
];
const byStar = THEMES.flatMap(th => th.talks.map(t => ({ ...t, theme: th }))).filter(t => t.star).sort((a, b) => a.star - b.star);

// ------------------------------------------------------------------ 1. cover
{
  const s = slide("bg-cover.png", false);
  T(s, "AZ PROFESSIONAL DEVELOPMENT  ·  FALL 2026", { x: 0.75, y: 1.2, w: 7, h: 0.3, fontFace: MED, fontSize: 12, color: C.sys, charSpacing: 3 });
  T(s, [{ text: "18 talks we'd", options: { breakLine: true } }, { text: "actually show up for" }], { x: 0.75, y: 1.75, w: 6.6, h: 1.8, fontFace: SEMI, fontSize: 42, lineSpacingMultiple: 0.95 });
  T(s, "A speaker brainstorm for the pledge class. Software, markets, health tech and a couple of wildcards.", { x: 0.75, y: 3.6, w: 5.6, h: 0.9, fontFace: LIGHT, fontSize: 16, color: SOFT });
  // loose stack of screens from the deep dives
  s.addImage({ data: img("mock-agent.png"), x: 7.0, y: 0.95, w: 5.6, h: 5.6 / ratio("mock-agent.png"), rotate: -4 });
  s.addImage({ data: img("mock-market.png"), x: 9.5, y: 2.9, w: 3.4, h: 3.4 / ratio("mock-market.png"), rotate: 5 });
  s.addImage({ data: img("mock-status.png"), x: 6.55, y: 3.9, w: 4.6, h: 4.6 / ratio("mock-status.png"), rotate: -1.5 });
}

// ------------------------------------------------------------------ 2. the brief
{
  const s = slide("bg-plain.png");
  kicker(s, "THE BRIEF", C.sys);
  title(s, "Who we're booking for");
  const stats = [["2/3", "want to go into software engineering", C.sys], ["1/3", "are aiming for finance and quant", C.mkt], ["A few", "are pre-health or into health tech", C.health]];
  stats.forEach(([n, l, c], i) => {
    const y = 2.1 + i * 1.45;
    T(s, n, { x: 0.6, y, w: 2.9, h: 0.9, fontFace: SEMI, fontSize: n.length > 3 ? 40 : 48, color: c, valign: "middle" });
    T(s, l, { x: 3.55, y, w: 3.3, h: 0.9, fontSize: 15, color: SOFT, valign: "middle" });
  });
  panel(s, 7.2, 2.0, 5.5, 4.45);
  T(s, "A talk is worth it if", { x: 7.6, y: 2.35, w: 4.8, h: 0.4, fontFace: MED, fontSize: 17 });
  const pts = ["There's one real story from inside the company", "The SWE people take notes, not just the finance people", "The speaker sticks around after to talk"];
  pts.forEach((p, i) => {
    T(s, String(i + 1), { x: 7.6, y: 3.05 + i * 0.95, w: 0.4, h: 0.4, fontFace: SEMI, fontSize: 18, color: C.sys });
    T(s, p, { x: 8.1, y: 3.07 + i * 0.95, w: 4.2, h: 0.8, fontSize: 14 });
  });
  T(s, "Every number in here is current as of September 2026.", { x: 7.6, y: 5.85, w: 4.8, h: 0.3, fontSize: 10.5, color: MUTED, italic: true, fontFace: LIGHT });
}

// ------------------------------------------------------------------ 3. shortlist
{
  const s = slide("bg-plain2.png");
  kicker(s, "THE SHORTLIST", C.fun);
  title(s, "Six themes, 18 talks");
  T(s, "★ made the top 5", { x: 10.2, y: 1.05, w: 2.5, h: 0.3, fontSize: 11, color: C.fun, align: "right" });
  const cw = 1.93, gap = 0.1, x0 = 0.6;
  THEMES.forEach((th, i) => {
    const x = x0 + i * (cw + gap);
    s.addShape(pres.shapes.OVAL, { x, y: 2.12, w: 0.16, h: 0.16, fill: { color: C[th.key] }, line: { color: C[th.key], width: 0 } });
    T(s, th.name, { x, y: 2.4, w: cw, h: 0.7, fontFace: MED, fontSize: 14, color: C[th.key] });
    T(s, th.talks.map((t, k) => ({ text: (t.star ? "★ " : "") + t.t, options: { breakLine: k < th.talks.length - 1, color: t.star ? WHITE : SOFT, fontFace: t.star ? MED : REG } })),
      { x, y: 3.25, w: cw - 0.1, h: 3.5, fontSize: 12.5, paraSpaceAfter: 14 });
  });
}

// ------------------------------------------------------------------ 4-9. theme spreads
function themeHeader(s, th, idx, x = 0.6, w = 11.5) {
  kicker(s, `THEME 0${idx + 1}`, C[th.key], x);
  title(s, th.name, { x, w });
  T(s, th.sub, { x, y: 1.62, w, h: 0.36, fontFace: LIGHT, fontSize: 14, color: SOFT });
}
const talkTitle = (t) => (t.star ? "★  " : "") + t.t;
function talkBox(s, t, x, y, w, h, c, o = {}) {
  const ts = o.titleSize || 15, bs = o.bodySize || 11, ms = o.metaSize || 10;
  const runs = [
    { text: talkTitle(t), options: { fontFace: MED, fontSize: ts, color: WHITE, breakLine: true, paraSpaceAfter: 4 } },
    { text: t.hook, options: { fontSize: bs, color: SOFT, breakLine: true, paraSpaceAfter: o.gap || 8 } },
  ];
  if (!o.noMeta) runs.push(
    { text: "Who  ", options: { fontFace: MED, fontSize: ms, color: c } },
    { text: t.who, options: { fontSize: ms, color: SOFT, breakLine: true, paraSpaceAfter: 2 } },
    { text: "Ask  ", options: { fontFace: MED, fontSize: ms, color: c } },
    { text: t.ask, options: { fontSize: ms, color: WHITE, italic: true, fontFace: LIGHT } });
  T(s, runs, { x, y, w, h, valign: o.valign || "top" });
}

// Systems: art column on the left, stacked rows on the right
{
  const th = THEMES[0], c = C[th.key], s = slide("bg-sys.png");
  s.addImage({ data: img("art-systems.png"), x: 0.6, y: 2.3, w: 2.9, h: 2.9 / ratio("art-systems.png") });
  themeHeader(s, th, 0);
  th.talks.forEach((t, i) => {
    const y = 2.3 + i * 1.5;
    panel(s, 3.95, y, 8.8, 1.32);
    talkBox(s, t, 4.25, y + 0.1, 4.7, 1.12, c, { noMeta: true, titleSize: 14.5, bodySize: 10.5, valign: "middle" });
    whoAsk(s, t, 9.2, y + 0.2, 3.35, c, 10);
  });
}

// Close to the metal: three tall cards
{
  const th = THEMES[1], c = C[th.key], s = slide("bg-metal.png");
  s.addImage({ data: img("art-metal.png"), x: 10.55, y: 0.3, w: 2.3, h: 2.3 / ratio("art-metal.png"), sizing: { type: "crop", x: 0, y: 0, w: 2.3, h: 1.7 } });
  themeHeader(s, th, 1, 0.6, 9.5);
  th.talks.forEach((t, i) => {
    const x = 0.6 + i * 4.1, y = 2.3;
    panel(s, x, y, 3.85, 4.4);
    T(s, `0${i + 1}`, { x: x + 0.3, y: y + 0.25, w: 1, h: 0.5, fontFace: SEMI, fontSize: 22, color: c });
    T(s, talkTitle(t), { x: x + 0.3, y: y + 0.85, w: 3.3, h: 0.8, fontFace: MED, fontSize: 15 });
    T(s, t.hook, { x: x + 0.3, y: y + 1.7, w: 3.3, h: 1.2, fontSize: 12, color: SOFT });
    s.addShape(pres.shapes.LINE, { x: x + 0.3, y: y + 3.0, w: 3.25, h: 0, line: { color: LINE, width: 0.75 } });
    whoAsk(s, t, x + 0.3, y + 3.15, 3.3, c, 10);
  });
}

// Building with AI: rows on the left, token art panel on the right
{
  const th = THEMES[2], c = C[th.key], s = slide("bg-ai.png");
  themeHeader(s, th, 2, 0.6, 7.5);
  th.talks.forEach((t, i) => {
    const y = 2.3 + i * 1.5;
    talkBox(s, t, 0.6, y - 0.05, 7.5, 1.35, c, { gap: 5 });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: 0.6, y: y + 1.33, w: 7.3, h: 0, line: { color: LINE, width: 0.75 } });
  });
  panel(s, 8.5, 2.2, 4.25, 4.5, { fill: { color: "FFFFFF", transparency: 96 } });
  s.addImage({ data: img("art-ai.png"), x: 8.8, y: 3.2, w: 3.65, h: 3.65 / ratio("art-ai.png") });
  T(s, "Every word here was predicted one token at a time.", { x: 8.85, y: 5.1, w: 3.6, h: 0.7, fontFace: LIGHT, fontSize: 11, color: SOFT, italic: true });
}

// Markets: 2x2 grid with a price tape down the right edge
{
  const th = THEMES[3], c = C[th.key], s = slide("bg-mkt.png");
  s.addImage({ data: img("art-markets.png"), x: 11.5, y: 0.35, w: 1.35, h: 1.35 / ratio("art-markets.png"), sizing: { type: "crop", x: 0, y: 0, w: 1.35, h: 1.75 } });
  themeHeader(s, th, 3, 0.6, 10.3);
  th.talks.forEach((t, i) => {
    const x = 0.6 + (i % 2) * 6.1, y = 2.3 + Math.floor(i / 2) * 2.2;
    panel(s, x, y, 5.9, 2.0);
    T(s, talkTitle(t), { x: x + 0.3, y: y + 0.2, w: 5.3, h: 0.36, fontFace: MED, fontSize: 15 });
    T(s, t.hook, { x: x + 0.3, y: y + 0.58, w: 5.3, h: 0.55, fontSize: 10.5, color: SOFT });
    whoAsk(s, t, x + 0.3, y + 1.2, 5.3, c, 10);
  });
}

// Health: heartbeat across the top, numbered columns
{
  const th = THEMES[4], c = C[th.key], s = slide("bg-health.png");
  themeHeader(s, th, 4);
  s.addImage({ data: img("art-health.png"), x: 0.6, y: 2.3, w: 12.15, h: 12.15 / ratio("art-health.png"), transparency: 25 });
  th.talks.forEach((t, i) => {
    const x = 0.6 + i * 4.15, y = 3.75;
    T(s, String(i + 1), { x, y, w: 0.6, h: 0.7, fontFace: SEMI, fontSize: 36, color: c });
    T(s, talkTitle(t), { x: x + 0.65, y: y + 0.08, w: 3.2, h: 0.75, fontFace: MED, fontSize: 14.5 });
    T(s, t.hook, { x: x + 0.65, y: y + 0.9, w: 3.25, h: 0.95, fontSize: 10.5, color: SOFT });
    whoAsk(s, t, x + 0.65, y + 1.95, 3.25, c, 10);
  });
}

// Wildcards: two big panels, each with its own art
{
  const th = THEMES[5], c = C[th.key], s = slide("bg-fun.png");
  themeHeader(s, th, 5);
  const arts = [["art-pixel.png", 1.35, 1.35 / ratio("art-pixel.png")], ["art-rollback.png", 3.6, 3.6 / ratio("art-rollback.png")]];
  th.talks.forEach((t, i) => {
    const x = 0.6 + i * 6.2, y = 2.25;
    panel(s, x, y, 5.95, 4.45);
    const [a, aw, ah] = arts[i];
    s.addImage({ data: img(a), x: x + 0.35, y: y + 0.35, w: aw, h: ah });
    T(s, t.t, { x: x + 0.35, y: y + 1.95, w: 5.3, h: 0.4, fontFace: MED, fontSize: 17 });
    T(s, t.hook, { x: x + 0.35, y: y + 2.4, w: 5.3, h: 0.75, fontSize: 11.5, color: SOFT });
    whoAsk(s, t, x + 0.35, y + 3.35, 5.3, c, 10.5);
  });
}

// ------------------------------------------------------------------ 10. top five
{
  const s = slide("bg-cover.png");
  kicker(s, "IF WE ONLY BOOK FIVE", C.fun);
  title(s, "The top 5 for a mixed room");
  const why = [
    "SWE and quant people both get something out of it. Hardware, networks and real money on the line.",
    "Everyone in the room is quietly wondering what this means for their first job.",
    "The hottest market of the year, and it's pricing plus exchange engineering in one talk.",
    "Best story on the list. Half the room had an app go down that day.",
    "Health, AI and a startup vs. incumbent fight, all in one.",
  ];
  byStar.forEach((t, i) => {
    const y = 1.95 + i * 0.95;
    T(s, String(i + 1), { x: 0.6, y: y - 0.05, w: 0.8, h: 0.8, fontFace: SEMI, fontSize: 40, color: C[t.theme.key] });
    T(s, t.t, { x: 1.55, y: y + 0.02, w: 5.2, h: 0.4, fontFace: MED, fontSize: 16 });
    T(s, t.theme.name, { x: 1.55, y: y + 0.42, w: 5.2, h: 0.3, fontSize: 10, color: C[t.theme.key] });
    T(s, why[i], { x: 6.95, y: y + 0.08, w: 5.8, h: 0.7, fontSize: 12, color: SOFT });
    if (i < 4) s.addShape(pres.shapes.LINE, { x: 1.55, y: y + 0.84, w: 11.2, h: 0, line: { color: LINE, width: 0.75 } });
  });
}

// ------------------------------------------------------------------ 11-15. deep dives
const DIVES = [
  { mock: "mock-hft.png", ratio: 2240 / 1520, hook: "Light moves about 50% faster through air than through glass fiber, so trading firms built chains of microwave towers from Chicago to New Jersey.",
    cover: ["Where the time goes: network, kernel, code, exchange", "FPGAs, kernel bypass, and why C++ still runs the floor", "How a firm decides one microsecond is worth millions"],
    who: "Low-latency engineer or quant dev at a prop shop like Jump, HRT, Optiver or Citadel Securities" },
  { mock: "mock-agent.png", ratio: 2240 / 1520, hook: "In April, Sundar Pichai said 75% of Google's new code is now AI-generated. In late 2024 it was about a quarter.",
    cover: ["What a normal day looks like when an agent writes the first draft", "How code review, testing and on-call have changed", "Which skills got more valuable, and which got cheap"],
    who: "Staff engineer who led an AI coding rollout at big tech or a fast-growing startup" },
  { mock: "mock-market.png", ratio: 1960 / 1760, hook: "Kalshi and Polymarket traded $53B in July, up from under $5B last September. Trading firms now run dedicated desks for it.",
    cover: ["Pricing a contract that has never traded before", "Making markets on an exchange that's mostly sports", "Matching engines, settlement and the CFTC"],
    who: "Trader or quant on an event-contracts desk. Susquehanna was Kalshi's first institutional market maker" },
  { mock: "mock-status.png", ratio: 2240 / 1640, hook: "On Oct 20, 2025, a race condition left DynamoDB's us-east-1 endpoint with an empty DNS record. Venmo, Snapchat, Fortnite and Canvas went down with it.",
    cover: ["How one empty DNS record cascaded for 14 hours", "What an incident call actually sounds like at 3am", "Writing a postmortem that doesn't blame a person"],
    who: "SRE or incident commander at a cloud provider or a big consumer app" },
  { mock: "mock-note.png", ratio: 2360 / 1600, hook: "Epic launched AI Charting in February. Two months later Abridge, already in 300+ health systems, raised at a $5.3B valuation.",
    cover: ["Turning a messy 15-minute visit into a clean note", "Keeping a doctor in the loop without slowing them down", "Epic vs. the startups: build, buy or partner"],
    who: "ML or product engineer at an ambient-scribe company, or a health system's clinical informatics lead" },
];
byStar.forEach((t, i) => {
  const d = DIVES[i], c = C[t.theme.key];
  const s = slide(`bg-${t.theme.key}.png`);
  const left = i % 2 === 0; // alternate which side the screen sits on
  const vw = 6.35, vh = vw / ratio(d.mock);
  const vx = left ? 0.3 : W - 0.3 - vw, vy = (H - vh) / 2 - 0.1;
  s.addImage({ data: img(d.mock), x: vx, y: vy, w: vw, h: vh });
  const tx = left ? 6.95 : 0.6, tw = 5.75;
  kicker(s, `TOP 5  ·  #${i + 1}  ·  ${t.theme.name.toUpperCase()}`, c, tx, 0.7);
  T(s, [
    { text: t.t, options: { fontFace: SEMI, fontSize: 27, breakLine: true, paraSpaceAfter: 10 } },
    { text: d.hook, options: { fontFace: LIGHT, fontSize: 13, color: SOFT } },
  ], { x: tx, y: 1.02, w: tw, h: 2.25, lineSpacingMultiple: 0.98 });
  T(s, "What they'd cover", { x: tx, y: 3.4, w: tw, h: 0.3, fontFace: MED, fontSize: 12, color: c });
  T(s, d.cover.map((b, k) => ({ text: b, options: { bullet: { indent: 14 }, breakLine: k < 2 } })), { x: tx, y: 3.75, w: tw, h: 1.25, fontSize: 12.5, paraSpaceAfter: 5 });
  s.addShape(pres.shapes.LINE, { x: tx, y: 5.2, w: tw, h: 0, line: { color: LINE, width: 0.75 } });
  T(s, [
    { text: "Who to book", options: { fontFace: MED, color: c, breakLine: true } },
    { text: d.who, options: { color: SOFT } },
  ], { x: tx, y: 5.35, w: tw, h: 0.75, fontSize: 11 });
  T(s, [
    { text: "Ask them  ", options: { fontFace: MED, color: c } },
    { text: t.ask, options: { italic: true, fontFace: LIGHT, color: WHITE } },
  ], { x: tx, y: 6.2, w: tw, h: 0.4, fontSize: 13 });
});

// ------------------------------------------------------------------ 16. landing speakers
{
  const s = slide("bg-plain.png");
  kicker(s, "NEXT", C.sys);
  title(s, "How we actually land these people");
  const cols = [
    ["Start with alumni", C.sys, [
      "LinkedIn → UC Berkeley → Alumni. Filter by company, then by Engineering or Finance.",
      "Ask older actives who they already know. A warm intro gets a yes way faster than a cold DM.",
    ]],
    ["Search LinkedIn like this", C.mkt, null],
    ["Find who wrote the blog post", C.ai, [
      "If someone wrote the engineering post, they already have the talk.",
      "Discord, Cloudflare, Stripe, Jane Street, HRT and Abridge all publish engineering blogs with names on every post.",
    ]],
  ];
  cols.forEach(([h, c, body], i) => {
    const x = 0.6 + i * 4.15;
    T(s, h, { x, y: 2.0, w: 3.9, h: 0.4, fontFace: MED, fontSize: 16, color: c });
    if (body) {
      T(s, body.map((b, k) => ({ text: b, options: { breakLine: k < body.length - 1 } })), { x, y: 2.5, w: 3.8, h: 2.0, fontSize: 12, color: SOFT, paraSpaceAfter: 10 });
    } else {
      const qs = ['"low latency" AND FPGA AND Berkeley', '"site reliability" AND Berkeley', '"ambient" AND engineer AND health'];
      qs.forEach((q, k) => {
        panel(s, x, 2.5 + k * 0.6, 3.95, 0.48, { rectRadius: 0.08, fill: { color: "000000", transparency: 70 } });
        T(s, q, { x: x + 0.14, y: 2.5 + k * 0.6, w: 3.75, h: 0.48, fontFace: "Courier New", fontSize: 9, color: WHITE, valign: "middle" });
      });
    }
  });
  panel(s, 0.6, 4.95, 12.15, 1.55);
  T(s, "The DM that gets replies", { x: 0.95, y: 5.15, w: 5, h: 0.35, fontFace: MED, fontSize: 13, color: C.fun });
  T(s, "Hi Sam, I'm in AZ at Berkeley. Loved your post on moving your message store to ScyllaDB. Would you do a 30-minute talk for about 40 students who want to work on stuff like this? Zoom or in person, any week this fall works.",
    { x: 0.95, y: 5.55, w: 11.4, h: 0.8, fontFace: LIGHT, fontSize: 13.5, italic: true });
}

// ------------------------------------------------------------------ 17. close
{
  const s = slide("bg-cover.png");
  T(s, "Which ones are we booking?", { x: 0.75, y: 2.35, w: 9, h: 1.0, fontFace: SEMI, fontSize: 44 });
  T(s, [
    { text: "Vote for your top 3 in the form. The most-voted talks get outreach first.", options: { breakLine: true, paraSpaceAfter: 8 } },
    { text: "Know someone at one of these companies? Tell us. Warm intros get a yes fastest." },
  ], { x: 0.75, y: 3.5, w: 8.6, h: 1.2, fontFace: LIGHT, fontSize: 16, color: SOFT });
  s.addImage({ data: img("art-pixel.png"), x: 10.2, y: 2.4, w: 2.2, h: 2.2 / ratio("art-pixel.png") });
}

pres.writeFile({ fileName: path.join(__dirname, "AZ-Speaker-Series-Brainstorm.pptx") }).then(f => console.log("wrote", f));
