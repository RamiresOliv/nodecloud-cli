const uploadF = __dirname + "/upload";
const downloadF = __dirname + "/download";

export const upload = uploadF;
export const download = downloadF;

import { readdirSync, unlinkSync, existsSync, mkdirSync } from "fs";

// Selling this product is not allowed.
if (!existsSync(__dirname + "/upload")) {
  mkdirSync(__dirname + "/upload");
}
if (!existsSync(__dirname + "/download")) {
  mkdirSync(__dirname + "/download");
}

readdirSync(uploadF).forEach((ChildName) => {
  if (ChildName != ".keep") unlinkSync(exports.upload + "/" + ChildName);
});

readdirSync(downloadF).forEach((ChildName) => {
  if (ChildName != ".keep") unlinkSync(exports.download + "/" + ChildName);
});
