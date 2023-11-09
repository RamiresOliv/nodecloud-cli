const { exec } = require("child_process");

exports.run = async (toolbox, args) => {
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
    child = exec("npm update -g " + require("../../package.json").name);
    child.on("exit", function (code, signal) {
      if (code != 0) {
        loading.fail(
          toolbox.print.colors.red(`FAIL: code-${code}, signal:${signal}`)
        );
      } else loading.succeed(toolbox.print.colors.green("Update finalizado! Agora a CLI deve estar atualizada na versão mais recente."));
      process.kill(0);
    });
  } else {
    loading.fail(toolbox.print.colors.red("Failed."));
    process.kill(0);
  }
};

exports.config = {
  name: "update",
  description: "Opens the CLI NPM Root Folder.",
  aliases: [],
};
