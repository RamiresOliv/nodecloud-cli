const { exec } = require("child_process");

exports.run = async (toolbox, args) => {
  exec("cd " + args[1] + " && start .");
  console.log(toolbox.print.colors.green("Root folder da CLI aberto."));
  process.kill(0);
};

exports.config = {
  name: "path",
  description: "Opens the CLI NPM Root Folder.",
  aliases: [],
};
