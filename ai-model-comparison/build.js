const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI model comparison, Sep 2026";

const NAVY = "041E42", INK = "1F2A37", MUTED = "5F6B7A", RULE = "C9D0D9", HAIR = "E3E7EC", TINT = "EAF0F7";
const F = "Arial";

// Type scale: one size per role, used everywhere
const T = {
  tracker: 10, title: 21, section: 12, colHead: 10, colSub: 8.5,
  rowHead: 10.5, rowSub: 8.5, body: 9, legend: 8.5, footer: 7.5,
};

const s = pres.addSlide();
s.background = { color: "FFFFFF" };

const L = 0.45, R = 12.883;
const txt = (t, o) => s.addText(t, Object.assign({ fontFace: F, margin: 0, isTextBox: true, color: INK, valign: "top" }, o));
const hline = (x, y, w, color, pt) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: pt } });
const rect = (x, y, w, h, color) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color }, line: { color, width: 0 } });

// "text{1} **bold**" -> runs with superscript footnote markers and bold leaders
function runs(str, base = {}) {
  return str.split(/(\{\d\}|\*\*[^*]+\*\*)/).filter(Boolean).map(p => {
    const m = p.match(/^\{(\d)\}$/);
    if (m) return { text: `(${m[1]})`, options: Object.assign({}, base, { superscript: true }) };
    const b = p.match(/^\*\*([^*]+)\*\*$/);
    if (b) return { text: b[1], options: Object.assign({}, base, { bold: true, color: NAVY }) };
    return { text: p, options: Object.assign({}, base) };
  });
}
const twoLine = (a, b) => [
  { text: a, options: { bold: true, color: NAVY, fontSize: T.colHead, breakLine: true } },
  { text: b, options: { color: MUTED, fontSize: T.colSub } },
];

// ---------- Header ----------
txt("Frontier AI model comparison  |  As of 23 September 2026", { x: L, y: 0.34, w: 8, h: 0.2, fontSize: T.tracker, color: MUTED });
txt("Analysis of the top three frontier AI models: Claude Opus 5.5, GPT-6 Astra and Kimi K3",
  { x: L, y: 0.6, w: R - L, h: 0.42, fontSize: T.title, bold: true, color: NAVY });
hline(L, 1.14, R - L, NAVY, 1);

// ---------- Grid geometry (shared by both tables) ----------
const GY = 1.32;                 // section header line
const HY = GY + 0.38, HH = 0.52; // column header band
const RH = 0.64;                 // task row; spec rows are exactly half of this
const BODY = HY + HH;

// ---------- Left: task fit ----------
const GX = L;
const cTask = 2.62, cBall = 0.92, cEv = 2.79;
const gW = cTask + 3 * cBall + cEv; // 8.17
const bx = [GX + cTask, GX + cTask + cBall, GX + cTask + 2 * cBall];
const evX = GX + cTask + 3 * cBall + 0.12, evW = cEv - 0.12;
const D = 0.2;

txt("Task fit", { x: GX, y: GY, w: 3, h: 0.24, fontSize: T.section, bold: true, color: NAVY });

function ball(cx, cy, level, d = D) {
  if (level === null) { txt("n/a", { x: cx - 0.3, y: cy - 0.1, w: 0.6, h: 0.2, fontSize: T.body, color: MUTED, align: "center", valign: "middle" }); return; }
  const x = cx - d / 2, y = cy - d / 2;
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: level === 4 ? NAVY : "FFFFFF" }, line: { color: NAVY, width: 1 } });
  const ends = { 1: 0, 2: 90, 3: 180 };
  if (level >= 1 && level <= 3)
    s.addShape(pres.shapes.PIE, { x, y, w: d, h: d, fill: { color: NAVY }, line: { color: NAVY, width: 0.25 }, angleRange: [270, ends[level]] });
}

// legend, right-aligned on the section header line
const legend = [[4, "Best in class"], [3, "Strong"], [2, "Capable"], [1, "Limited"]];
const lw = [0.78, 0.42, 0.52, 0.47];
const lBall = 0.15, lGap = 0.24, lPad = 0.07;
let lx = GX + gW - (lw.reduce((a, b) => a + b, 0) + legend.length * (lBall + lPad) + (legend.length - 1) * lGap);
legend.forEach(([lvl, lab], i) => {
  ball(lx + lBall / 2, GY + 0.125, lvl, lBall);
  txt(lab, { x: lx + lBall + lPad, y: GY + 0.03, w: lw[i] + 0.1, h: 0.19, fontSize: T.legend, color: MUTED, valign: "middle" });
  lx += lBall + lPad + lw[i] + lGap;
});

