const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI Model Comparison — September 2026";

const NAVY = "041E42", INK = "1F2A37", MUTED = "5F6B7A", RULE = "C9D0D9", HAIR = "E3E7EC", TINT = "EAF0F7";
const F = "Arial";
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

const L = 0.45, R = 12.883;
const txt = (t, o) => s.addText(t, Object.assign({ fontFace: F, margin: 0, isTextBox: true, color: INK, valign: "top" }, o));
const hline = (x, y, w, color, pt) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: pt } });

// ---------- Header ----------
txt("FRONTIER AI MODELS  |  CAPABILITY & TASK-FIT COMPARISON  |  SEPTEMBER 2026",
  { x: L, y: 0.34, w: 9, h: 0.22, fontSize: 9, bold: true, color: MUTED, charSpacing: 1 });
txt("No single model wins: Opus 5.5 leads coding and knowledge work, GPT-6 Astra leads autonomous computer operation and frontier science, and Kimi K3 wins on cost and control",
  { x: L, y: 0.6, w: R - L, h: 0.72, fontSize: 19, bold: true, color: NAVY, lineSpacingMultiple: 0.95 });
hline(L, 1.43, R - L, NAVY, 1);

// ---------- Left: task-fit grid ----------
const GX = L, GY = 1.6;
const cTask = 2.5, cBall = 1.05, cEv = 2.52;
const gW = cTask + 3 * cBall + cEv; // 8.17
const bx = [GX + cTask, GX + cTask + cBall, GX + cTask + 2 * cBall];
const evX = GX + cTask + 3 * cBall + 0.12;

txt("WHICH MODEL FOR WHICH TASK", { x: GX, y: GY, w: 4, h: 0.2, fontSize: 9.5, bold: true, color: NAVY, charSpacing: 0.5 });

// Harvey ball
function ball(cx, cy, level, d = 0.2) {
  const x = cx - d / 2, y = cy - d / 2;
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: level === 4 ? NAVY : "FFFFFF" }, line: { color: NAVY, width: 1 } });
  const ends = { 1: 0, 2: 90, 3: 180 };
  if (level >= 1 && level <= 3)
    s.addShape(pres.shapes.PIE, { x, y, w: d, h: d, fill: { color: NAVY }, line: { color: NAVY, width: 0.25 }, angleRange: [270, ends[level]] });
}

// legend (right-aligned on section title line)
const legend = [[4, "Best in class"], [3, "Strong"], [2, "Capable"], [1, "Limited"], [0, "Not offered"]];
const lw = [0.72, 0.42, 0.5, 0.45, 0.62];
let lx = GX + gW - (lw.reduce((a, b) => a + b, 0) + 5 * 0.2 + 4 * 0.22);
legend.forEach(([lvl, lab], i) => {
  ball(lx + 0.06, GY + 0.1, lvl, 0.12);
  txt(lab, { x: lx + 0.2, y: GY + 0.02, w: lw[i] + 0.1, h: 0.17, fontSize: 8, color: MUTED });
  lx += 0.2 + lw[i] + 0.22;
});

// column headers
const HY = GY + 0.34, HH = 0.5;
hline(GX, HY, gW, NAVY, 0.75);
const models = [["Claude Opus 5.5", "Anthropic"], ["GPT-6 Astra", "OpenAI"], ["Kimi K3", "Moonshot AI"]];
txt("Task", { x: GX, y: HY + 0.08, w: cTask, h: 0.2, fontSize: 9, bold: true, color: MUTED });
models.forEach(([m, d], i) => {
  txt([{ text: m, options: { bold: true, color: NAVY, fontSize: 9.5, breakLine: true } }, { text: d, options: { color: MUTED, fontSize: 8 } }],
    { x: bx[i], y: HY + 0.08, w: cBall, h: 0.38, align: "center" });
});
txt("Supporting evidence", { x: evX, y: HY + 0.08, w: cEv, h: 0.2, fontSize: 9, bold: true, color: MUTED });
hline(GX, HY + HH, gW, RULE, 0.75);

// rows: [task, sub, [opus, astra, kimi], best index, evidence]
const rows = [
  ["Large-scale code migration", "Codebase-wide refactors & audits", [4, 3, 2], 0,
    "680K-line migration in <1 day; 200K-line audit in <3 hrs (Opus 5: 20+ hrs)"],
  ["Agentic coding & terminal work", "Long-running dev / DevOps agents", [4, 3, 2], 0,
    "Terminal-Bench 4.0: Opus 66.4% vs Astra 57.9%"],
  ["Knowledge work & financial analysis", "Research, modelling, reports", [4, 2, 2], 0,
    "GDPval-AA v2.1 (Elo): Opus 1,846 vs Astra 1,542"],
  ["Autonomous desktop & browser use", "Multi-app GUI workflows", [3, 4, 1], 1,
    "Astra: 72.6% OSWorld 2.0 at ~40 min per task, 47% faster than GPT-5.6 Sol¹"],
  ["3D & professional creative software", "Blender, Unreal Engine 5", [2, 4, 1], 1,
    "Astra operates Blender and UE5 directly; builds playable 3D scenes"],
  ["Frontier math & scientific research", "Proofs, lab & compute workflows", [3, 4, 2], 1,
    "Astra: 97.6% FrontierMath T4; Terminal-Bench-Science 64.6% vs Opus 58.7%"],
  ["High-volume, low-cost workloads", "Classification, extraction, RAG", [3, 1, 4], 2,
    "Output $/1M tokens: Kimi $15, Opus $20, Astra $50"],
  ["Self-hosting & data sovereignty", "On-prem, fine-tuning, air-gapped", [0, 0, 4], 2,
    "Only open-weight option; runs on-prem or in Databricks / Fireworks"],
];
const RH = 0.535;
let y = HY + HH;
rows.forEach(([task, sub, lv, best, ev], r) => {
  s.addShape(pres.shapes.RECTANGLE, { x: bx[best] + 0.06, y: y + 0.05, w: cBall - 0.12, h: RH - 0.1, fill: { color: TINT }, line: { color: TINT, width: 0 } });
  txt([{ text: task, options: { bold: true, color: INK, fontSize: 9.5, breakLine: true } }, { text: sub, options: { color: MUTED, fontSize: 8 } }],
    { x: GX, y: y + 0.09, w: cTask - 0.1, h: RH - 0.12 });
  lv.forEach((v, i) => ball(bx[i] + cBall / 2, y + RH / 2, v));
  txt(ev, { x: evX, y: y + 0.08, w: cEv - 0.12, h: RH - 0.12, fontSize: 8.5, color: INK, valign: "middle" });
  y += RH;
  hline(GX, y, gW, r === rows.length - 1 ? NAVY : HAIR, r === rows.length - 1 ? 0.75 : 0.5);
});
const gridBottom = y;

