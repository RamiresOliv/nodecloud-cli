exports.run = async (_toolbox, args) => {
  const files = _toolbox.filesystem.list(args[1] + "/src/commands");
  const tableItens = [
    [
      _toolbox.print.colors.highlight("Command"),
      _toolbox.print.colors.highlight("Description"),
      _toolbox.print.colors.highlight("Aliases"),
    ],
  ];
  files.forEach((fileName) => {
    const file = require(args[1] + "/src/commands/" + fileName);

    var aliases = "";
    if (file.config.aliases) {
      file.config.aliases.forEach((alias) => {
        aliases += alias + " ";
      });
    } else {
      aliases = "";
    }

    tableItens.push([
      _toolbox.print.colors.green(file.config.name),
      file.config.description,
      aliases,
    ]);
  });
  _toolbox.print.table(tableItens, {
    format: "markdown",
  });
  _toolbox.print.muted("All of this commands are disponible in the CLI.");
};

exports.config = {
  name: "help",
  description: "Show all commands disponible in the CLI.",
  aliases: ["h", "ajuda"],
};
