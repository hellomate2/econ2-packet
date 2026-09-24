// Renders the mock screens and theme art used in the deck to transparent PNGs.
const { chromium } = require("playwright");
const path = require("path");

const NM = path.resolve(__dirname, "../node_modules");
const font = (fam, file, w) => `@font-face{font-family:'${fam}';font-weight:${w};src:url('file://${NM}/${file}') format('woff2');}`;
const FONTS = [
  font("Poppins", "@fontsource/poppins/files/poppins-latin-400-normal.woff2", 400),
  font("Poppins", "@fontsource/poppins/files/poppins-latin-500-normal.woff2", 500),
  font("Poppins", "@fontsource/poppins/files/poppins-latin-600-normal.woff2", 600),
  font("JBMono", "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", 400),
  font("JBMono", "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2", 500),
].join("\n");

const BASE = `
${FONTS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:Poppins;color:#E8ECFA;-webkit-font-smoothing:antialiased}
.win{border-radius:18px;background:#0E1433;border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 60px rgba(0,0,0,.45);overflow:hidden}
.bar{height:38px;display:flex;align-items:center;gap:8px;padding:0 16px;background:#141B42;border-bottom:1px solid rgba(255,255,255,.08)}
.dot{width:12px;height:12px;border-radius:50%}
.bar .t{margin-left:10px;font-size:13px;color:#8C95BD}
.mono{font-family:JBMono,monospace}
`;

