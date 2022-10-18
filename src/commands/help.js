exports.run = async (_toolbox, args) => {
  const print = _toolbox.print;
  const spinner = print.spin("Loading...");
  setTimeout(() => {
    spinner.succeed("Cool, worked!");
    process.kill(0);
  }, 3000);
};

exports.config = {
  name: "help",
  description: "Show all commands disponible in the CLI.",
  aliases: ["h", "ajuda"],
};