// ---------- Right: key specs ----------
const SX = GX + gW + 0.38, SW = R - SX; // ~3.88
const sLab = 1.03, sCol = (SW - sLab) / 3;
txt("KEY SPECIFICATIONS", { x: SX, y: GY, w: SW, h: 0.2, fontSize: 9.5, bold: true, color: NAVY, charSpacing: 0.5 });
hline(SX, HY, SW, NAVY, 0.75);
const shortNames = ["Opus 5.5", "GPT-6 Astra", "Kimi K3"];
shortNames.forEach((m, i) => txt(m, { x: SX + sLab + i * sCol, y: HY + 0.08, w: sCol, h: 0.2, fontSize: 9, bold: true, color: NAVY, align: "center" }));
hline(SX, HY + 0.34, SW, RULE, 0.75);

const specs = [
  ["Released", ["22 Sep 2026", "3 Sep 2026", "16 Jul 2026"]],
  ["Access", ["Closed API", "Closed API, staged", "Open weights"]],
  ["Input $/1M", ["$4.00", "$10.00", "$3.00"]],
  ["Output $/1M", ["$20.00", "$50.00", "$15.00"]],
  ["Cached input $/1M", ["$0.20", "$1.00", "$0.30"]],
  ["Context window", ["1M", "1.05M", "1M"]],
  ["Architecture", ["Undisclosed", "Undisclosed", "2.8T MoE, 104B active"]],
];
let sy = HY + 0.34;
const SRH = 0.29;
specs.forEach(([lab, vals], r) => {
  const h = r === specs.length - 1 ? 0.42 : SRH;
  txt(lab, { x: SX, y: sy, w: sLab, h, fontSize: 8.5, color: MUTED, valign: "middle" });
  vals.forEach((v, i) => txt(v, { x: SX + sLab + i * sCol + 0.03, y: sy, w: sCol - 0.06, h, fontSize: 8.5, color: INK, align: "center", valign: "middle" }));
  sy += h;
  hline(SX, sy, SW, r === specs.length - 1 ? NAVY : HAIR, r === specs.length - 1 ? 0.75 : 0.5);
});

// ---------- Right: recommendation ----------
const RY = sy + 0.26;
txt("RECOMMENDED DEPLOYMENT", { x: SX, y: RY, w: SW, h: 0.2, fontSize: 9.5, bold: true, color: NAVY, charSpacing: 0.5 });
const recBoxY = RY + 0.3, recBoxH = gridBottom - recBoxY;
s.addShape(pres.shapes.RECTANGLE, { x: SX, y: recBoxY, w: SW, h: recBoxH, fill: { color: TINT }, line: { color: TINT, width: 0 } });
const recs = [
  ["Default: Claude Opus 5.5. ", "Best all-rounder for coding, agents and analyst work. Priced 60% below Astra, with the lowest prompt-injection rate tested (Gray Swan)."],
  ["Specialist: GPT-6 Astra. ", "Long-running GUI automation, 3D tooling and frontier math. OpenAI rates its cyber capability \"Critical\", so access is gated."],
  ["Cost & control: Kimi K3. ", "Self-host for regulated data or high-volume work, on-prem or in a Western cloud rather than via the China-hosted API."],
];
txt(recs.map(([h, b], i) => ({ text: h, options: { bold: true, color: NAVY } })).flatMap((h, i) => [h, { text: recs[i][1], options: { color: INK, breakLine: i < recs.length - 1, paraSpaceAfter: 7 } }]),
  { x: SX + 0.16, y: recBoxY + 0.14, w: SW - 0.32, h: recBoxH - 0.24, fontSize: 8.5, lineSpacingMultiple: 1.05 });

// ---------- Footer ----------
txt([
  { text: "Notes: Ratings are an analyst assessment of vendor-reported benchmarks; cross-lab scores are not always like-for-like. Prices are list API rates, US$ per 1M tokens. (1) Anthropic reports 81.8% on OSWorld 2.0 for Opus 5.5 under different test settings.", options: { breakLine: true } },
  { text: "Sources: Anthropic, Introducing Claude Opus 5.5 (22 Sep 2026); OpenAI, GPT-6 Astra launch post and system card (3 Sep 2026); Moonshot AI, Kimi K3 tech report (16 Jul 2026); Artificial Analysis; Databricks." },
], { x: L, y: 6.98, w: R - L, h: 0.3, fontSize: 7, color: MUTED });

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
