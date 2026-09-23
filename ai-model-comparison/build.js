const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI Models";
pres.theme = { headFontFace: "Avenir Book", bodyFontFace: "Avenir Book" };

const BG = "001D3B", WHITE = "FFFFFF", HI = "5DAAFF", CARD = "1C5EDD", KT = "5B7495", MUTED = "7F8FA6";
const BOOK = "Avenir Book", LIGHT = "Avenir Light";

const s = pres.addSlide();
s.background = { color: BG };
const text = (t, o) => s.addText(t, Object.assign({ fontFace: BOOK, color: WHITE, isTextBox: true, margin: 0, valign: "top" }, o));

// "plain [[highlight]] plain" -> runs, highlight in the deck's light blue
const hl = (str, base = {}) => str.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(p =>
  p.startsWith("[[") ? { text: p.slice(2, -2), options: Object.assign({}, base, { color: HI }) } : { text: p, options: Object.assign({}, base) });

// ---------- Title block ----------
s.addShape(pres.shapes.LINE, { x: 0.58, y: 0.46, w: 0, h: 0.82, line: { color: WHITE, width: 1 } });
text("Analysis of the Top Three Frontier AI Models", { x: 0.87, y: 0.36, w: 11.3, h: 0.62, fontSize: 36 });
text("Opus 5.5 leads on coding and analyst work, Astra on 3D tools and hard science, and Kimi K3 on cost and self-hosting",
  { x: 0.87, y: 0.95, w: 11.8, h: 0.36, fontFace: LIGHT, fontSize: 16, italic: true });

// ---------- Model cards ----------
const cards = [
  ["Claude Opus 5.5", "Anthropic  |  Released Sep 22, 2026", [
    "Best for [[coding, agent workflows and analyst work]] like research and modeling",
    "Scored [[66.4% on Terminal-Bench 4.0]] vs. 57.9% for Astra; one customer migrated [[680K lines of code in a day]]",
    "Costs [[$4 / $20 per 1M tokens]], about 60% less than Astra",
  ]],
  ["GPT-6 Astra", "OpenAI  |  Released Sep 3, 2026", [
    "Best for [[operating desktop software]], 3D tools like [[Blender and Unreal Engine 5]], and hard math and science",
    "Scored [[97.6% on FrontierMath Tier 4]] and 72.6% on OSWorld 2.0",
    "Most expensive at [[$10 / $50 per 1M tokens]], with access still rolling out in stages",
  ]],
  ["Kimi K3", "Moonshot AI  |  Released Jul 16, 2026", [
    "Best for [[high-volume, low-cost work]] and anything that has to be [[self-hosted]]",
    "The [[only open-weight model]] of the three, with 2.8T parameters",
    "Cheapest at [[$3 / $15 per 1M tokens]], but scores 44 vs. 58 for Opus on the Artificial Analysis index",
  ]],
];
const CY = 1.58, CH = 3.7, CW = 3.95, GAP = 0.32, CX0 = 0.4;
cards.forEach(([name, sub, bullets], i) => {
  const x = CX0 + i * (CW + GAP);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CY, w: CW, h: CH, rectRadius: 0.14, fill: { color: BG }, line: { color: CARD, width: 1.25 } });
  text(name, { x: x + 0.3, y: CY + 0.2, w: CW - 0.6, h: 0.42, fontSize: 22, align: "center" });
  s.addShape(pres.shapes.LINE, { x: x + 0.55, y: CY + 0.68, w: CW - 1.1, h: 0, line: { color: "8A9BB5", width: 0.75 } });
  text(sub, { x: x + 0.3, y: CY + 0.76, w: CW - 0.6, h: 0.26, fontFace: LIGHT, fontSize: 11.5, italic: true, color: "C9D3E0", align: "center" });
  text(bullets.flatMap((b, k) => {
    const r = hl(b, { bullet: { indent: 16 } });
    r[r.length - 1].options.breakLine = k < bullets.length - 1;
    r.forEach((run, j) => { if (j > 0) delete run.options.bullet; });
    return r;
  }), { x: x + 0.28, y: CY + 1.14, w: CW - 0.5, h: CH - 1.45, fontSize: 13, paraSpaceAfter: 9 });
  // number sits on the bottom-right corner, breaking the border like the reference deck
  s.addShape(pres.shapes.RECTANGLE, { x: x + CW - 0.72, y: CY + CH - 0.2, w: 0.62, h: 0.4, fill: { color: BG }, line: { color: BG, width: 0 } });
  text(`0${i + 1}`, { x: x + CW - 0.72, y: CY + CH - 0.26, w: 0.62, h: 0.48, fontSize: 28, align: "center" });
});

// ---------- Key Takeaways ----------
const KY = 5.52, KH = 1.1, KX = 0.4, KW = 12.53;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: KX - 0.05, y: KY - 0.04, w: KW + 0.1, h: KH + 0.08, rectRadius: 0.16, fill: { color: BG }, line: { color: KT, width: 1 } });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: KX, y: KY, w: KW, h: KH, rectRadius: 0.14, fill: { color: BG }, line: { color: HI, width: 1 } });
s.addShape(pres.shapes.RECTANGLE, { x: 1.35, y: KY - 0.2, w: 2.35, h: 0.34, fill: { color: BG }, line: { color: BG, width: 0 } });
text("Key Takeaways", { x: 1.35, y: KY - 0.22, w: 2.35, h: 0.38, fontSize: 18, align: "center", valign: "middle" });
const kt = [
  "[[Opus 5.5]] should be the default for most work, given its lead on coding and knowledge-work benchmarks and its [[lower price than Astra]]",
  "[[Astra]] is worth the premium for specialist work, while [[Kimi K3]] fits teams that need to keep data in-house or cut costs",
];
text(kt.flatMap((b, k) => {
  const r = hl(b, { bullet: { indent: 16 } });
  r[r.length - 1].options.breakLine = k < kt.length - 1;
  r.forEach((run, j) => { if (j > 0) delete run.options.bullet; });
  return r;
}), { x: KX + 0.3, y: KY + 0.2, w: KW - 0.6, h: KH - 0.3, fontSize: 14, paraSpaceAfter: 6, valign: "middle" });

// ---------- Sources ----------
text("Sources: Anthropic, OpenAI, Moonshot AI, Artificial Analysis (Sep 2026). Opus vs. Astra benchmarks as reported by Anthropic.",
  { x: 0.4, y: 7.0, w: 12.5, h: 0.25, fontSize: 10, color: MUTED });

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
