exports.upload = __dirname + "/upload";
exports.download = __dirname + "/download";

const { readdirSync, unlinkSync, existsSync, mkdirSync } = require("fs");

// Selling this product is not allowed.
if (!existsSync(__dirname + "/upload")) {
  mkdirSync(__dirname + "/upload");
}
if (!existsSync(__dirname + "/download")) {
  mkdirSync(__dirname + "/download");
}

readdirSync(exports.upload).forEach((ChildName) => {
  if (ChildName != ".keep") unlinkSync(exports.upload + "/" + ChildName);
});

readdirSync(exports.download).forEach((ChildName) => {
  if (ChildName != ".keep") unlinkSync(exports.download + "/" + ChildName);
});
