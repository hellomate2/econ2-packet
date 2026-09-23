const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI model comparison, Sep 2026";

const NAVY = "041E42", INK = "1F2A37", MUTED = "5F6B7A", RULE = "C9D0D9", HAIR = "E3E7EC", TINT = "EAF0F7";
const F = "Arial";
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

const L = 0.45, R = 12.883;
const txt = (t, o) => s.addText(t, Object.assign({ fontFace: F, margin: 0, isTextBox: true, color: INK, valign: "top" }, o));
const hline = (x, y, w, color, pt) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: pt } });

// "text{1} more" -> runs with superscript footnote markers
function runs(str, base = {}) {
  return str.split(/(\{\d\})/).filter(Boolean).map(p => {
    const m = p.match(/^\{(\d)\}$/);
    return m ? { text: `(${m[1]})`, options: Object.assign({}, base, { superscript: true }) } : { text: p, options: Object.assign({}, base) };
  });
}

// ---------- Header ----------
txt("Frontier AI model comparison  |  As of 23 September 2026", { x: L, y: 0.34, w: 8, h: 0.2, fontSize: 9.5, color: MUTED });
txt("Analysis of the top three frontier AI models: Claude Opus 5.5, GPT-6 Astra and Kimi K3",
  { x: L, y: 0.6, w: R - L, h: 0.42, fontSize: 21, bold: true, color: NAVY });
hline(L, 1.14, R - L, NAVY, 1);

// ---------- Left: task fit ----------
const GX = L, GY = 1.34;
const cTask = 2.45, cBall = 1.0, cEv = 2.72;
const gW = cTask + 3 * cBall + cEv; // 8.17
const bx = [GX + cTask, GX + cTask + cBall, GX + cTask + 2 * cBall];
const evX = GX + cTask + 3 * cBall + 0.12;
const D = 0.19;

txt("Task fit", { x: GX, y: GY, w: 3, h: 0.22, fontSize: 11, bold: true, color: NAVY });

function ball(cx, cy, level, d = D) {
  if (level === null) { txt("n/a", { x: cx - 0.3, y: cy - 0.09, w: 0.6, h: 0.18, fontSize: 8.5, color: MUTED, align: "center", valign: "middle" }); return; }
  const x = cx - d / 2, y = cy - d / 2;
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: level === 4 ? NAVY : "FFFFFF" }, line: { color: NAVY, width: 1 } });
  const ends = { 1: 0, 2: 90, 3: 180 };
  if (level >= 1 && level <= 3)
    s.addShape(pres.shapes.PIE, { x, y, w: d, h: d, fill: { color: NAVY }, line: { color: NAVY, width: 0.25 }, angleRange: [270, ends[level]] });
}

// legend, right-aligned on the section header line
const legend = [[4, "Best in class"], [3, "Strong"], [2, "Capable"], [1, "Limited"]];
const lw = [0.74, 0.4, 0.48, 0.44];
const lBall = 0.15, lGap = 0.24;
let lx = GX + gW - (lw.reduce((a, b) => a + b, 0) + legend.length * (lBall + 0.07) + (legend.length - 1) * lGap);
legend.forEach(([lvl, lab], i) => {
  ball(lx + lBall / 2, GY + 0.11, lvl, lBall);
  txt(lab, { x: lx + lBall + 0.07, y: GY + 0.03, w: lw[i] + 0.1, h: 0.17, fontSize: 8, color: MUTED });
  lx += lBall + 0.07 + lw[i] + lGap;
});

const HY = GY + 0.36, HH = 0.5;
hline(GX, HY, gW, NAVY, 0.75);
const models = [["Opus 5.5", "Anthropic"], ["GPT-6 Astra", "OpenAI"], ["Kimi K3", "Moonshot AI"]];
txt("Task", { x: GX, y: HY + 0.08, w: cTask, h: 0.2, fontSize: 9, bold: true, color: MUTED });
models.forEach(([m, d], i) => {
  txt([{ text: m, options: { bold: true, color: NAVY, fontSize: 9.5, breakLine: true } }, { text: d, options: { color: MUTED, fontSize: 8 } }],
    { x: bx[i], y: HY + 0.08, w: cBall, h: 0.38, align: "center" });
});
txt([{ text: "Key data point", options: { bold: true, color: MUTED, fontSize: 9, breakLine: true } }, { text: "Opus 5.5 vs. Astra unless stated", options: { color: MUTED, fontSize: 8 } }],
  { x: evX, y: HY + 0.08, w: cEv, h: 0.38 });
