// Rasterize the brand marks in their original colours
const fs = require("fs"), sharp = require("sharp");
const dir = "node_modules/@lobehub/icons-static-svg/icons/";
const marks = { claude: "claude-color", openai: "openai", kimi: "kimi-color" };
const size = s => s.replace('height="1em"', 'height="512"').replace('width="1em"', 'width="512"');
Promise.all(Object.entries(marks).map(([k, f]) => {
  let svg = size(fs.readFileSync(dir + f + ".svg", "utf8"));
  if (k === "openai") svg = svg.replace(/currentColor/g, "#000000");
  return sharp(Buffer.from(svg)).png().toFile(`logoc-${k}.png`);
})).then(() => console.log("ok"));
