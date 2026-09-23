const pptxgen = require("pptxgenjs");
const fs = require("fs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI Models";
pres.theme = { headFontFace: "Poppins", bodyFontFace: "Poppins" };

const G = JSON.parse(fs.readFileSync("frames2.json", "utf8"));
const WHITE = "FFFFFF", HI = "6FD6FF", SOFT = "AEB6DA", MUTED = "8C95BD", RULE = "34407E";
const REG = "Poppins", LIGHT = "Poppins Light", MED = "Poppins Medium";
const img = f => "image/png;base64," + fs.readFileSync(f).toString("base64");

const s = pres.addSlide();
s.background = { data: img("bg.png") };
const text = (t, o) => s.addText(t, Object.assign({ fontFace: REG, color: WHITE, isTextBox: true, margin: 0, valign: "top" }, o));

// "plain [[highlight]] plain" -> runs, highlight in cyan
const hl = (str, base = {}) => str.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(p =>
  p.startsWith("[[") ? { text: p.slice(2, -2), options: Object.assign({}, base, { color: HI }) } : { text: p, options: Object.assign({}, base) });
const bulletRuns = items => items.flatMap((b, k) => {
  const r = hl(b, { bullet: { indent: 15 } });
  r[r.length - 1].options.breakLine = k < items.length - 1;
  r.forEach((run, j) => { if (j > 0) delete run.options.bullet; });
  return r;
});

// ---------- Title ----------
text("Analysis of the Top Three Frontier AI Models", { x: 0.45, y: 0.36, w: 12, h: 0.58, fontSize: 30 });
text("Opus 5.5 leads on coding and analyst work, Astra on 3D tools and hard science, and Kimi K3 on cost and self-hosting",
  { x: 0.45, y: 0.95, w: 12.4, h: 0.32, fontFace: LIGHT, fontSize: 13.5, italic: true, color: SOFT });

// ---------- Model cards ----------
// [name, sub, logo, tile colour, bullets]
const cards = [
  ["Claude Opus 5.5", "Anthropic  |  Released Sep 22, 2026", "logoc-claude.png", "FFFFFF", [
    "Best for [[coding, agent workflows and analyst work]] like research and modeling",
    "Scored [[66.4% on Terminal-Bench 4.0]] vs. 57.9% for Astra; one customer migrated [[680K lines of code in a day]]",
    "Costs [[$4 / $20 per 1M tokens]], about 60% less than Astra",
  ]],
  ["GPT-6 Astra", "OpenAI  |  Released Sep 3, 2026", "logoc-openai.png", "FFFFFF", [
    "Best for [[operating desktop software]], [[3D tools like Blender and UE5]], and hard math and science",
    "Scored [[97.6% on FrontierMath Tier 4]] and 72.6% on OSWorld 2.0",
    "Most expensive at [[$10 / $50 per 1M tokens]], with access still rolling out in stages",
  ]],
  ["Kimi K3", "Moonshot AI  |  Released Jul 16, 2026", "logoc-kimi.png", "000000", [
    "Best for [[high-volume, low-cost work]] and anything that must be [[self-hosted]]",
    "The [[only open-weight model]] of the three, with 2.8T parameters",
    "Cheapest at [[$3 / $15 per 1M tokens]], but scores 44 vs. 58 for Opus on the Artificial Analysis index",
  ]],
];
const { CW, CH, KW, KH } = G;
const CY = 1.62, GAP = 0.32, CX0 = 0.4, P = 0.04;
const brCard = img("br-card.png");
cards.forEach(([name, sub, logo, tile, bullets], i) => {
  const x = CX0 + i * (CW + GAP);
  // frosted panel, then gradient corner brackets on top
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CY, w: CW, h: CH, rectRadius: 0.18, fill: { color: "FFFFFF", transparency: 94 }, line: { color: "FFFFFF", transparency: 90, width: 0.5 } });
  s.addImage({ data: brCard, x: x - P, y: CY - P, w: CW + 2 * P, h: CH + 2 * P });
  // app-icon style logo tile
  const T = 0.62;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: CY + 0.3, w: T, h: T, rectRadius: 0.13, fill: { color: tile }, line: { color: tile === "000000" ? "4A558F" : tile, width: 0.75 } });
  const LG = 0.42;
  s.addImage({ data: img(logo), x: x + 0.3 + (T - LG) / 2, y: CY + 0.3 + (T - LG) / 2, w: LG, h: LG });
  text(name, { x: x + 1.1, y: CY + 0.3, w: CW - 1.3, h: 0.36, fontFace: MED, fontSize: 17 });
  text(sub, { x: x + 1.1, y: CY + 0.66, w: CW - 1.3, h: 0.24, fontFace: LIGHT, fontSize: 10, italic: true, color: SOFT });
  s.addShape(pres.shapes.LINE, { x: x + 0.3, y: CY + 1.12, w: CW - 0.6, h: 0, line: { color: RULE, width: 0.75 } });
  text(bulletRuns(bullets), { x: x + 0.28, y: CY + 1.3, w: CW - 0.5, h: CH - 1.5, fontSize: 12, paraSpaceAfter: 9 });
});

// ---------- Key Takeaways ----------
const KY = 5.5, KX = 0.4;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: KX, y: KY, w: KW, h: KH, rectRadius: 0.18, fill: { color: "FFFFFF", transparency: 94 }, line: { color: "FFFFFF", transparency: 90, width: 0.5 } });
s.addImage({ data: img("br-kt.png"), x: KX - P, y: KY - P, w: KW + 2 * P, h: KH + 2 * P });
text("Key Takeaways", { x: KX + 0.3, y: KY + 0.2, w: 4, h: 0.3, fontFace: MED, fontSize: 13, color: HI });
text(bulletRuns([
  "[[Opus 5.5]] should be the default for most work, given its lead on coding and knowledge-work benchmarks and its [[lower price than Astra]]",
  "[[Astra]] is worth the premium for specialist work, while [[Kimi K3]] fits teams that need to keep data in-house or cut costs",
]), { x: KX + 0.3, y: KY + 0.55, w: KW - 0.6, h: KH - 0.7, fontSize: 12.5, paraSpaceAfter: 5 });

// ---------- Sources ----------
text("Sources: Anthropic, OpenAI, Moonshot AI, Artificial Analysis (Sep 2026). Opus vs. Astra benchmarks as reported by Anthropic.",
  { x: 0.4, y: 7.03, w: 12.5, h: 0.22, fontSize: 8.5, color: MUTED });

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
