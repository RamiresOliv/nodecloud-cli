exports.run = async (_toolbox, args) => {
  console.log(_toolbox.print.colors.highlight("NodeCloud-CLI Commands List:"));
  const files = _toolbox.filesystem.list(__dirname);
  const tableItens = [
    [
      _toolbox.print.colors.highlight("Command"),
      _toolbox.print.colors.highlight("Aliases"),
      _toolbox.print.colors.highlight("Description"),
    ],
  ];
  files.forEach((fileName) => {
    const file = require(__dirname + "/" + fileName);

    var aliases = "";
    if (file.config.aliases && file.config.aliases.length != 0) {
      file.config.aliases.forEach((alias, i) => {
        if (file.config.aliases.length == i + 1) {
          aliases += alias + ".";
        } else {
          aliases += alias + ", ";
        }
      });
    } else {
      aliases = "N/A";
    }

    tableItens.push([
      _toolbox.print.colors.green(file.config.name),
      _toolbox.print.colors.yellow(aliases),
      _toolbox.print.colors.grey(file.config.description),
    ]);
  });
  _toolbox.print.table(tableItens, {
    format: "markdown",
  });
  _toolbox.print.muted(
    "Installed CLI Version: " + require("../../package.json").version
  );
  _toolbox.print.muted("All of this commands are disponible in the CLI.");
};

exports.config = {
  name: "help",
  description: "Show all commands disponible in the CLI.",
  aliases: ["h", "ajuda"],
};
