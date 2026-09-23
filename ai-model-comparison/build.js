const pptxgen = require("pptxgenjs");
const fs = require("fs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI Models";
pres.theme = { headFontFace: "Poppins", bodyFontFace: "Poppins" };

const G = JSON.parse(fs.readFileSync("frames.json", "utf8"));
const BG = "001D3B", WHITE = "FFFFFF", HI = "5DAAFF", MUTED = "7F8FA6";
const REG = "Poppins", LIGHT = "Poppins Light", MED = "Poppins Medium";
const img = f => "image/png;base64," + fs.readFileSync(f).toString("base64");

const s = pres.addSlide();
s.background = { color: BG };
const text = (t, o) => s.addText(t, Object.assign({ fontFace: REG, color: WHITE, isTextBox: true, margin: 0, valign: "top" }, o));

// "plain [[highlight]] plain" -> runs, highlight in light blue
const hl = (str, base = {}) => str.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(p =>
  p.startsWith("[[") ? { text: p.slice(2, -2), options: Object.assign({}, base, { color: HI }) } : { text: p, options: Object.assign({}, base) });
const bulletRuns = items => items.flatMap((b, k) => {
  const r = hl(b, { bullet: { indent: 15 } });
  r[r.length - 1].options.breakLine = k < items.length - 1;
  r.forEach((run, j) => { if (j > 0) delete run.options.bullet; });
  return r;
});

// ---------- Title block ----------
s.addShape(pres.shapes.LINE, { x: 0.58, y: 0.44, w: 0, h: 0.8, line: { color: WHITE, width: 1 } });
text("Analysis of the Top Three Frontier AI Models", { x: 0.87, y: 0.34, w: 11.5, h: 0.58, fontSize: 30 });
text("Opus 5.5 leads on coding and analyst work, Astra on 3D tools and hard science, and Kimi K3 on cost and self-hosting",
  { x: 0.87, y: 0.93, w: 12.1, h: 0.32, fontFace: LIGHT, fontSize: 13.5, italic: true });

// ---------- Model cards ----------
const cards = [
  ["Claude Opus 5.5", "Anthropic  |  Released Sep 22, 2026", "logo-anthropic.png", [
    "Best for [[coding, agent workflows and analyst work]] like research and modeling",
    "Scored [[66.4% on Terminal-Bench 4.0]] vs. 57.9% for Astra; one customer migrated [[680K lines of code in a day]]",
    "Costs [[$4 / $20 per 1M tokens]], about 60% less than Astra",
  ]],
  ["GPT-6 Astra", "OpenAI  |  Released Sep 3, 2026", "logo-openai.png", [
    "Best for [[operating desktop software]], 3D tools like [[Blender and Unreal Engine 5]], and hard math and science",
    "Scored [[97.6% on FrontierMath Tier 4]] and 72.6% on OSWorld 2.0",
    "Most expensive at [[$10 / $50 per 1M tokens]], with access still rolling out in stages",
  ]],
  ["Kimi K3", "Moonshot AI  |  Released Jul 16, 2026", "logo-moonshot.png", [
    "Best for [[high-volume, low-cost work]] and anything that has to be [[self-hosted]]",
    "The [[only open-weight model]] of the three, with 2.8T parameters",
    "Cheapest at [[$3 / $15 per 1M tokens]], but scores 44 vs. 58 for Opus on the Artificial Analysis index",
  ]],
];
const { CW, CH, OFF, PAD, BD } = G;
const CY = 1.88, GAP = 0.32, CX0 = 0.4;
const frameCard = img("frame-card.png"), badge = img("badge.png");
cards.forEach(([name, sub, logo, bullets], i) => {
  const x = CX0 + i * (CW + GAP);
  s.addImage({ data: frameCard, x: x - PAD, y: CY - PAD, w: CW + OFF + 2 * PAD, h: CH + OFF + 2 * PAD });
  // logo badge sits on the top edge, centred
  s.addImage({ data: badge, x: x + CW / 2 - BD / 2, y: CY - BD / 2, w: BD, h: BD });
  const L = 0.4;
  s.addImage({ data: img(logo), x: x + CW / 2 - L / 2, y: CY - L / 2, w: L, h: L });
  text(name, { x: x + 0.3, y: CY + 0.5, w: CW - 0.6, h: 0.38, fontFace: MED, fontSize: 18, align: "center" });
  s.addShape(pres.shapes.LINE, { x: x + 0.6, y: CY + 0.93, w: CW - 1.2, h: 0, line: { color: "8A9BB5", width: 0.75 } });
  text(sub, { x: x + 0.3, y: CY + 1.0, w: CW - 0.6, h: 0.24, fontFace: LIGHT, fontSize: 10, italic: true, color: "C9D3E0", align: "center" });
  text(bulletRuns(bullets), { x: x + 0.26, y: CY + 1.34, w: CW - 0.46, h: CH - 1.6, fontSize: 11.5, paraSpaceAfter: 7 });
  // number sits in the gap on the bottom edge
  text(`0${i + 1}`, { x: x + CW - 0.78, y: CY + CH - 0.25, w: 0.72, h: 0.46, fontSize: 24, align: "center" });
});

// ---------- Key Takeaways ----------
const { KW, KH, LX0, LX1 } = G;
const KY = 5.72, KX = 0.4;
s.addImage({ data: img("frame-kt.png"), x: KX - PAD, y: KY - PAD, w: KW + OFF + 2 * PAD, h: KH + OFF + 2 * PAD });
text("Key Takeaways", { x: KX + LX0, y: KY - 0.2, w: LX1 - LX0, h: 0.4, fontSize: 16, align: "center", valign: "middle" });
text(bulletRuns([
  "[[Opus 5.5]] should be the default for most work, given its lead on coding and knowledge-work benchmarks and its [[lower price than Astra]]",
  "[[Astra]] is worth the premium for specialist work, while [[Kimi K3]] fits teams that need to keep data in-house or cut costs",
]), { x: KX + 0.3, y: KY + 0.2, w: KW - 0.6, h: KH - 0.28, fontSize: 12, paraSpaceAfter: 5, valign: "middle" });

// ---------- Sources ----------
text("Sources: Anthropic, OpenAI, Moonshot AI, Artificial Analysis (Sep 2026). Opus vs. Astra benchmarks as reported by Anthropic.",
  { x: 0.4, y: 7.03, w: 12.5, h: 0.22, fontSize: 8.5, color: MUTED });

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
