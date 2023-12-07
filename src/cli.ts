import { readdirSync } from "fs";

// Selling this product is not allowed.

const title: string = "NodeCloud-CLI";

// Only Time commands handler
export const cli = async (args: string[], toolbox: any, requires: any) => {
  const commands: Record<string, Function> = {};
  const aliases: Record<string, string> = {};

  readdirSync(args[1] + "/build/commands")
    .filter((file) => file.endsWith(".js"))
    .forEach((cmdName) => {
      const requireCmd = require(args[1] + "/build/commands/" + cmdName);

      if (typeof requireCmd.run === "function") {
        if (typeof requireCmd.config === "object") {
          commands[requireCmd.config.name] = requireCmd.run;

          if (requireCmd.config.aliases) {
            requireCmd.config.aliases.forEach((alias: string) => {
              aliases[alias] = requireCmd.config.name;
            });
          }
        } else {
          return toolbox.print.warning(
            `[DevError] Internal Error: ${cmdName}, Doesn't have a config object. Command ignored.`
          );
        }
      } else {
        return toolbox.print.warning(
          `[DevError] Internal Error: ${cmdName}, Doesn't have a run function. Command ignored.`
        );
      }
    });

  // run cmd/find commands
  if (!args[2]) {
    toolbox.print.highlight(`Olá! Seja bem-vindo(a) ao NodeCloud!`);
    toolbox.print.muted(`Para começar use "nodecloud help"`);
    toolbox.print.muted(
      `nodecloud-cli V` +
        require("../package.json").version +
        "-" +
        require("../package.json").versionType.toUpperCase()
    );
    return "warn-cmdNoExpecified-???";
  } else if (
    args[2].toLowerCase() == "-v" ||
    args[2].toLowerCase() == "--v" ||
    args[2].toLowerCase() == "-version" ||
    args[2].toLowerCase() == "--version"
  ) {
    toolbox.print.info(require("../package.json").version);
    return "warn-cmdNoExpecified-???";
  }

  const index = args.indexOf(args[1]);
  args.splice(index, 1);
  args[1].toLowerCase();
  let command: string = args[1];
  let cmdRun: Function | null = null;
  let found: boolean = false;

  for (let cmd in commands) {
    if (cmd === command) {
      found = true;
      cmdRun = commands[cmd];
    } else {
      for (let i_aliases in aliases) {
        if (i_aliases === command) {
          found = true;
          command = aliases[i_aliases];
          cmdRun = commands[command];
        }
      }
    }
  }

  if (!found) {
    toolbox.print.error(`O comando "${command}" não foi achado.`);
    toolbox.print.warning(`Para consultar comandos use "nodecloud help"`);
    return "err-cmdNotFound-404";
  }

  try {
    requires.child_proccess.exec("title " + title + " " + command);
    requires.child_proccess.exec(
      `$host.UI.RawUI.WindowTitle = "${title} ${command}"`
    );
    if (cmdRun != undefined) {
      cmdRun(toolbox, args);
    }
  } catch (err) {
    toolbox.print.error(`---`);
    toolbox.print.error(
      `[500] Internal Error: Not possible to execute command "${command}"`
    );
    toolbox.print.error(
      `---------------------------------------------------------------------------------`
    );
    toolbox.print.error(err);
  }

  return ""; // Esta função parece não ter um retorno específico em todos os caminhos, então estou retornando uma string vazia.
};

export const test = (res: string) => {
  return "Hello World! R: " + (res || "N/A");
};
