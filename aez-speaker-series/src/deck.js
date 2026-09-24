const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "AEZ Speaker Series, Fall 2026";
pres.theme = { headFontFace: "Poppins", bodyFontFace: "Poppins" };

// ---------------------------------------------------------------- design tokens
const W = 13.333;
const INK = "0F1740", PANEL = "16205C", EDGE = "4F63D9", KTFILL = "1E2C72";
const GOLD = "FDB515", WHITE = "FFFFFF", SOFT = "D3D8F0", MUTED = "98A3D6", RULE = "34418A", NUM = "9FB2FF";
const LIGHT = "Poppins Light", REG = "Poppins", MED = "Poppins Medium", SEMI = "Poppins SemiBold";
const NAV = ["Software", "Finance & Quant", "Health Tech", "Top Picks", "Next Steps"];
const TOP_Y = 1.68, BOT_Y = 6.62;   // content area shared by every content slide
const LX = 0.6, RX = 12.73;          // left and right edges

const IMG = path.join(__dirname, "img");
const cache = {};
const data = f => (cache[f] ||= (f.endsWith(".jpg") ? "image/jpeg" : "image/png") + ";base64," + fs.readFileSync(path.join(IMG, f)).toString("base64"));
const SIZES = JSON.parse(fs.readFileSync(path.join(IMG, "sizes.json"), "utf8"));
const ratio = f => SIZES[f][0] / SIZES[f][1];

// ---------------------------------------------------------------- helpers
const T = (s, t, o) => s.addText(t, Object.assign({ fontFace: REG, color: WHITE, margin: 0, isTextBox: true, valign: "top" }, o));
const hl = (str, base = {}) => str.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(p =>
  p.startsWith("[[") ? { text: p.slice(2, -2), options: Object.assign({}, base, { color: GOLD }) } : { text: p, options: Object.assign({}, base) });
const para = (runs, last, extra = {}) => { Object.assign(runs[runs.length - 1].options, { breakLine: !last }, extra); return runs; };
const bullets = (items, base = {}) => items.flatMap((b, k) => {
  const r = hl(b, Object.assign({ bullet: { indent: 14 } }, base));
  r.forEach((run, j) => { if (j > 0) delete run.options.bullet; });
  r[r.length - 1].options.breakLine = k < items.length - 1;
  return r;
});
const line = (s, x, y, w, h, color = RULE, width = 0.75, dash) => s.addShape(pres.shapes.LINE, { x, y, w, h, line: Object.assign({ color, width }, dash ? { dashType: dash } : {}) });
const rrect = (s, x, y, w, h, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, rectRadius: 0.14, fill: { color: PANEL }, line: { color: EDGE, width: 1 } }, o));
const img = (s, f, x, y, w, h, o = {}) => s.addImage(Object.assign({ data: data(f), x, y, w, h: h ?? w / ratio(f) }, o));

