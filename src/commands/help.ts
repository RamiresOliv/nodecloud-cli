export const run = async (toolbox: any, args: string[]) => {
  console.log(toolbox.print.colors.highlight("NodeCloud-CLI Commands List:"));
  const files = toolbox.filesystem
    .list(__dirname)
    .filter((child: string) => child.endsWith(".js"));
  const tableItens = [
    [
      toolbox.print.colors.highlight("Command"),
      toolbox.print.colors.highlight("Aliases"),
      toolbox.print.colors.highlight("Description"),
    ],
  ];
  files.forEach((fileName: string) => {
    const file = require(__dirname + "/" + fileName);

    let aliases = "";
    if (file.config.aliases && file.config.aliases.length != 0) {
      file.config.aliases.forEach((alias: string, i: number) => {
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
      toolbox.print.colors.green(file.config.name),
      toolbox.print.colors.yellow(aliases),
      toolbox.print.colors.grey(file.config.description),
    ]);
  });
  toolbox.print.table(tableItens, {
    format: "markdown",
  });
  toolbox.print.muted(
    "Installed CLI Version: " + require("../../package.json").version
  );
  toolbox.print.muted("All of this commands are disponible in the CLI.");
};

export const config = {
  name: "help",
  description: "Show all commands disponible in the CLI.",
  aliases: ["h", "ajuda"],
};
