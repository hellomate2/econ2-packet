// Renders colour icons, brand logos (on white tiles) and the AZ monogram to PNG.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const NM = path.resolve(__dirname, "../node_modules");
const OUT = path.join(__dirname, "img");
fs.mkdirSync(OUT, { recursive: true });

const fluent = require(`${NM}/@iconify-json/fluent-emoji-flat/icons.json`);
const flat = require(`${NM}/@iconify-json/flat-color-icons/icons.json`);
function iconSvg(set, name) {
  const ic = set.icons[name];
  if (!ic) throw new Error("missing icon " + name);
  const w = ic.width || set.width || 16, h = ic.height || set.height || 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="512" height="512">${ic.body}</svg>`;
}

const ICONS = {
  // fluent emoji flat: colourful, same family as the reference deck's icons
  cloud: "cloud-with-lightning", db: "file-cabinet", chat: "speech-balloon", crab: "crab", chip: "high-voltage",
  stopwatch: "stopwatch", robot: "robot", magnifier: "magnifying-glass-tilted-left", coin: "coin", game: "video-game",
  joystick: "joystick", tower: "satellite-antenna", chart: "chart-increasing", ball: "crystal-ball", card: "credit-card",
  bank: "bank", stethoscope: "stethoscope", xray: "x-ray", hospital: "hospital", grad: "graduation-cap", scroll: "scroll",
  envelope: "envelope", ballot: "ballot-box-with-ballot", handshake: "handshake", calendar: "calendar", laptop: "laptop",
  medal1: "1st-place-medal", trophy: "trophy", light: "light-bulb", people: "busts-in-silhouette", dna: "dna",
  mic: "studio-microphone", key: "key", bug: "bug", link: "link", shield: "shield", check: "check-mark-button", memo: "memo", gear: "gear",
};

// Brand marks from simple-icons, drawn in their own brand colour on a white tile
const si = require(`${NM}/simple-icons`);
const BRANDS = { discord: "siDiscord", postgres: "siPostgresql", rust: "siRust", linux: "siLinux", nvidia: "siNvidia", google: "siGoogle", stripe: "siStripe", circle: "siCircle", cloudflare: "siCloudflare" };

(async () => {
  for (const [k, name] of Object.entries(ICONS)) {
    await sharp(Buffer.from(iconSvg(fluent, name))).png().toFile(path.join(OUT, `ic-${k}.png`));
  }
  const tile = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#FFFFFF"/>${inner}</svg>`;
  for (const [k, key] of Object.entries(BRANDS)) {
    const b = si[key];
    if (!b) throw new Error("missing brand " + key);
    const colour = k === "linux" ? "#1B1B1B" : `#${b.hex}`;
    const inner = `<g transform="translate(116 116) scale(11.67)"><path d="${b.path}" fill="${colour}"/></g>`;
    await sharp(Buffer.from(tile(inner))).png().toFile(path.join(OUT, `logo-${k}.png`));
  }
  // Brand marks in colour on a transparent background, for the shared white icon circle
  for (const [k, key] of Object.entries(BRANDS)) {
    const b = si[key];
    const colour = k === "linux" ? "#1B1B1B" : `#${b.hex}`;
    await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="${b.path}" fill="${colour}"/></svg>`)).png().toFile(path.join(OUT, `mk-${k}.png`));
  }
  // OpenAI mark (not in simple-icons) from the lobehub set
  const oa = fs.readFileSync(`${NM}/@lobehub/icons-static-svg/icons/openai.svg`, "utf8").match(/<path[^>]*d="([^"]+)"/)[1];
  await sharp(Buffer.from(tile(`<g transform="translate(116 116) scale(11.67)"><path d="${oa}" fill="#000000"/></g>`))).png().toFile(path.join(OUT, "logo-openai.png"));

  // AZ monogram: gold ring, two-letter wordmark
  const mono = (ring, text, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${bg ? `<circle cx="256" cy="256" r="246" fill="${bg}"/>` : ""}
    <circle cx="256" cy="256" r="238" fill="none" stroke="${ring}" stroke-width="10"/>
    <circle cx="256" cy="256" r="212" fill="none" stroke="${ring}" stroke-width="3" opacity=".7"/>
    <text x="256" y="300" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="150" fill="${text}" letter-spacing="6">AZ</text>
  </svg>`;
  await sharp(Buffer.from(mono("#FDB515", "#FDB515"))).png().toFile(path.join(OUT, "az-mark.png"));
  await sharp(Buffer.from(mono("#FFFFFF", "#FFFFFF"))).png().toFile(path.join(OUT, "az-mark-white.png"));
  console.log("assets ok");
})();
