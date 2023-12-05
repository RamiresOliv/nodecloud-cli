"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.upload = void 0;
const uploadF = __dirname + "/upload";
const downloadF = __dirname + "/download";
exports.upload = uploadF;
exports.download = downloadF;
const fs_1 = require("fs");
// Selling this product is not allowed.
if (!(0, fs_1.existsSync)(__dirname + "/upload")) {
    (0, fs_1.mkdirSync)(__dirname + "/upload");
}
if (!(0, fs_1.existsSync)(__dirname + "/download")) {
    (0, fs_1.mkdirSync)(__dirname + "/download");
}
(0, fs_1.readdirSync)(uploadF).forEach((ChildName) => {
    if (ChildName != ".keep")
        (0, fs_1.unlinkSync)(exports.upload + "/" + ChildName);
});
(0, fs_1.readdirSync)(downloadF).forEach((ChildName) => {
    if (ChildName != ".keep")
        (0, fs_1.unlinkSync)(exports.download + "/" + ChildName);
});