hline(GX, HY, gW, NAVY, 0.75);
txt(twoLine("Task", "Use case"), { x: GX, y: HY + 0.08, w: cTask, h: 0.4 });
[["Opus 5.5", "Anthropic"], ["GPT-6 Astra", "OpenAI"], ["Kimi K3", "Moonshot AI"]].forEach(([m, d], i) =>
  txt(twoLine(m, d), { x: bx[i], y: HY + 0.08, w: cBall, h: 0.4, align: "center" }));
txt(twoLine("Key data point", "Opus 5.5 vs. Astra unless stated"), { x: evX, y: HY + 0.08, w: evW, h: 0.4 });
hline(GX, BODY, gW, RULE, 0.75);

// [task, detail, [opus, astra, k3], evidence]
const rows = [
  ["Agentic coding and migration", "Dev agents, refactors, codebase audits", [4, 3, 2],
    "Terminal-Bench 4.0: **66.4%** vs. 57.9%{1}; migrated 680K lines in under a day"],
  ["Knowledge work and finance", "Research, financial modeling, reports", [4, 2, 2],
    "GDPval-AA v2.1: **1,846** vs. 1,542 Elo; Humanity's Last Exam: **67.7%** vs. 57.2%{1}"],
  ["Computer use and automation", "Desktop, browser, multi-app workflows", [4, 4, 1],
    "OSWorld 2.0: 81.8% vs. 72.6%{2}; AutomationBench: 40.0% vs. **41.4%**{1}"],
  ["3D and creative software", "Blender, Unreal Engine 5", [2, 4, 1],
    "Astra operates Blender and UE5 directly (OpenAI launch demo)"],
  ["Frontier math and science", "Research-level math, lab workflows", [3, 4, 2],
    "Terminal-Bench-Science: 58.7% vs. **64.6%**{1}; FrontierMath Tier 4: Astra **97.6%**"],
  ["High-volume, low-cost work", "Classification, extraction, RAG", [3, 1, 4],
    "In/out $/1M: K3 **$3/$15**, Opus 5.5 $4/$20, Astra $10/$50"],
  ["Self-hosting and data control", "On-prem, private cloud", [null, null, 4],
    "Only open-weight model of the three; also on Databricks and Fireworks"],
];
let y = BODY;
rows.forEach(([task, sub, lv, ev], r) => {
  const top = Math.max(...lv.filter(v => v !== null));
  lv.forEach((v, i) => { if (v === top) rect(bx[i] + 0.08, y + 0.06, cBall - 0.16, RH - 0.12, TINT); });
  txt([{ text: task, options: { bold: true, color: INK, fontSize: T.rowHead, breakLine: true } }, { text: sub, options: { color: MUTED, fontSize: T.rowSub } }],
    { x: GX, y, w: cTask - 0.1, h: RH, valign: "middle" });
  lv.forEach((v, i) => ball(bx[i] + cBall / 2, y + RH / 2, v));
  txt(runs(ev), { x: evX, y, w: evW, h: RH, fontSize: T.body, color: INK, valign: "middle" });
  y += RH;
  hline(GX, y, gW, r === rows.length - 1 ? NAVY : HAIR, r === rows.length - 1 ? 0.75 : 0.5);
});
const gridBottom = y;

// ---------- Right: specifications ----------
const SX = GX + gW + 0.38, SW = R - SX;
const sLab = 1.3, sCol = (SW - sLab) / 3;
txt("Specifications", { x: SX, y: GY, w: SW, h: 0.24, fontSize: T.section, bold: true, color: NAVY });
hline(SX, HY, SW, NAVY, 0.75);
txt(twoLine("Metric", "Released"), { x: SX, y: HY + 0.08, w: sLab, h: 0.4 });
[["Opus 5.5", "22 Sep 2026"], ["GPT-6 Astra", "3 Sep 2026"], ["Kimi K3", "16 Jul 2026"]].forEach(([m, d], i) =>
  txt(twoLine(m, d), { x: SX + sLab + i * sCol, y: HY + 0.08, w: sCol, h: 0.4, align: "center" }));
