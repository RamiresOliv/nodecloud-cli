import { exec } from "child_process";

export const run = async (toolbox: any, args: string[]) => {
  exec("cd " + __dirname + "/../.." + " && start .");
  console.log(toolbox.print.colors.green("Root folder da CLI aberto."));
};

export const config = {
  name: "path",
  description: "Opens the CLI NPM Root Folder.",
  aliases: [],
};
