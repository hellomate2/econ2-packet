const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Frontier AI model comparison";

// Plain "Title Only" layout with a real title placeholder, like PowerPoint's own
pres.defineSlideMaster({
  title: "Title Only",
  background: { color: "FFFFFF" },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 12.33, h: 0.8, fontFace: "Calibri", fontSize: 24, color: "000000", valign: "middle", align: "left" }, text: "" } }],
});
const s = pres.addSlide({ masterName: "Title Only" });
s.addText("Analysis of the top three frontier AI models: Claude Opus 5.5, GPT-6 Astra and Kimi K3", { placeholder: "title" });

const bold = t => ({ text: t, options: { bold: true } });
const rows = [
  ["", bold("Claude Opus 5.5 (Anthropic)"), bold("GPT-6 Astra (OpenAI)"), bold("Kimi K3 (Moonshot AI)")],
  [bold("Best for"),
    "Coding and agent workflows, plus analyst-type work like research, financial modeling and reports",
    "Operating desktop software, 3D and creative tools (Blender, Unreal Engine 5), and hard math and science problems",
    "High-volume, cost-sensitive work and anything that has to run on our own infrastructure"],
  [bold("Weaker at"),
    "Can't be self-hosted. Trails Astra on 3D tools and on advanced math and science",
    "By far the most expensive of the three, and access is still being rolled out in stages",
    "Clearly behind both closed models on overall capability"],
  [bold("Notable results"),
    "66.4% on Terminal-Bench 4.0 vs. 57.9% for Astra, and ahead on GDPval-AA (per Anthropic). One customer migrated 680K lines of code in under a day",
    "97.6% on FrontierMath Tier 4, and 64.6% on Terminal-Bench-Science vs. 58.7% for Opus. OpenAI rates its cyber capability as \"Critical\"",
    "Only open-weight model of the three. Also available through Databricks and Fireworks"],
  [bold("Price per 1M tokens (input/output)"), "$4 / $20", "$10 / $50", "$3 / $15"],
  [bold("Context window"), "1M tokens", "1.05M tokens", "1M tokens"],
  [bold("Parameters"), "Not disclosed", "Not disclosed", "2.8T (mixture of experts)"],
  [bold("Artificial Analysis Intelligence Index"), "58", "53", "44"],
  [bold("Release date"), "Sep 22, 2026", "Sep 3, 2026", "Jul 16, 2026"],
];

s.addTable(rows, {
  x: 0.5, y: 1.3, w: 12.33, colW: [2.1, 3.41, 3.41, 3.41],
  fontFace: "Calibri", fontSize: 12, valign: "middle",
});

s.addText([
  { text: "Recommendation: ", options: { bold: true } },
  { text: "Use Opus 5.5 as the default for most work, since it led on coding and knowledge-work benchmarks and costs about 60% less than Astra. Use Astra for jobs involving desktop software, 3D tools or hard math and science, and Kimi K3 where data has to stay in-house or cost is the main concern." },
], { x: 0.5, y: 5.95, w: 12.33, h: 0.6, fontFace: "Calibri", fontSize: 14, color: "000000", valign: "top", isTextBox: true });

s.addText("Sources: Anthropic, OpenAI and Moonshot AI launch materials; Artificial Analysis. Data as of September 23, 2026. Opus 5.5 vs. Astra benchmark comparisons are as reported by Anthropic.", {
  x: 0.5, y: 6.85, w: 12.33, h: 0.3, fontFace: "Calibri", fontSize: 10, color: "7F7F7F", isTextBox: true,
});

pres.writeFile({ fileName: "AI-Model-Comparison-Sep-2026.pptx" }).then(f => console.log("wrote", f));