hline(SX, BODY, SW, RULE, 0.75);

// [label, values, index of best value or -1]
const specs = [
  ["Access", ["API", "API (staged)", "Open weights"], -1],
  ["Input ($/1M tokens)", ["$4.00", "$10.00", "$3.00"], 2],
  ["Output ($/1M tokens)", ["$20.00", "$50.00", "$15.00"], 2],
  ["Cached input ($/1M)", ["$0.20", "$1.00", "$0.30"], 0],
  ["Context (tokens)", ["1.0M", "1.05M", "1.0M"], -1],
  ["Parameters", ["Undisclosed", "Undisclosed", "2.8T MoE"], -1],
  ["AA Intelligence Index{3}", ["58", "53", "44"], 0],
];
let sy = BODY;
const SRH = RH / 2;
specs.forEach(([lab, vals, best], r) => {
  if (best >= 0) rect(SX + sLab + best * sCol + 0.1, sy + 0.04, sCol - 0.2, SRH - 0.08, TINT);
  txt(runs(lab), { x: SX, y: sy, w: sLab, h: SRH, fontSize: T.body, color: MUTED, valign: "middle" });
  vals.forEach((v, i) => txt(runs(v, { bold: i === best, color: i === best ? NAVY : INK }),
    { x: SX + sLab + i * sCol, y: sy, w: sCol, h: SRH, fontSize: T.body, align: "center", valign: "middle" }));
  sy += SRH;
  hline(SX, sy, SW, r === specs.length - 1 ? NAVY : HAIR, r === specs.length - 1 ? 0.75 : 0.5);
});

// ---------- Right: recommended use ----------
const RY = sy + 0.26;
txt("Recommended use", { x: SX, y: RY, w: SW, h: 0.24, fontSize: T.section, bold: true, color: NAVY });
const boxY = RY + 0.38, boxH = gridBottom - boxY;
rect(SX, boxY, SW, boxH, NAVY);
const recs = [
  ["Opus 5.5", "DEFAULT", "Coding, agents and analysis at c.60% below Astra's price"],
  ["GPT-6 Astra", "SPECIALIST", "3D and creative tools, frontier math and science"],
  ["Kimi K3", "SELF-HOSTED", "Regulated data and high-volume, low-cost workloads"],
];
const pad = 0.18, entryH = (boxH - 2 * 0.06) / recs.length;
recs.forEach(([name, role, why], i) => {
  const ey = boxY + 0.06 + i * entryH;
  txt(name, { x: SX + pad, y: ey + 0.08, w: 2, h: 0.2, fontSize: 10.5, bold: true, color: "FFFFFF" });
  txt(role, { x: SX + SW - pad - 1.4, y: ey + 0.1, w: 1.4, h: 0.18, fontSize: 7.5, bold: true, color: "A9BBD3", align: "right", charSpacing: 1 });
  txt(why, { x: SX + pad, y: ey + 0.3, w: SW - 2 * pad, h: 0.18, fontSize: T.body, color: "DCE4EE" });
  if (i < recs.length - 1) hline(SX + pad, ey + entryH, SW - 2 * pad, "2A4570", 0.5);
});

// ---------- Footer ----------
const FY = gridBottom + 0.14;
txt([
  ...runs("Note: Ratings are analyst judgment; shading marks the leader in each row. Prices are list API rates. Parameter counts are not disclosed by Anthropic or OpenAI. {1} As reported by Anthropic. {2} Vendors used different test settings. {3} Artificial Analysis, v4.3."), { text: "", options: { breakLine: true } },
  { text: "Source: Anthropic (22 Sep 2026); OpenAI (3 Sep 2026); Moonshot AI (16 Jul 2026); Artificial Analysis" },
], { x: L, y: FY, w: R - L - 0.4, h: 0.28, fontSize: T.footer, color: MUTED });
txt("1", { x: R - 0.3, y: FY + 0.14, w: 0.3, h: 0.14, fontSize: T.footer, color: MUTED, align: "right" });

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
