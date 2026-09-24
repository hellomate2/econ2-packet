// Compact mock screens with large type so they stay readable when projected.
// Each renders at ~640 CSS px wide and is placed ~5.3" wide, so 22px text lands near 13pt.
const { chromium } = require("playwright");
const path = require("path");
const NM = path.resolve(__dirname, "../node_modules");
const font = (fam, file, w) => `@font-face{font-family:'${fam}';font-weight:${w};src:url('file://${NM}/${file}') format('woff2');}`;
const CSS = `
${font("Poppins", "@fontsource/poppins/files/poppins-latin-400-normal.woff2", 400)}
${font("Poppins", "@fontsource/poppins/files/poppins-latin-500-normal.woff2", 500)}
${font("Poppins", "@fontsource/poppins/files/poppins-latin-600-normal.woff2", 600)}
${font("JBMono", "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", 400)}
${font("JBMono", "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2", 500)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:Poppins;color:#E8ECFA;-webkit-font-smoothing:antialiased;padding:24px}
.win{width:640px;border-radius:16px;background:#0B1133;border:1.5px solid #3A4BB0;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.4)}
.bar{height:40px;display:flex;align-items:center;gap:8px;padding:0 16px;background:#141C4A;border-bottom:1px solid #2A3680}
.dot{width:12px;height:12px;border-radius:50%}
.bar span.t{margin-left:8px;font-size:16px;color:#9AA4D6}
.mono{font-family:JBMono,monospace}
.light{background:#F7F8FC;color:#11162E;border:none}
`;
const bar = t => `<div class="bar"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span><span class="t">${t}</span></div>`;

const pages = {
  "m-hft": `<div class="win">${bar("strategy.log")}<div class="mono" style="padding:24px 26px;font-size:21px;line-height:1.75">
    <div><span style="color:#8A94C8">.000000533</span> <span style="color:#FDB515">md</span>  ask cleared</div>
    <div><span style="color:#8A94C8">.000000871</span> <span style="color:#FDB515">sig</span> imbalance <span style="color:#5EE0A0">+0.81</span></div>
    <div><span style="color:#8A94C8">.000001152</span> <span style="color:#FDB515">ord</span> BUY 5 @ 101.26</div>
    <div><span style="color:#8A94C8">.000019304</span> <span style="color:#FDB515">ack</span> <span style="color:#5EE0A0">filled</span></div>
    <div style="margin-top:18px;padding-top:16px;border-top:1px solid #2A3680;display:flex;gap:56px">
      <div><div style="font-size:16px;color:#8A94C8">tick to trade</div><div style="font-size:40px;color:#5EE0A0">740 ns</div></div>
      <div><div style="font-size:16px;color:#8A94C8">to exchange</div><div style="font-size:40px">18 µs</div></div></div></div></div>`,

  "m-agent": `<div class="win">${bar("~/payments")}<div class="mono" style="padding:24px 26px;font-size:21px;line-height:1.75">
    <div><span style="color:#FDB515">$</span> agent "fix the flaky retry test"</div>
    <div style="color:#9AA4D6">› test races the real clock</div>
    <div style="color:#9AA4D6">› swapped in a fake clock <span style="color:#5EE0A0">+12</span> <span style="color:#FF7A8A">−4</span></div>
    <div style="margin-top:10px"><span style="color:#FDB515">$</span> pytest -q</div>
    <div style="color:#5EE0A0">214 passed</div>
    <div style="margin-top:10px;color:#5EE0A0">✓ opened PR #4817</div>
    <div style="color:#9AA4D6">› waiting on review from @maya</div></div></div>`,

  "m-market": `<div class="win light"><div style="padding:28px 30px">
    <div style="font-size:15px;font-weight:600;color:#5B6380;letter-spacing:.08em;margin-bottom:6px">WEATHER · BERKELEY</div>
    <div style="font-size:28px;font-weight:600;line-height:1.25;margin-bottom:22px">Will it rain on Big Game day?</div>
    <div style="display:flex;gap:16px;margin-bottom:22px">
      <div style="flex:1;border-radius:14px;background:#E3F8EE;padding:16px 20px"><div style="font-size:18px;color:#1E8F5A;font-weight:600">Yes</div><div style="font-size:44px;font-weight:600;color:#137A4A">34¢</div></div>
      <div style="flex:1;border-radius:14px;background:#FDE7EA;padding:16px 20px"><div style="font-size:18px;color:#C23B4E;font-weight:600">No</div><div style="font-size:44px;font-weight:600;color:#A8283B">67¢</div></div></div>
    ${[["35¢", "3,905", 0], ["34¢", "8,112", 1]].map(([p, q, b]) => `<div class="mono" style="display:flex;justify-content:space-between;padding:8px 14px;margin-bottom:6px;border-radius:8px;font-size:20px;background:${b ? "#EAF8F1" : "#FDEFF1"};color:${b ? "#137A4A" : "#A8283B"}"><span>${p}</span><span>${q}</span></div>`).join("")}
    </div></div>`,

  "m-status": `<div class="win">${bar("AWS Health · us-east-1")}<div style="padding:22px 26px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span style="width:14px;height:14px;border-radius:50%;background:#FF6B6B"></span><span style="font-size:23px;font-weight:600">DynamoDB error rates</span></div>
    ${[["11:48 PM", "#FF6B6B", "Errors start"], ["12:26 AM", "#FDB515", "Empty DNS record found"], ["2:40 AM", "#FDB515", "DNS fixed, backlog remains"], ["2:20 PM", "#5EE0A0", "Fully recovered"]].map(([t, c, d]) => `
      <div style="display:flex;gap:18px;padding:11px 0;border-top:1px solid #2A3680;align-items:center">
        <div class="mono" style="width:120px;font-size:18px;color:#9AA4D6">${t}</div>
        <span style="width:10px;height:10px;border-radius:50%;background:${c}"></span>
        <div style="font-size:20px">${d}</div></div>`).join("")}</div></div>`,

  "m-note": `<div class="win light"><div style="padding:26px 30px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><span style="font-size:24px;font-weight:600">Draft note</span><span style="font-size:15px;font-weight:600;color:#B0336A;background:#FCE4EF;padding:6px 12px;border-radius:20px">AI draft · review</span></div>
    ${[["Subjective", "Chest tightness on stairs, mostly AM. Takes lisinopril 10 mg daily."], ["Assessment", "Exertional chest discomfort. BP above goal."], ["Plan", "ECG today. Order stress test."]].map(([h, t]) => `<div style="margin-bottom:14px"><div style="font-size:16px;font-weight:600;color:#B0336A">${h}</div><div style="font-size:20px;line-height:1.4;color:#2A3150">${t}</div></div>`).join("")}
    <div style="display:inline-block;background:#11162E;color:#fff;font-size:17px;font-weight:500;padding:10px 20px;border-radius:10px">Review & sign</div></div></div>`,
};

(async () => {
  const b = await chromium.launch();
  for (const [name, html] of Object.entries(pages)) {
    const p = await b.newPage({ viewport: { width: 700, height: 600 }, deviceScaleFactor: 3 });
    await p.setContent(`<html><head><style>${CSS}</style></head><body>${html}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    const el = await p.$(".win");
    const box = await el.boundingBox();
    await p.screenshot({ path: path.join(__dirname, `img/${name}.png`), omitBackground: true, clip: { x: box.x - 16, y: box.y - 8, width: box.width + 32, height: box.height + 40 } });
    await p.close();
  }
  await b.close();
  console.log("mocks ok");
})();
