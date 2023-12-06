import { exec } from "child_process";

exports.run = async (toolbox, args: string[]) => {
  exec("cd " + __dirname + "/../.." + " && start .");
  console.log(toolbox.print.colors.green("Root folder da CLI aberto."));
};

exports.config = {
  name: "path",
  description: "Opens the CLI NPM Root Folder.",
  aliases: [],
};
