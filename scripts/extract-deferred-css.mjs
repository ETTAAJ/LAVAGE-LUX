import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf('<style id="component-styles">');
const end = html.indexOf("</style>", start);
if (start === -1 || end === -1) {
  console.error("component-styles block not found");
  process.exit(1);
}
const css = html.slice(start + '<style id="component-styles">'.length, end).trim();
fs.writeFileSync("public/deferred.css", css);
const next = html.slice(0, start) + html.slice(end + "</style>".length);
fs.writeFileSync("public/index.html", next);
console.log("deferred.css bytes:", css.length);