hline(GX, HY + HH, gW, RULE, 0.75);

// [task, detail, [opus, astra, k3], evidence]
const rows = [
  ["Agentic coding and code migration", "Dev agents, refactors, codebase audits", [4, 3, 2],
    "Terminal-Bench 4.0: 66.4% vs. 57.9%{1}; customer case: 680K-line migration in <1 day"],
  ["Knowledge work and finance", "Research, financial modeling, reports", [4, 2, 2],
    "GDPval-AA v2.1: 1,846 vs. 1,542 Elo; Humanity's Last Exam: 67.7% vs. 57.2%{1}"],
  ["Computer use and automation", "Desktop, browser, multi-app workflows", [4, 4, 1],
    "OSWorld 2.0: 81.8% vs. 72.6%{2}; AutomationBench: 40.0% vs. 41.4%{1}"],
  ["3D and creative software", "Blender, Unreal Engine 5", [2, 4, 1],
    "Astra operates Blender and UE5 directly (OpenAI launch demo)"],
  ["Frontier math and science", "Research-level math, lab workflows", [3, 4, 2],
    "Terminal-Bench-Science: 58.7% vs. 64.6%{1}; FrontierMath Tier 4: Astra 97.6%"],
  ["High-volume, cost-sensitive work", "Classification, extraction, RAG", [3, 1, 4],
    "List price, $/1M tokens in/out: K3 $3/$15; Opus\u00A05.5 $4/$20; Astra $10/$50"],
  ["Self-hosting and data control", "On-prem, private cloud", [null, null, 4],
    "Only open-weight model of the three{4}; also on Databricks and Fireworks"],
];
const RH = 0.6;
let y = HY + HH;
rows.forEach(([task, sub, lv, ev], r) => {
  const top = Math.max(...lv.filter(v => v !== null));
  lv.forEach((v, i) => { if (v === top) s.addShape(pres.shapes.RECTANGLE, { x: bx[i] + 0.08, y: y + 0.06, w: cBall - 0.16, h: RH - 0.12, fill: { color: TINT }, line: { color: TINT, width: 0 } }); });
  txt([{ text: task, options: { bold: true, color: INK, fontSize: 9.5, breakLine: true } }, { text: sub, options: { color: MUTED, fontSize: 8 } }],
    { x: GX, y: y + 0.1, w: cTask - 0.1, h: RH - 0.14 });
  lv.forEach((v, i) => ball(bx[i] + cBall / 2, y + RH / 2, v));
  txt(runs(ev), { x: evX, y: y + 0.06, w: cEv - 0.22, h: RH - 0.12, fontSize: 8.5, color: INK, valign: "middle" });
  y += RH;
  hline(GX, y, gW, r === rows.length - 1 ? NAVY : HAIR, r === rows.length - 1 ? 0.75 : 0.5);
});
const gridBottom = y;

// ---------- Right: specifications ----------
const SX = GX + gW + 0.38, SW = R - SX;
const sLab = 1.2, sCol = (SW - sLab) / 3;
txt("Specifications", { x: SX, y: GY, w: SW, h: 0.22, fontSize: 11, bold: true, color: NAVY });
hline(SX, HY, SW, NAVY, 0.75);
["Opus 5.5", "GPT-6 Astra", "Kimi K3"].forEach((m, i) => txt(m, { x: SX + sLab + i * sCol, y: HY + 0.08, w: sCol, h: 0.2, fontSize: 9, bold: true, color: NAVY, align: "center" }));
hline(SX, HY + 0.34, SW, RULE, 0.75);