const pages = {
  // Deep dive: the us-east-1 outage, as a status log
  "mock-status": [1120, 820, `
  <div class="win" style="width:1080px;margin:20px">
    <div class="bar"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span><span class="t">Service health · us-east-1</span></div>
    <div style="padding:34px 40px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:26px">
        <span style="width:14px;height:14px;border-radius:50%;background:#FF6B6B;box-shadow:0 0 18px #FF6B6B"></span>
        <span style="font-size:26px;font-weight:600">Increased error rates · DynamoDB</span>
      </div>
      ${[
        ["Oct 19 · 11:48 PM", "#FF6B6B", "Investigating", "Elevated API error rates for requests to dynamodb.us-east-1"],
        ["Oct 20 · 12:26 AM", "#FFB547", "Identified", "Regional endpoint is resolving to an empty DNS record"],
        ["Oct 20 · 2:40 AM", "#FFB547", "Mitigating", "DNS restored. Dependent services still backed up"],
        ["Oct 20 · 2:20 PM", "#3DDC97", "Resolved", "All services recovered"],
      ].map(([t, c, s, d]) => `
        <div style="display:flex;gap:22px;padding:18px 0;border-top:1px solid rgba(255,255,255,.08)">
          <div class="mono" style="width:190px;font-size:16px;color:#8C95BD;padding-top:3px">${t}</div>
          <div style="flex:1">
            <div style="font-size:17px;font-weight:600;color:${c};margin-bottom:4px">${s}</div>
            <div style="font-size:17px;color:#C9CFEA">${d}</div>
          </div>
        </div>`).join("")}
      <div class="mono" style="margin-top:18px;font-size:14px;color:#6B74A0">times in PDT · 14 hours, 32 minutes</div>
    </div>
  </div>`],

  // Deep dive: coding agents
  "mock-agent": [1120, 760, `
  <div class="win" style="width:1080px;margin:20px">
    <div class="bar"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span><span class="t">~/payments · zsh</span></div>
    <div class="mono" style="padding:30px 36px;font-size:19px;line-height:1.75">
      <div><span style="color:#A78BFA">$</span> agent "the retry test keeps flaking, fix it"</div>
      <div style="color:#8C95BD">› reading tests/payments/test_retry.py</div>
      <div style="color:#8C95BD">› the test sleeps on the real clock and races the timeout</div>
      <div style="color:#8C95BD">› swapping in a fake clock <span style="color:#3DDC97">+12</span> <span style="color:#FF6B6B">−4</span></div>
      <div style="margin-top:14px"><span style="color:#A78BFA">$</span> pytest -q</div>
      <div><span style="color:#3DDC97">214 passed</span> <span style="color:#8C95BD">in 8.31s</span></div>
      <div style="margin-top:14px;color:#3DDC97">✓ opened PR #4817 <span style="color:#E8ECFA">"Use a fake clock in retry tests"</span></div>
      <div style="color:#8C95BD">› waiting on review from @maya</div>
    </div>
  </div>`],

  // Deep dive: HFT
  "mock-hft": [1120, 760, `
  <div class="win" style="width:1080px;margin:20px;background:#0A0F24">
    <div class="bar" style="background:#0F1530"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span><span class="t">strategy.log</span></div>
    <div class="mono" style="padding:30px 36px;font-size:18px;line-height:1.9">
      ${[
        ["09:30:00.000000412", "md ", "ABC  bid 101.25 x 40   ask 101.26 x 3", "#C9CFEA"],
        ["09:30:00.000000533", "md ", "ABC  ask 101.26 x 0    level cleared", "#C9CFEA"],
        ["09:30:00.000000871", "sig", "book imbalance +0.81", "#5EE0A0"],
        ["09:30:00.000001152", "ord", "BUY 5 ABC @ 101.26    sent", "#FFFFFF"],
        ["09:30:00.000019304", "ack", "filled 5 @ 101.26", "#5EE0A0"],
      ].map(([t, k, m, c]) => `<div><span style="color:#6B74A0">${t}</span>  <span style="color:#FFB547">${k}</span>  <span style="color:${c}">${m}</span></div>`).join("")}
      <div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:48px">
        <div><div style="font-size:14px;color:#6B74A0">tick to trade</div><div style="font-size:36px;color:#5EE0A0">740 ns</div></div>
        <div><div style="font-size:14px;color:#6B74A0">wire to exchange</div><div style="font-size:36px;color:#E8ECFA">18.2 µs</div></div>
      </div>
    </div>
  </div>`],

  // Deep dive: prediction markets
  "mock-market": [980, 880, `
  <div class="win" style="width:940px;margin:20px;background:#F7F8FC;color:#11162E;border:none">
    <div style="padding:36px 40px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:15px;font-weight:600;color:#5B6380;letter-spacing:.06em">WEATHER · BERKELEY</span>
        <span style="font-size:15px;color:#5B6380">$2.1M vol</span>
      </div>
      <div style="font-size:34px;font-weight:600;line-height:1.25;margin-bottom:28px">Will it rain in Berkeley on Big Game day?</div>
      <div style="display:flex;gap:18px;margin-bottom:30px">
        <div style="flex:1;border-radius:14px;background:#E3F8EE;padding:22px 24px"><div style="font-size:16px;color:#1E8F5A;font-weight:600">Yes</div><div style="font-size:44px;font-weight:600;color:#137A4A">34¢</div></div>
        <div style="flex:1;border-radius:14px;background:#FDE7EA;padding:22px 24px"><div style="font-size:16px;color:#C23B4E;font-weight:600">No</div><div style="font-size:44px;font-weight:600;color:#A8283B">67¢</div></div>
      </div>
      <div style="font-size:15px;font-weight:600;color:#5B6380;margin-bottom:10px">Order book · Yes</div>
      ${[["36¢", "1,240", "ask"], ["35¢", "3,905", "ask"], ["34¢", "8,112", "bid"], ["33¢", "2,570", "bid"]].map(([p, q, s]) =>
        `<div class="mono" style="display:flex;justify-content:space-between;padding:9px 14px;margin-bottom:6px;border-radius:8px;font-size:18px;background:${s === "ask" ? "#FDEFF1" : "#EAF8F1"};color:${s === "ask" ? "#A8283B" : "#137A4A"}"><span>${p}</span><span>${q}</span></div>`).join("")}
    </div>
  </div>`],

  // Deep dive: AI scribe
  "mock-note": [1180, 800, `
  <div style="display:flex;gap:22px;margin:20px;width:1140px">
    <div class="win" style="width:470px;padding:26px 24px">
      <div style="font-size:14px;color:#8C95BD;margin-bottom:16px;display:flex;align-items:center;gap:10px"><span style="width:10px;height:10px;border-radius:50%;background:#FF7AA8;box-shadow:0 0 12px #FF7AA8"></span>Listening · 06:42</div>
      ${[["Dr. Patel", "Any chest pain when you climb stairs?"], ["Patient", "A little tightness, mostly in the mornings."], ["Dr. Patel", "Still taking the lisinopril, 10 milligrams?"], ["Patient", "Yeah, every day."]].map(([w, t], i) =>
        `<div style="margin-bottom:14px;${i % 2 ? "padding-left:34px" : ""}"><div style="font-size:13px;color:#8C95BD;margin-bottom:4px">${w}</div><div style="font-size:17px;line-height:1.45;background:${i % 2 ? "#1B2352" : "#232C63"};padding:12px 16px;border-radius:14px">${t}</div></div>`).join("")}
    </div>
    <div class="win" style="flex:1;background:#F7F8FC;color:#11162E;border:none;padding:30px 34px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><span style="font-size:22px;font-weight:600">Draft note</span><span style="font-size:13px;font-weight:600;color:#B0336A;background:#FCE4EF;padding:6px 12px;border-radius:20px">AI draft · needs review</span></div>
      ${[["Subjective", "Intermittent chest tightness on exertion, mostly AM. Adherent to lisinopril 10 mg daily."], ["Objective", "BP 142/88, HR 78. Lungs clear."], ["Assessment", "Exertional chest discomfort, r/o angina. HTN, above goal."], ["Plan", "ECG today. Order stress test. Recheck BP in 2 weeks."]].map(([h, t]) =>
        `<div style="margin-bottom:16px"><div style="font-size:14px;font-weight:600;color:#B0336A;margin-bottom:3px">${h}</div><div style="font-size:17px;line-height:1.5;color:#2A3150">${t}</div></div>`).join("")}
      <div style="margin-top:8px;display:inline-block;background:#11162E;color:#fff;font-size:15px;font-weight:500;padding:12px 22px;border-radius:10px">Review & sign</div>
    </div>
  </div>`],
};

// Theme art: quiet decorative panels in each theme's accent colour
function svgPage(w, h, inner) {
  return [w + 40, h + 40, `<svg width="${w}" height="${h}" style="margin:20px" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`];
}
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// Systems: a rack of status lights, a few of them failing
(() => {
  const r = rnd(7); let g = "";
  for (let y = 0; y < 14; y++) for (let x = 0; x < 10; x++) {
    const bad = (x === 6 && y > 3 && y < 9) || r() < 0.03;
    const on = r() > 0.12;
    g += `<rect x="${x * 52}" y="${y * 52}" width="40" height="40" rx="9" fill="${bad ? "#FF6B6B" : on ? "#6FD6FF" : "#6FD6FF"}" opacity="${bad ? 0.95 : on ? 0.18 + r() * 0.5 : 0.07}"/>`;
  }
  pages["art-systems"] = svgPage(508, 716, g);
})();

