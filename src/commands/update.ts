import { exec } from "child_process";

exports.run = async (toolbox, args: string[]) => {
  toolbox.print.muted(
    `nodecloud-cli V` +
      require("../../package.json").version +
      "-" +
      require("../../package.json").versionType.toUpperCase()
  );
  const confirmation = await toolbox.prompt.confirm(
    "Você tem certeza que gostaria de fazer um update usando o NPM para a verção mais recente dessa CLI?",
    true
  );
  const loading = toolbox.print.spin("Aguarde...");
  if (confirmation) {
    const child = exec("npm update -g " + require("../../package.json").name);
    let err = "";
    child.stderr.on("data", (data) => {
      err += data;
    });
    child.on("exit", function (code, signal) {
      if (code != 0) {
        loading.fail(toolbox.print.colors.red(`FAIL: code: ${code}`));
        toolbox.print.error(err);
      } else {
        loading.succeed(
          toolbox.print.colors.green(
            "Update finalizado! Agora a CLI deve estar atualizada na versão mais recente."
          )
        );
        toolbox.print.info(
          `Tente ${toolbox.print.colors.yellow(
            "nodecloud"
          )} ${toolbox.print.colors.muted(
            "-v"
          )} para conferir qual a versão da CLI que você está usando!`
        );
      }
      process.kill(0);
    });
  } else {
    loading.fail(toolbox.print.colors.red("Failed."));
    process.kill(0);
  }
};

exports.config = {
  name: "update",
  description: "Updates the NPM Module to the latest version.",
  aliases: [],
};
