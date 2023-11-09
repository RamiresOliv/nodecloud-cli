const { readdirSync } = require("fs");
const cli_toolbox = require("gluegun");
const ejs = require("ejs");

// Selling this product is not allowed.

// Only Time commands handler
exports.cli = async (args) => {
  const commands = {};
  const aliases = {};
  readdirSync(args[1] + "/src/commands")
    .filter((file) => file.endsWith(".js"))
    .forEach((cmdName) => {
      const requireCmd = require(args[1] + "/src/commands/" + cmdName);

      if (typeof requireCmd.run == "function") {
        if (typeof requireCmd.config == "object") {
          commands[requireCmd.config.name] = requireCmd.run;
          if (requireCmd.config.aliases) {
            requireCmd.config.aliases.forEach((alias) => {
              aliases[alias] = requireCmd.config.name;
            });
          }
        } else
          return cli_toolbox.print.warning(
            `[DevError] Internal Error: ${cmdName}, Don't have run function. Then Command ignored.`
          );
      } else
        return cli_toolbox.print.warning(
          `[DevError] Internal Error: ${cmdName}, Don't have config object. Then Command ignored.`
        );
    });

  // run cmd/find commands
  if (!args[2]) {
    cli_toolbox.print.highlight(`Olá! Sejá bem vindo(a) ao NodeCloud!`);
    cli_toolbox.print.muted(`Para começar use "nodecloud help"`);
    cli_toolbox.print.muted(
      `nodecloud-cli V` +
        require("../package.json").version +
        "-" +
        require("../package.json").versionType.toUpperCase()
    );
    return "warn-cmdNoExpecified-???";
  } else if (args[2].toLowerCase() == "-v" || args[2].toLowerCase() == "--v") {
    console.log(
      `nodecloud-cli V` +
        require("../package.json").version +
        "-" +
        require("../package.json").versionType.toUpperCase()
    );
    return "warn-cmdNoExpecified-???";
  }
  args[2].toLowerCase();
  var command = args[2];
  var cmdRun = null;
  var found = false;
  for (var cmd in commands) {
    if (cmd == command) {
      found = true;
      cmdRun = commands[cmd];
    } else {
      for (var i_aliases in aliases) {
        if (i_aliases == command) {
          found = true;
          command = aliases[i_aliases];
          cmdRun = commands[command];
        }
      }
    }
  }
  if (!found) {
    cli_toolbox.print.error(`O comando "${command}" não foi achado.`);
    cli_toolbox.print.warning(`Para consultar comandos use "nodecloud help"`);
    return "err-cmdNotFound-404";
  }

  try {
    args[2] = null;
    cli_toolbox.EJS = ejs; // adds EJS in gluegun toolbox
    cmdRun(cli_toolbox, args);
  } catch (err) {
    cli_toolbox.print.error(`---`);
    cli_toolbox.print.error(
      `[500] Internal Error: Not possible to execute command "${command}"`
    );
    cli_toolbox.print.error(
      `---------------------------------------------------------------------------------`
    );
    cli_toolbox.print.error(err);
  }
};