const specs = [
  ["Released", ["22 Sep 2026", "3 Sep 2026", "16 Jul 2026"]],
  ["Access", ["API", "API (staged)", "Open weights{4}"]],
  ["Input ($ / 1M tokens)", ["$4.00", "$10.00", "$3.00"]],
  ["Output ($ / 1M tokens)", ["$20.00", "$50.00", "$15.00"]],
  ["Cached input ($ / 1M)", ["$0.20", "$1.00", "$0.30"]],
  ["Context (tokens)", ["1.0M", "1.05M", "1.0M"]],
  ["Parameters", ["n/a", "n/a", "2.8T MoE"]],
  ["AA Intelligence Index{3}", ["58", "53", "44"]],
];
let sy = HY + 0.34;
const SRH = 0.295;
specs.forEach(([lab, vals], r) => {
  txt(runs(lab), { x: SX, y: sy, w: sLab, h: SRH, fontSize: 8.5, color: MUTED, valign: "middle" });
  vals.forEach((v, i) => txt(runs(v), { x: SX + sLab + i * sCol + 0.02, y: sy, w: sCol - 0.04, h: SRH, fontSize: 8.5, color: INK, align: "center", valign: "middle", bold: r === specs.length - 1 }));
  sy += SRH;
  hline(SX, sy, SW, r === specs.length - 1 ? NAVY : HAIR, r === specs.length - 1 ? 0.75 : 0.5);
});

// ---------- Right: recommended use ----------
const RY = sy + 0.26;
txt("Recommended use", { x: SX, y: RY, w: SW, h: 0.22, fontSize: 11, bold: true, color: NAVY });
const boxY = RY + 0.34, boxH = gridBottom - boxY;
s.addShape(pres.shapes.RECTANGLE, { x: SX, y: boxY, w: SW, h: boxH, fill: { color: TINT }, line: { color: TINT, width: 0 } });
const recs = [
  ["Opus 5.5", "Default for coding, agents and analyst work. List price c.60% below Astra."],
  ["Astra", "Computer use, 3D tools and frontier math. Staged access; OpenAI rates its cyber capability \"Critical\"."],
  ["K3", "Self-hosted and high-volume work. Avoid Moonshot's own API for regulated data."],
];
const recNameW = 0.72, recPad = 0.15, recRowH = (boxH - 2 * recPad) / recs.length;
recs.forEach(([n, t], i) => {
  const ry = boxY + recPad + i * recRowH;
  txt(n, { x: SX + recPad, y: ry, w: recNameW, h: recRowH, fontSize: 8.5, bold: true, color: NAVY, valign: "middle" });
  txt(t, { x: SX + recPad + recNameW, y: ry, w: SW - 2 * recPad - recNameW, h: recRowH, fontSize: 8.5, color: INK, valign: "middle" });
});

// ---------- Footer ----------
const note = { fontSize: 7, color: MUTED };
txt([
  { text: "Note: Ratings are analyst judgment based on the data shown; scores reported by different vendors are not always like-for-like. Prices are list API rates.", options: { breakLine: true } },
  ...runs("{1} Opus 5.5 vs. Astra figures as reported by Anthropic (22 Sep 2026); not independently replicated.  {2} Anthropic and OpenAI report OSWorld 2.0 under different test settings.", {}),
  { text: "", options: { breakLine: true } },
  ...runs("{3} Artificial Analysis Intelligence Index v4.3 (Sep 2026). No like-for-like K3 scores are published for most tasks above, so K3 ratings rely mainly on this index.", {}),
  { text: "", options: { breakLine: true } },
  ...runs("{4} 104B active parameters. Weights released 27 Jul 2026 under the Kimi K3 License (modified open license; model-as-a-service businesses above $20M annual revenue need a separate agreement).", {}),
  { text: "", options: { breakLine: true } },
  { text: "Source: Anthropic, \"Introducing Claude Opus 5.5\" (22 Sep 2026); OpenAI, \"GPT-6 Astra\" (3 Sep 2026); Moonshot AI, \"Kimi K3 Tech Blog\" (16 Jul 2026); Artificial Analysis; Databricks; Fireworks AI." },
], Object.assign({ x: L, y: gridBottom + 0.14, w: R - L - 0.4, h: 0.62, lineSpacingMultiple: 1.0 }, note));
txt("1", { x: R - 0.3, y: 7.08, w: 0.3, h: 0.16, fontSize: 8, color: MUTED, align: "right" });

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
