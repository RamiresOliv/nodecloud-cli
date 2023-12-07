"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.run = void 0;
const child_process_1 = require("child_process");
const run = async (toolbox, args) => {
    (0, child_process_1.exec)("cd " + __dirname + "/../.." + " && start .");
    console.log(toolbox.print.colors.green("Root folder da CLI aberto."));
};
exports.run = run;
exports.config = {
    name: "path",
    description: "Opens the CLI NPM Root Folder.",
    aliases: [],
};
