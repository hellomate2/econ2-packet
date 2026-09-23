// Rasterize the company marks in white for the dark badges
const fs = require("fs"), sharp = require("sharp");
const dir = "node_modules/@lobehub/icons-static-svg/icons/";
Promise.all(["anthropic", "openai", "moonshot"].map(n => {
  const svg = fs.readFileSync(dir + n + ".svg", "utf8").replace(/currentColor/g, "#FFFFFF").replace('height="1em"', 'height="512"').replace('width="1em"', 'width="512"');
  return sharp(Buffer.from(svg)).png().toFile(`logo-${n}.png`);
})).then(() => console.log("logos ok"));
