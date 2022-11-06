const { FileWorker } = require("../util");

defaultConfigs = {
  name: "MyCoolApp",
  main: "index.js",
};

exports.run = async (toolbox, args) => {
  if (args[3] == "--read") {
    return toolbox.print.debug(
      await FileWorker.readConfigFile(toolbox, args[0]),
      "CloudSettings - Reader Debug"
    );
  } else if (args[3] == "-y") {
    return FileWorker.createConfigFile(
      toolbox,
      [defaultConfigs.name, defaultConfigs.main],
      args[0],
      args[1]
    ).then(() => {});
  }
  const { name, main } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "name",
      message: "Porfavor insire um nome para sua Aplicação.",
    },
    {
      type: "input",
      name: "main",
      message: "Porfavor insire o nome do arquivo de inicialização.",
    },
  ]);
  if (!name == "")
    toolbox.print.warning(
      'O valor "IGNOREDS" foi criado automaticamente ' +
        toolbox.print.colors.bold(toolbox.print.colors.underline("VAZIO!"))
    );
  const loading = toolbox.print.spin(
    toolbox.print.colors.cyan("Continuando...")
  );
  if (name == "") {
    loading.fail(toolbox.print.colors.red("A aplicação precisa de um nome."));
    process.kill(0);
  }
  setTimeout(() => {
    FileWorker.createConfigFile(toolbox, [name, main], args[0], args[1]).then(
      (ok, data) => {
        loading.succeed(
          toolbox.print.colors.green(
            'Arquivo de configuração da Cloud "Cloud.config", foi criado.'
          )
        );
        process.kill(0);
      }
    );
  }, 3000);
};

exports.config = {
  name: "init",
  description: "Create a new Cloud config file.",
  aliases: ["c", "inicializar"],
};