// Close to the metal: circuit traces
(() => {
  const r = rnd(11); let g = "";
  for (let i = 0; i < 26; i++) {
    let x = Math.round(r() * 10) * 50, y = 0, d = `M${x} ${y}`;
    for (let k = 0; k < 7; k++) { y += 60 + Math.round(r() * 3) * 20; d += ` L${x} ${y}`; if (r() > 0.5) { x += (r() > 0.5 ? 50 : -50); y += 50; d += ` L${x} ${y}`; } }
    g += `<path d="${d}" stroke="#FF9F5A" stroke-width="3" fill="none" opacity="${0.15 + r() * 0.55}"/><circle cx="${x}" cy="${y}" r="7" fill="#FF9F5A" opacity=".8"/>`;
  }
  pages["art-metal"] = svgPage(520, 720, g);
})();

// Markets: a price tape
(() => {
  const r = rnd(5); let g = ""; let p = 101.25;
  for (let i = 0; i < 18; i++) {
    const d = (r() - 0.48) * 0.08; p += d;
    const up = d >= 0;
    g += `<text x="0" y="${34 + i * 40}" font-family="JBMono, monospace" font-size="24" fill="${up ? "#5EE0A0" : "#FF7A8A"}" opacity="${0.25 + (i / 18) * 0.75}">${up ? "▲" : "▼"} ${p.toFixed(2)}  ${Math.round(r() * 900 + 100)}</text>`;
  }
  pages["art-markets"] = svgPage(420, 730, g);
})();