// One icon container everywhere: white circle, colour icon or brand mark inside
function icon(s, f, x, y, d) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: WHITE }, line: { color: GOLD, width: 1.25 } });
  const k = f.startsWith("mk-") ? 0.56 : 0.6;
  img(s, f, x + d * (1 - k) / 2, y + d * (1 - k) / 2, d * k, d * k);
}
const num = (s, n, x, y) => T(s, n, { x, y, w: 0.8, h: 0.5, fontFace: LIGHT, fontSize: 22, color: NUM, align: "right" });
// Gold pill that sits on a card's top edge
function pick(s, x, y) {
  rrect(s, x, y - 0.17, 1.15, 0.34, { fill: { color: GOLD }, line: { color: GOLD, width: 0 }, rectRadius: 0.17 });
  T(s, "OUR PICK", { x, y: y - 0.17, w: 1.15, h: 0.34, fontFace: SEMI, fontSize: 9.5, color: INK, align: "center", valign: "middle", charSpacing: 1.5 });
}
const titleHook = (t, ts, bs) => [
  { text: t.title, options: { fontFace: MED, fontSize: ts, breakLine: true, paraSpaceAfter: 5 } },
  ...para(hl(t.hook, { fontSize: bs, color: SOFT }), true),
];
const meta = (t, ms) => [
  { text: "Book  ", options: { fontFace: MED, fontSize: ms, color: GOLD } },
  { text: t.who, options: { fontSize: ms, color: SOFT, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Ask  ", options: { fontFace: MED, fontSize: ms, color: GOLD } },
  { text: t.ask, options: { fontSize: ms, fontFace: LIGHT, italic: true } },
];

function base(bg = "bg-dark.jpg") {
  const s = pres.addSlide();
  s.background = { data: data(bg) };
  return s;
}
function content(title, sub, navIdx) {
  const s = base();
  if (title) {
    line(s, 0.55, 0.42, 0, 0.95, WHITE, 1);
    T(s, title, { x: 0.8, y: 0.3, w: 11.2, h: 0.66, fontFace: LIGHT, fontSize: 32 });
  }
  if (sub) T(s, sub, { x: 0.8, y: 0.98, w: 11.4, h: 0.36, fontFace: LIGHT, fontSize: 15, italic: true, color: "DCE0F5" });
  img(s, "az-mark.png", 12.28, 0.3, 0.72, 0.72);
  T(s, "AEZ", { x: 0.55, y: 6.93, w: 1.1, h: 0.36, fontFace: SEMI, fontSize: 17, color: GOLD, charSpacing: 2, valign: "middle" });
  const x0 = 2.2, cw = 2.1;
  NAV.forEach((n, i) => {
    T(s, n, { x: x0 + i * cw, y: 6.95, w: cw, h: 0.32, fontSize: 11.5, align: "center", valign: "middle", color: i === navIdx ? WHITE : MUTED, fontFace: i === navIdx ? MED : REG });
    if (i < NAV.length - 1) line(s, x0 + (i + 1) * cw, 6.97, 0, 0.28, RULE, 1);
  });
  return s;
}
function bar(s, label, x, y, w, h, lines, size = 13.5) {
  rrect(s, x, y, w, h, { fill: { color: KTFILL }, line: { color: KTFILL, width: 0 }, rectRadius: 0.12 });
  rrect(s, x - 0.06, y - 0.2, w + 0.12, 0.42, { fill: { color: GOLD }, line: { color: GOLD, width: 0 }, rectRadius: 0.08 });
  T(s, label, { x, y: y - 0.2, w, h: 0.42, fontFace: MED, fontSize: 15, color: INK, align: "center", valign: "middle" });
  T(s, lines.flatMap((l, i) => para(hl(l), i === lines.length - 1, { paraSpaceAfter: 6 })), { x: x + 0.35, y: y + 0.3, w: w - 0.7, h: h - 0.38, fontSize: size, valign: "middle" });
}
// Standard talk card: icon + number, title/hook, rule, Book/Ask
function talkCard(s, t, ic, x, y, w, h, n, o = {}) {
  rrect(s, x, y, w, h);
  icon(s, ic, x + 0.3, y + 0.32, 0.68);
  if (n) num(s, n, x + w - 1.1, y + 0.36);
  if (o.pick) pick(s, x + w / 2 - 0.575, y);
  const metaH = o.metaH || 1.35;
  T(s, titleHook(t, o.ts || 17, o.bs || 13), { x: x + 0.3, y: y + 1.2, w: w - 0.6, h: h - 1.2 - metaH - 0.25 });
  line(s, x + 0.3, y + h - metaH - 0.05, w - 0.6, 0, RULE, 0.75);
  T(s, meta(t, o.ms || 12), { x: x + 0.3, y: y + h - metaH, w: w - 0.6, h: metaH - 0.28, valign: "bottom" });
}
function divider(n, title, subs) {
  const s = base();
  img(s, "plexus-top-light.png", 0, 0, W, 7.5);
  img(s, "az-mark.png", 12.28, 0.3, 0.72, 0.72);
  T(s, `0${n}`, { x: 0.75, y: 4.45, w: 2, h: 0.6, fontFace: LIGHT, fontSize: 30, color: GOLD });
  line(s, 0.8, 5.12, 0.9, 0, GOLD, 2);
  T(s, title, { x: 0.72, y: 5.3, w: 7, h: 1.0, fontFace: LIGHT, fontSize: 50 });
  subs.forEach((t, i) => {
    const y = 6.3 - (subs.length - 1 - i) * 0.72, x = 7.35 + i * 0.5;
    s.addShape(pres.shapes.OVAL, { x, y: y - 0.15, w: 0.3, h: 0.3, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    line(s, x + 0.3, y, 1.1, 0, "8FA8FF", 1.25);
    T(s, t, { x: x + 1.6, y: y - 0.22, w: 3.9, h: 0.44, fontSize: 16, valign: "middle" });
  });
}

const TALK = {
  dns: { title: "The DNS Bug That Broke the Internet", hook: "In Oct 2025, one empty DNS record inside AWS took down Venmo, Snapchat, Fortnite and Canvas.", who: "SRE or incident commander at a cloud provider", ask: "What do you check first when everything is red?" },
  pg: { title: "One Database, 800 Million Users", hook: "OpenAI runs ChatGPT on one Postgres primary and about 50 read replicas, with no sharding.", who: "Database or infra engineer at an AI company", ask: "When do you finally give up and shard?" },
  discord: { title: "Moving Every Discord Message", hook: "Discord moved every message it stores to ScyllaDB and went from 177 database nodes to 72.", who: "Storage engineer at a big consumer app", ask: "How do you test a migration you only get to run once?" },
  rust: { title: "Rust Is in the Kernel Now", hook: "Linux 7.0 shipped in April with Rust officially out of \"experimental.\" New drivers are being written in it.", who: "Systems engineer on Android, Cloudflare or a kernel team", ask: "Where does Rust still get in your way?" },
  gpu: { title: "The Kernel Behind Every Chatbot", hook: "GPU kernels decide how fast and cheap AI gets, and most of the speedup comes from moving memory.", who: "GPU performance engineer at NVIDIA or an AI lab", ask: "How do you know a kernel is maxed out?" },
  perf: { title: "Why Your Code Is Slow", hook: "Reading flame graphs to find the one-line change that makes a service 10x faster.", who: "Performance engineer at a trading firm or big tech", ask: "What's the biggest win you got from a tiny change?" },
  google: { title: "75% of Google's New Code Is Written by AI", hook: "Sundar Pichai's number from April 2026. In late 2024 it was about a quarter.", who: "Staff engineer who led an AI coding rollout", ask: "What do you look for in new grads now?" },
  evals: { title: "Testing an LLM Before Users Do", hook: "How teams catch a model update that breaks their product.", who: "Applied AI engineer shipping LLM features", ask: "What's an eval that caught something a human missed?" },
  cheap: { title: "Why AI Keeps Getting Cheaper", hook: "Kimi K3 has 2.8T parameters but only runs 104B of them per token. Tricks like that keep pushing prices down.", who: "Inference engineer at Fireworks or Baseten", ask: "What's the real bottleneck now: chips, memory or power?" },
  mario: { title: "Rebuilding Mario 64 From Scratch", hook: "Fans turned the original N64 game back into readable C code. Fan-made PC ports now run it natively, some at 60fps.", who: "Reverse engineer or security researcher", ask: "How do you read code never meant to be read?" },
  rollback: { title: "Why Fighting Games Rewind Time", hook: "Rollback netcode guesses your opponent's input, then rewinds a few frames when it guesses wrong. Street Fighter 6 runs on it.", who: "Netcode engineer at a game studio", ask: "How many frames can you rewind unnoticed?" },
  hft: { title: "Microseconds Are Money", hook: "Light moves about 50% faster through air than through glass fiber, so trading firms built microwave towers from Chicago to New Jersey.", who: "Low-latency engineer at Jump, HRT, Optiver or Citadel Securities", ask: "Where does the next microsecond come from?" },
  mm: { title: "How Market Makers Actually Make Money", hook: "You can be right about the price and still lose money. Here's why.", who: "Options trader at Optiver, IMC or SIG", ask: "Ever been right and still lost money?" },
  pred: { title: "Betting on Everything", hook: "Kalshi and Polymarket traded $53B in July, up from under $5B last September. Most of it is sports.", who: "Trader on an event-contracts desk", ask: "Where does retail lose the most edge?" },
  stripe: { title: "Charging a Card Exactly Once", hook: "Retries and idempotency keys, and why a double charge is fintech's worst bug.", who: "Payments engineer at Stripe, Ramp or Brex", ask: "What's the worst money bug you've seen reach production?" },
  stable: { title: "Stablecoins Got a Rulebook", hook: "The GENIUS Act became law in July 2025. This year banks and fintechs started building on it.", who: "Digital-assets lead at a bank or fintech", ask: "Would you run payroll on stablecoins today?" },
  scribe: { title: "The AI That Writes Your Doctor's Notes", hook: "Epic launched AI Charting in February 2026. Abridge, already in 300+ health systems, is valued at $5.3B.", who: "Engineer at Abridge or a similar startup", ask: "What happens when it mishears a dosage?" },
  fda: { title: "Software the FDA Signs Off On", hook: "About 1,500 AI devices are FDA-cleared, and most of them read medical images.", who: "ML or regulatory engineer in medtech", ask: "How do you update a model the FDA already cleared?" },
  fhir: { title: "Your Medical Records Finally Have an API", hook: "Over 1,000 Epic hospitals are on TEFCA, the national records network, and FHIR APIs let apps pull a patient's records.", who: "Interoperability engineer at Epic or a health-data startup", ask: "Why did this take until 2026?" },
};
// ================================================================= 1. title
{
  const s = base();
  img(s, "plexus-bottom-light.png", 0, 0, W, 7.5);
  img(s, "az-mark.png", 3.35, 2.1, 1.75, 1.75);
  line(s, 5.62, 2.72, 0.5, 0.5, "8FA8FF", 1.25);
  s.addShape(pres.shapes.LINE, { x: 5.62, y: 2.72, w: 0.5, h: 0.5, flipV: true, line: { color: "8FA8FF", width: 1.25 } });
  T(s, "Speaker Series", { x: 6.6, y: 2.22, w: 6, h: 0.8, fontFace: LIGHT, fontSize: 44 });
  T(s, "Fall 2026  ·  Professional Development", { x: 6.64, y: 3.08, w: 6, h: 0.4, fontSize: 15, color: GOLD });
}

// ================================================================= 2. about
{
  const s = base();
  img(s, "az-mark-white.png", 4.05, 1.35, 5.2, 5.2, { transparency: 93 });
  line(s, 0.55, 0.42, 0, 0.95, WHITE, 1);
  T(s, "About This Deck", { x: 0.8, y: 0.38, w: 10, h: 0.9, fontFace: LIGHT, fontSize: 40 });
  img(s, "az-mark.png", 12.28, 0.3, 0.72, 0.72);
  T(s, [
    { text: "This is the Professional Development committee's shortlist of talk ideas for the pledge class this fall.", options: { breakLine: true, paraSpaceAfter: 16 } },
    { text: "About two-thirds of the class wants to go into software engineering and about a third into finance or quant, with a few people leaning toward health tech. We looked for topics that are specific, recent, and not something you'd get from a careers page, then figured out who could actually give each one.", options: { breakLine: true, paraSpaceAfter: 16 } },
    { text: "Every idea comes with one question worth asking that speaker. At the end we rank our favorites and cover how we'll reach out.", options: { breakLine: true, paraSpaceAfter: 16 } },
    { text: "Have a speaker lead or an idea we missed? Send it to the PD chairs." },
  ], { x: 0.75, y: 1.7, w: 11.8, h: 5.0, fontSize: 19, lineSpacingMultiple: 1.12 });
}

// ================================================================= 3. agenda
{
  const s = base();
  const cx = -1.35, cy = 3.72, R = 4.25;
  s.addShape(pres.shapes.OVAL, { x: cx - 3.45, y: cy - 3.45, w: 6.9, h: 6.9, fill: { color: "22347F" }, line: { color: "22347F", width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R, fill: { type: "none" }, line: { color: "7C94FF", width: 1.25 } });
  const items = [["Software Engineering", "ic-laptop.png"], ["Finance & Quant", "ic-chart.png"], ["Health Tech", "ic-stethoscope.png"], ["Top Picks", "ic-trophy.png"], ["Next Steps", "ic-handshake.png"]];
  items.forEach(([label, ic], i) => {
    const y = 0.78 + i * 1.36;
    const ax = cx + Math.sqrt(R * R - (y - cy) ** 2);
    const pw = 5.9 - Math.abs(i - 2) * 0.35;
    rrect(s, ax, y - 0.34, pw, 0.68, { fill: { color: INK }, line: { color: "7C94FF", width: 1 }, rectRadius: 0.1 });
    s.addShape(pres.shapes.RECTANGLE, { x: ax + pw - 1.05, y: y - 0.34, w: 0.07, h: 0.68, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    T(s, `0${i + 1}`, { x: ax + pw - 0.95, y: y - 0.34, w: 0.9, h: 0.68, fontFace: LIGHT, fontSize: 24, color: NUM, align: "center", valign: "middle" });
    T(s, label, { x: ax + 0.75, y: y - 0.34, w: pw - 1.9, h: 0.68, fontSize: 18, valign: "middle" });
    icon(s, ic, ax - 0.4, y - 0.4, 0.8);
  });
  img(s, "az-mark.png", 12.28, 0.3, 0.72, 0.72);
}

// ================================================================= 4. divider
divider(1, "Software Engineering", ["Systems & Scale", "Low-Level & Performance", "SWE + AI", "Weird & Fun"]);

// ================================================================= 5. systems & scale: three full-height cards
{
  const s = content("SWE: Systems & Scale", "What breaks when millions of people hit the same system at once", 0);
  [["dns", "ic-cloud.png"], ["pg", "mk-postgres.png"], ["discord", "mk-discord.png"]].forEach(([k, ic], i) => {
    talkCard(s, TALK[k], ic, LX + i * 4.14, TOP_Y + 0.1, 3.85, BOT_Y - TOP_Y - 0.1, `0${i + 1}`, { pick: i === 0, metaH: 1.6, ts: 19, bs: 15, ms: 14 });
  });
}

// ================================================================= 6. low-level: icons on a dashed line, columns, takeaways
{
  const s = content("SWE: Low-Level & Performance", "For the people who want to know what the computer is doing", 0);
  const cols = [["rust", "mk-rust.png"], ["gpu", "mk-nvidia.png"], ["perf", "ic-stopwatch.png"]];
  const cx = [LX, LX + 4.14, LX + 8.28];
  line(s, cx[0] + 0.8, 2.12, cx[2] - cx[0], 0, "8FA8FF", 1, "dash");
  cols.forEach(([k, ic], i) => {
    icon(s, ic, cx[i], 1.72, 0.8);
    T(s, [...titleHook(TALK[k], 16, 13), { text: "", options: { breakLine: true } }], { x: cx[i], y: 2.72, w: 3.85, h: 1.5 });
    T(s, meta(TALK[k], 12), { x: cx[i], y: 4.25, w: 3.85, h: 1.0 });
  });
  bar(s, "Key Takeaways", LX, 5.62, RX - LX, 1.0, [
    "[[Start with Rust.]] It's the most concrete of the three, and anyone who has taken CS 61C or CS 162 will follow it.",
    "If an NVIDIA alum says yes to the GPU talk, take it. That's the hardest speaker here to get.",
  ]);
}

// ================================================================= 7. SWE + AI: stat panel left, rows right
{
  const s = content("SWE + AI", "The job is changing, so ask people doing it", 0);
  rrect(s, LX, TOP_Y, 4.3, BOT_Y - TOP_Y);
  T(s, "75%", { x: LX, y: 2.0, w: 4.3, h: 1.1, fontFace: LIGHT, fontSize: 66, color: GOLD, align: "center", valign: "middle" });
  T(s, [{ text: "of Google's new code", options: { breakLine: true } }, { text: "is written by AI" }], { x: LX + 0.2, y: 3.08, w: 3.9, h: 0.7, fontSize: 15, align: "center" });
  line(s, LX + 1.45, 3.9, 1.4, 0, "8FA8FF", 1);
  T(s, "Sundar Pichai, April 2026. In late 2024 it was about a quarter, and Microsoft has said 20 to 30%. What we want to know is what the day-to-day looks like now.",
    { x: LX + 0.35, y: 4.1, w: 3.6, h: 2.2, fontSize: 13, color: SOFT, align: "center", lineSpacingMultiple: 1.08 });
  [["google", "mk-google.png"], ["evals", "ic-magnifier.png"], ["cheap", "ic-coin.png"]].forEach(([k, ic], i) => {
    const gap = 0.16, h = (BOT_Y - TOP_Y - 2 * gap) / 3, y = TOP_Y + i * (h + gap), x = 5.2, w = RX - 5.2;
    rrect(s, x, y, w, h);
    if (i === 0) pick(s, x + 0.25, y);
    icon(s, ic, x + 0.28, y + h / 2 - 0.34, 0.68);
    T(s, titleHook(TALK[k], 15, 12), { x: x + 1.2, y: y + 0.12, w: 3.55, h: h - 0.24, valign: "middle" });
    line(s, x + 4.92, y + 0.22, 0, h - 0.44, RULE, 0.75);
    T(s, meta(TALK[k], 12), { x: x + 5.1, y: y + 0.12, w: w - 5.3, h: h - 0.24, valign: "middle" });
  });
}

// ================================================================= 8. weird & fun: side by side
{
  const s = content("Weird & Fun SWE", "No career payoff, just great stories", 0);
  const L = TALK.mario, R = TALK.rollback, cw = 5.6;
  rrect(s, LX, TOP_Y, cw, 0.66, { fill: { color: "2B3E9E" }, line: { color: "2B3E9E", width: 0 }, rectRadius: 0.08 });
  rrect(s, RX - cw, TOP_Y, cw, 0.66, { fill: { color: GOLD }, line: { color: GOLD, width: 0 }, rectRadius: 0.08 });
  T(s, L.title, { x: LX, y: TOP_Y, w: cw, h: 0.66, fontFace: MED, fontSize: 17, align: "center", valign: "middle" });
  T(s, R.title, { x: RX - cw, y: TOP_Y, w: cw, h: 0.66, fontFace: MED, fontSize: 17, align: "center", valign: "middle", color: INK });
  icon(s, "ic-game.png", W / 2 - 0.5, TOP_Y - 0.17, 1.0);
  line(s, W / 2, TOP_Y + 1.0, 0, BOT_Y - TOP_Y - 1.1, RULE, 1);
  [["The talk", "hook"], ["Who to book", "who"], ["Ask them", "ask"]].forEach(([label, key], i) => {
    const y = 2.78 + i * 1.26;
    [[L, LX, "9FB2FF"], [R, RX - cw, GOLD]].forEach(([t, x, c]) => {
      T(s, [
        { text: label, options: { fontFace: MED, fontSize: 15, color: c, breakLine: true, paraSpaceAfter: 4 } },
        { text: t[key], options: { fontSize: 14, color: key === "ask" ? WHITE : SOFT, italic: key === "ask", fontFace: key === "ask" ? LIGHT : REG } },
      ], { x: x + 0.2, y, w: cw - 0.4, h: 1.2, align: "center" });
    });
    if (i < 2) { line(s, LX + 0.9, y + 1.1, cw - 1.8, 0, RULE, 0.75); line(s, RX - cw + 0.9, y + 1.1, cw - 1.8, 0, RULE, 0.75); }
  });
}

// ================================================================= 9. divider
divider(2, "Finance & Quant", ["Trading & Market Structure", "SWE × Finance"]);

// ================================================================= 10. trading: one big card, two stacked
{
  const s = content("Trading & Market Structure", "How trading firms make money, and the tech behind it", 1);
  const t = TALK.hft, x = LX, y = TOP_Y + 0.1, w = 5.85, h = BOT_Y - y;
  rrect(s, x, y, w, h);
  pick(s, x + w / 2 - 0.575, y);
  icon(s, "ic-tower.png", x + 0.35, y + 0.38, 0.85);
  num(s, "01", x + w - 1.15, y + 0.42);
  T(s, titleHook(t, 21, 14.5), { x: x + 0.35, y: y + 1.45, w: w - 0.7, h: 1.85 });
  line(s, x + 0.35, y + 3.3, w - 0.7, 0, RULE, 0.75);
  T(s, meta(t, 13.5), { x: x + 0.35, y: y + 3.45, w: w - 0.7, h: h - 3.45 - 0.28, valign: "bottom" });
  [["mm", "ic-chart.png"], ["pred", "ic-ball.png"]].forEach(([k, ic], i) => {
    const gap = 0.18, hh = (BOT_Y - y - gap) / 2, yy = y + i * (hh + gap), xx = 6.75, ww = RX - 6.75;
    rrect(s, xx, yy, ww, hh);
    icon(s, ic, xx + 0.28, yy + 0.3, 0.66);
    num(s, `0${i + 2}`, xx + ww - 1.08, yy + 0.3);
    T(s, titleHook(TALK[k], 16, 13), { x: xx + 1.15, y: yy + 0.24, w: ww - 2.2, h: 1.25 });
    T(s, meta(TALK[k], 12.5), { x: xx + 1.15, y: yy + hh - 0.85, w: ww - 1.4, h: 0.75 });
  });
}

// ================================================================= 11. SWE x finance: two feature cards + takeaways
{
  const s = content("SWE × Finance", "SWE jobs that touch money", 1);
  [["stripe", "mk-stripe.png", "Payments"], ["stable", "mk-circle.png", "Stablecoins"]].forEach(([k, ic, tag], i) => {
    const w = 5.95, x = i ? RX - w : LX, y = TOP_Y + 0.05, h = 3.45, t = TALK[k];
    rrect(s, x, y, w, h);
    icon(s, ic, x + 0.3, y + 0.3, 0.78);
    num(s, `0${i + 1}`, x + w - 1.1, y + 0.32);
    T(s, tag.toUpperCase(), { x: x + 1.3, y: y + 0.36, w: 3, h: 0.28, fontFace: MED, fontSize: 10.5, color: GOLD, charSpacing: 2 });
    T(s, t.title, { x: x + 1.3, y: y + 0.64, w: w - 2.1, h: 0.45, fontSize: 17.5 });
    line(s, x + 0.3, y + 1.3, w - 0.6, 0, RULE, 0.75);
    T(s, [...para(hl(t.hook, { fontSize: 15, color: SOFT }), false, { paraSpaceAfter: 16 }), ...meta(t, 14)], { x: x + 0.3, y: y + 1.5, w: w - 0.6, h: 1.85 });
  });
  bar(s, "Key Takeaways", LX, 5.62, RX - LX, 1.0, [
    "[[Payments wins this one.]] Every SWE will write a retry loop someday, and this talk shows what happens when it's wrong.",
    "The stablecoin talk is better for the finance people who want to understand what banks are building right now.",
  ]);
}

// ================================================================= 12. divider
divider(3, "Health Tech", ["AI in the Exam Room", "Regulated Software", "Health Data"]);

// ================================================================= 13. health tech: three rows
{
  const s = content("Health Tech", "Software where a bug can hurt a patient", 2);
  const rows = [["scribe", "ic-stethoscope.png"], ["fda", "ic-shield.png"], ["fhir", "ic-hospital.png"]];
  const rh = (BOT_Y - TOP_Y) / 3;
  line(s, 8.25, TOP_Y + 0.15, 0, BOT_Y - TOP_Y - 0.3, RULE, 0.75);
  rows.forEach(([k, ic], i) => {
    const y = TOP_Y + i * rh, t = TALK[k];
    icon(s, ic, LX, y + rh / 2 - 0.42, 0.84);
    T(s, titleHook(t, 17, 13), { x: LX + 1.15, y: y + 0.1, w: 6.25, h: rh - 0.2, valign: "middle" });
    if (i === 0) pick(s, LX + 1.72, y + 0.14);
    T(s, meta(t, 12.5), { x: 8.5, y: y + 0.1, w: RX - 8.5, h: rh - 0.2, valign: "middle" });
    if (i < 2) line(s, LX, y + rh, RX - LX, 0, RULE, 0.75);
  });
}

// ================================================================= 14. divider
divider(4, "Top Picks", ["Ranking", "Talk Spotlights"]);

// ================================================================= 15. top 5
const TOP = [
  ["hft", "The one talk both the SWEs and the quants will care about."],
  ["google", "Everyone wants to know what this means for their first job."],
  ["pred", "10x growth in a year, with pricing and exchange tech in one talk."],
  ["dns", "Best story on the list. Most of us had an app go down that day."],
  ["scribe", "Gets the health-tech people in, and Epic vs. Abridge is a real fight."],
];
{
  const s = content("Our Top 5 for a Mixed Room", "Ranked by how much of the whole class would care", 3);
  TOP.forEach(([k, why], i) => {
    const row = i < 3 ? 0 : 1, col = i < 3 ? i : i - 3;
    const w = 3.85, h = 2.28, x = row === 0 ? LX + col * 4.14 : LX + 2.07 + col * 4.14, y = row === 0 ? TOP_Y : BOT_Y - h;
    rrect(s, x, y, w, h);
    T(s, `0${i + 1}`, { x: x + 0.28, y: y + 0.22, w: 0.95, h: 0.75, fontFace: LIGHT, fontSize: 36, color: GOLD, valign: "middle" });
    T(s, TALK[k].title, { x: x + 1.25, y: y + 0.2, w: w - 1.5, h: 0.8, fontFace: MED, fontSize: 15.5, valign: "middle" });
    line(s, x + 0.3, y + 1.14, w - 0.6, 0, RULE, 0.75);
    T(s, why, { x: x + 0.3, y: y + 1.27, w: w - 0.6, h: 0.9, fontSize: 13, color: SOFT });
  });
}

// ================================================================= 16-20. spotlights
const SPOT = {
  hft: { short: "Microseconds Are Money", sub: "Firms built microwave towers from Chicago to New Jersey because air beats glass fiber", mock: "m-hft.png",
    caption: "Every step of a trade, timed in nanoseconds",
    cover: ["Where the time goes: network, kernel, code, exchange", "FPGAs, kernel bypass, and why C++ still runs the floor", "How a firm decides a microsecond is worth building for"],
    book: ["Low-latency engineer at Jump, HRT or Optiver", "Berkeley EECS alumni at these firms are the easiest ask"],
    follow: "What did you build in your first month there?" },
  google: { short: "Google's 75% AI Code", sub: "Most of Google's new code is now AI-generated. So what do engineers do all day?", mock: "m-agent.png",
    caption: "An agent's first-draft fix, before review",
    cover: ["A normal day when an agent writes the first draft", "How code review, testing and on-call changed", "Which skills matter more now, and which don't"],
    book: ["Staff engineer who led an AI coding rollout", "Ideally someone who also interviews new grads"],
    follow: "What would you learn if you were a sophomore today?" },
  pred: { short: "Betting on Everything", sub: "Kalshi and Polymarket traded $53B in July, more than 10x last September", mock: "m-market.png",
    caption: "Every contract is a yes or no price between 1¢ and 99¢",
    cover: ["Pricing a contract that has never traded before", "Making markets when most of the volume is sports", "Matching engines, settlement and the CFTC"],
    book: ["Trader or quant on an event-contracts desk", "Susquehanna was Kalshi's first institutional market maker"],
    follow: "Which markets do you refuse to make?" },
  dns: { short: "The AWS DNS Bug", sub: "One empty DNS record inside AWS took down Venmo, Snapchat, Fortnite and Canvas", mock: "m-status.png",
    caption: "Oct 19–20, 2025, from the first alarm to recovery (PDT)",
    cover: ["How one empty DNS record cascaded for 14 hours", "What a 3am incident call sounds like", "Writing a postmortem that doesn't blame a person"],
    book: ["SRE or incident commander at a cloud provider", "Anyone on call at a big consumer app that day"],
    follow: "What changed in your runbooks afterward?" },
  scribe: { short: "The AI Scribe", sub: "Epic shipped its own AI charting in February, while Abridge kept growing", mock: "m-note.png",
    caption: "What the doctor sees after a 15-minute visit",
    cover: ["Turning a messy 15-minute visit into a clean note", "Keeping a doctor in the loop without slowing them down", "Why Epic built its own instead of buying"],
    book: ["ML or product engineer at Abridge or a similar startup", "A clinical informatics lead at a health system like UCSF"],
    follow: "How do doctors decide whether to trust it?" },
};
TOP.forEach(([k], i) => {
  const t = TALK[k], sp = SPOT[k];
  const s = content(`Talk Spotlight: ${sp.short}`, sp.sub, 3);
  const flip = i % 2 === 1;
  const mx = flip ? 7.3 : LX, cx = flip ? LX : 6.55, cw = 6.18;
  // mock + caption, centred in their column
  // the PNG carries a transparent margin: 48px each side, 24px on top, 96px below (for the shadow)
  const [pw, ph] = SIZES[sp.mock], colW = 5.43;
  const mw = colW * pw / (pw - 96), sc = mw / pw, mh = ph * sc;
  const visH = (ph - 24 - 96) * sc;
  img(s, sp.mock, mx - 48 * sc, TOP_Y - 24 * sc, mw, mh);
  T(s, sp.caption, { x: mx, y: TOP_Y + visH + 0.12, w: colW, h: 0.35, fontFace: LIGHT, fontSize: 12.5, italic: true, color: SOFT, align: "center" });
  // stacked cards
  [["What they'd cover", sp.cover, "ic-light.png", 1.78], ["Who to book", sp.book, "ic-mic.png", 1.58]].forEach(([h, items, ic, hh], j) => {
    const y = j ? TOP_Y + 1.93 : TOP_Y;
    rrect(s, cx, y, cw, hh);
    icon(s, ic, cx + 0.25, y + 0.2, 0.5);
    T(s, h, { x: cx + 0.9, y: y + 0.2, w: 4, h: 0.5, fontFace: MED, fontSize: 15, valign: "middle" });
    T(s, bullets(items), { x: cx + 0.3, y: y + 0.78, w: cw - 0.55, h: hh - 0.9, fontSize: 13, paraSpaceAfter: 5 });
  });
  bar(s, "Ask Them", LX, 5.62, RX - LX, 1.0, [`[[${t.ask}]]`, `Then: ${sp.follow}`], 14.5);
});

// ================================================================= 21. divider
divider(5, "Next Steps", ["Finding Speakers", "The Plan"]);

// ================================================================= 22. finding speakers
{
  const s = content("Finding Speakers", "Warm intros first, then engineering blogs", 4);
  const cols = [
    ["Alumni", "ic-grad.png", ["LinkedIn → UC Berkeley → Alumni, then filter by company and \"Engineering\" or \"Finance\"", "Ask older actives who they know. A warm intro gets a yes way faster than a cold DM"]],
    ["LinkedIn Search", "ic-magnifier.png", null],
    ["Engineering Blogs", "ic-scroll.png", ["If someone wrote the engineering post, they already have the talk", "Discord, Cloudflare, Stripe, Jane Street, HRT and OpenAI all name their authors"]],
  ];
  cols.forEach(([h, ic, items], i) => {
    const x = LX + i * 4.14, y = 2.05, w = 3.85, hh = 3.1;
    rrect(s, x, y, w, hh);
    icon(s, ic, x + w / 2 - 0.42, y - 0.42, 0.84);
    T(s, h, { x, y: y + 0.55, w, h: 0.4, fontFace: MED, fontSize: 16, align: "center" });
    if (items) {
      T(s, bullets(items), { x: x + 0.28, y: y + 1.1, w: w - 0.5, h: hh - 1.2, fontSize: 12.5, paraSpaceAfter: 9, color: SOFT });
    } else {
      ['"low latency" AND FPGA AND Berkeley', '"site reliability" AND Berkeley', '"ambient" AND engineer AND health'].forEach((q, k) => {
        rrect(s, x + 0.25, y + 1.12 + k * 0.62, w - 0.5, 0.5, { fill: { color: INK }, line: { color: RULE, width: 0.75 }, rectRadius: 0.07 });
        T(s, q, { x: x + 0.38, y: y + 1.12 + k * 0.62, w: w - 0.7, h: 0.5, fontFace: "Courier New", fontSize: 10.5, valign: "middle" });
      });
    }
  });
  bar(s, "Sample DM", LX, 5.62, RX - LX, 1.0, [
    "\"Hi Sam, I'm in AEZ at Berkeley and loved your post on moving your message store to ScyllaDB. Would you give a 30-minute talk to about 40 students who want to do this kind of work? Zoom or in person, any week this fall.\"",
  ], 13);
}

// ================================================================= 23. next steps
{
  const s = content("The Plan", "What happens after this meeting", 4);
  const steps = ["Vote for your\ntop 3 talks", "Reach out,\nalumni first", "Book four talks\nfor the semester"];
  const detail = ["The form goes out after this meeting", "PD chairs DM alumni first", "About one talk every three weeks"];
  steps.forEach((label, i) => {
    const cx = 2.35 + i * 4.3, cy = 2.75;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.55, y: cy - 0.62, w: 1.05, h: 1.05, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    s.addShape(pres.shapes.OVAL, { x: cx - 0.5, y: cy - 0.12, w: 1.1, h: 1.1, fill: { color: "3056D3" }, line: { color: "3056D3", width: 0 } });
    s.addShape(pres.shapes.OVAL, { x: cx + 0.25, y: cy - 0.28, w: 0.62, h: 0.62, fill: { color: "8C95B8", transparency: 45 }, line: { color: "8C95B8", width: 0 } });
    T(s, String(i + 1), { x: cx - 0.7, y: cy - 0.55, w: 1.4, h: 1.4, fontFace: SEMI, fontSize: 64, color: WHITE, align: "center", valign: "middle" });
    T(s, label.split("\n").map((l, k) => ({ text: l, options: { breakLine: k === 0 } })), { x: cx - 1.9, y: cy + 1.3, w: 3.8, h: 1.0, fontSize: 22, color: WHITE, align: "center" });
    T(s, detail[i], { x: cx - 1.95, y: cy + 2.4, w: 3.9, h: 0.8, fontSize: 15, color: SOFT, align: "center" });
  });
}

pres.writeFile({ fileName: path.join(__dirname, "AEZ-Speaker-Series.pptx") }).then(f => console.log("wrote", f));
