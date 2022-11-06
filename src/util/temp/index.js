exports.upload = __dirname + "/upload";
exports.download = __dirname + "/download";
exports.create = __dirname + "/create";

const { readdirSync, unlinkSync } = require("fs");

readdirSync(exports.upload).forEach((ChildName) => {
  if (ChildName == ".keep") return;
  unlinkSync(exports.upload + "/" + ChildName);
});

readdirSync(exports.download).forEach((ChildName) => {
  if (ChildName == ".keep") return;
  unlinkSync(exports.download + "/" + ChildName);
});