// Health: a heartbeat trace
(() => {
  // long and flat so it can run the full width of a slide
  let d = "M0 90"; let x = 0;
  while (x < 2400) { d += ` L${x + 150} 90 L${x + 165} 78 L${x + 180} 90 L${x + 200} 90 L${x + 210} 18 L${x + 222} 162 L${x + 234} 90 L${x + 400} 90`; x += 400; }
  pages["art-health"] = svgPage(2400, 180, `<path d="${d}" stroke="#FF7AA8" stroke-width="4" fill="none" stroke-linejoin="round" opacity=".9"/>`);
})();

// AI: tokens streaming out
(() => {
  const words = ["The", " fix", " is", " to", " inject", " a", " fake", " clock", " so", " the", " test", " no", " longer", " races", " the", " timeout", ".", " 214", " passed", "."];
  let g = "", x = 0, y = 40;
  words.forEach((w, i) => {
    const wpx = w.length * 17 + 18;
    if (x + wpx > 600) { x = 0; y += 64; }
    g += `<rect x="${x}" y="${y - 32}" width="${wpx}" height="46" rx="10" fill="#A78BFA" opacity="${0.1 + (i % 4) * 0.07}"/><text x="${x + 9}" y="${y}" font-family="JBMono, monospace" font-size="26" fill="#E8ECFA" opacity="${1 - i * 0.035}">${w.replace(" ", " ")}</text>`;
    x += wpx + 8;
  });
  pages["art-ai"] = svgPage(620, 360, g);
})();

// Wildcards: a pixel star and a rollback frame strip
(() => {
  const star = ["....##....", "....##....", "...####...", "##########", ".########.", "..######..", "..##..##..", ".##....##.", "##......##"];
  let g = "";
  star.forEach((row, y) => [...row].forEach((c, x) => { if (c === "#") g += `<rect x="${x * 30}" y="${y * 30}" width="28" height="28" fill="#FFD166"/>`; }));
  pages["art-pixel"] = svgPage(300, 270, g);
  let f = "";
  ["1041", "1042", "1043", "1044"].forEach((n, i) => {
    f += `<rect x="${i * 150}" y="0" width="136" height="96" rx="12" fill="${i === 1 ? "#FFD166" : "none"}" stroke="#FFD166" stroke-width="3" opacity="${i === 1 ? 1 : 0.6}"/><text x="${i * 150 + 68}" y="58" text-anchor="middle" font-family="JBMono, monospace" font-size="26" fill="${i === 1 ? "#1A1440" : "#FFD166"}">F${n}</text>`;
  });
  f += `<path d="M560 130 C 420 190, 240 190, 216 118" stroke="#FFD166" stroke-width="3" fill="none"/><path d="M204 128 L216 110 L232 126" stroke="#FFD166" stroke-width="3" fill="none"/><text x="390" y="200" text-anchor="middle" font-family="JBMono, monospace" font-size="22" fill="#FFD166" opacity=".8">late input, rewind 2 frames</text>`;
  pages["art-rollback"] = svgPage(600, 210, f);
})();

(async () => {
  const b = await chromium.launch();
  for (const [name, [w, h, html]] of Object.entries(pages)) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.setContent(`<html><head><style>${BASE}</style></head><body>${html}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(__dirname, `img/${name}.png`), omitBackground: true, fullPage: true });
    await p.close();
  }
  await b.close();
  console.log("rendered", Object.keys(pages).length);
})();
