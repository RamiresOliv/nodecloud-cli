"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.run = void 0;
const run = async (toolbox, args) => {
    console.log(toolbox.print.colors.highlight("NodeCloud-CLI Commands List:"));
    const files = toolbox.filesystem
        .list(__dirname)
        .filter((child) => child.endsWith(".js"));
    const tableItens = [
        [
            toolbox.print.colors.highlight("Command"),
            toolbox.print.colors.highlight("Aliases"),
            toolbox.print.colors.highlight("Description"),
        ],
    ];
    files.forEach((fileName) => {
        const file = require(__dirname + "/" + fileName);
        let aliases = "";
        if (file.config.aliases && file.config.aliases.length != 0) {
            file.config.aliases.forEach((alias, i) => {
                if (file.config.aliases.length == i + 1) {
                    aliases += alias + ".";
                }
                else {
                    aliases += alias + ", ";
                }
            });
        }
        else {
            aliases = "N/A";
        }
        tableItens.push([
            toolbox.print.colors.green(file.config.name),
            toolbox.print.colors.yellow(aliases),
            toolbox.print.colors.grey(file.config.description),
        ]);
    });
    toolbox.print.table(tableItens, {
        format: "markdown",
    });
    toolbox.print.muted("Installed CLI Version: " + require("../../package.json").version);
    toolbox.print.muted("All of this commands are disponible in the CLI.");
};
exports.run = run;
exports.config = {
    name: "help",
    description: "Show all commands disponible in the CLI.",
    aliases: ["h", "ajuda"],
};
