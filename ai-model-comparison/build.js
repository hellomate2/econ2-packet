const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI model comparison";
pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };

const NAVY = "002855", INK = "222222", GRAY = "595959", LINE = "BFBFBF", LIGHT = "F2F2F2";
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

s.addText("Analysis of the top three frontier AI models: Claude Opus 5.5, GPT-6 Astra and Kimi K3", {
  x: 0.5, y: 0.4, w: 12.3, h: 0.45, fontFace: "Arial", fontSize: 21, bold: true, color: NAVY, isTextBox: true, margin: 0,
});
s.addText("As of September 23, 2026", {
  x: 0.5, y: 0.88, w: 6, h: 0.3, fontFace: "Arial", fontSize: 12, color: GRAY, isTextBox: true, margin: 0,
});

// ---------- Main comparison table ----------
const head = (t, sub) => ({
  text: [{ text: t, options: { bold: true, breakLine: true } }, { text: sub, options: { fontSize: 10 } }],
  options: { fill: { color: NAVY }, color: "FFFFFF" },
});
const label = t => ({ text: t, options: { bold: true, fill: { color: LIGHT } } });

const rows = [
  [{ text: "", options: { fill: { color: NAVY } } }, head("Claude Opus 5.5", "Anthropic"), head("GPT-6 Astra", "OpenAI"), head("Kimi K3", "Moonshot AI")],
  [label("Best for"),
    "Coding and agent workflows, plus analyst-type work like research, financial modeling and reports.",
    "Operating desktop software, 3D and creative tools (Blender, Unreal Engine 5), and hard math and science problems.",
    "High-volume, cost-sensitive work and anything that has to run on our own infrastructure."],
  [label("Weaker at"),
    "Can't be self-hosted. Trails Astra on 3D tools and on advanced math and science.",
    "By far the most expensive of the three, and access is still being rolled out in stages.",
    "Clearly behind both closed models on overall capability."],
  [label("Notable results"),
    "Scored 66.4% on Terminal-Bench 4.0 vs. 57.9% for Astra, and led on GDPval-AA (per Anthropic). One customer migrated 680K lines of code in under a day.",
    "Scored 97.6% on FrontierMath Tier 4 and 64.6% on Terminal-Bench-Science vs. 58.7% for Opus. OpenAI rates its cyber capability as \"Critical\".",
    "The only open-weight model of the three. Also available through Databricks and Fireworks."],
  [label("Price per 1M tokens (input / output)"), "$4 / $20", "$10 / $50", "$3 / $15"],
  [label("Context window"), "1M tokens", "1.05M tokens", "1M tokens"],
  [label("Parameters"), "Not disclosed", "Not disclosed", "2.8T (mixture of experts)"],
  [label("Artificial Analysis Intelligence Index"), "58", "53", "44"],
  [label("Released"), "Sep 22, 2026", "Sep 3, 2026", "Jul 16, 2026"],
];

s.addTable(rows, {
  x: 0.5, y: 1.4, w: 8.3, colW: [1.55, 2.25, 2.25, 2.25],
  fontFace: "Arial", fontSize: 10.5, color: INK, valign: "middle",
  border: { type: "solid", pt: 0.75, color: LINE },
  margin: [4, 6, 4, 6],
  rowH: [0.5, 0.72, 0.6, 0.9, 0.32, 0.32, 0.32, 0.45, 0.32],
});

// ---------- Our take ----------
const TX = 9.15, TW = 3.68, TY = 1.4, TH = 4.8;
s.addShape(pres.shapes.RECTANGLE, { x: TX, y: TY, w: TW, h: TH, fill: { color: LIGHT }, line: { color: LIGHT, width: 0 } });
s.addText("Our take", { x: TX + 0.2, y: TY + 0.15, w: TW - 0.4, h: 0.35, fontFace: "Arial", fontSize: 14, bold: true, color: NAVY, isTextBox: true, margin: 0 });
const bullets = [
  "Opus 5.5 is the best default for most of our work. It led on coding and knowledge-work benchmarks and costs about 60% less than Astra at list price.",
  "Astra is worth paying for when the job involves operating software, 3D tools, or difficult math and science.",
  "Kimi K3 makes sense when data can't leave our environment or cost matters more than top-end performance. We would host it ourselves rather than use Moonshot's API.",
  "Most head-to-head numbers come from the vendors themselves, so small gaps shouldn't be over-read.",
];
s.addText(bullets.map((b, i) => ({ text: b, options: { bullet: { indent: 14 }, breakLine: i < bullets.length - 1, paraSpaceAfter: 8 } })), {
  x: TX + 0.2, y: TY + 0.6, w: TW - 0.4, h: TH - 0.75, fontFace: "Arial", fontSize: 11, color: INK, valign: "top", isTextBox: true, margin: 0,
});

// ---------- Sources ----------
s.addText("Sources: Anthropic, OpenAI and Moonshot AI launch materials; Artificial Analysis (September 2026). Benchmark comparisons between Opus 5.5 and Astra are as reported by Anthropic.", {
  x: 0.5, y: 6.55, w: 12.3, h: 0.3, fontFace: "Arial", fontSize: 9, color: GRAY, isTextBox: true, margin: 0,
});

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
