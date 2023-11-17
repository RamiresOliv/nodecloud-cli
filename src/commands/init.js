const { FileWorker, NodeCloudApi } = require("../util");

const defaultConfigs = {
  name: "mycoolapp",
  language: "node.js",
  main: { default: "index.js", ["node.js"]: "index.js", ["python"]: "main.py" },
};

const resume = {
  ["python"]: "py",
  ["node.js"]: "js",
};

exports.run = async (toolbox, args) => {
  if (args[3] == "--read") {
    r = await FileWorker.readConfigFile(toolbox, args[0]);
    toolbox.print.info(toolbox.print.colors.muted(r.data));
    return toolbox.print.debug(r.return, "CloudSettings - Reader Debug");
  } else if (args[3] == "-ly") {
    const { language } = await toolbox.prompt.ask([
      {
        type: "select",
        name: "language",
        message:
          "Porfavor informe qual tipo de linguagem essa aplicação vai usar.",
        choices: ["python", "node.js"],
      },
    ]);
    var versionToSend;
    if (language == "node.js") {
      res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
      versionToSend = res.data[0].version.replace("v", "");
    } else {
      res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);
      versionToSend = res.data[0]["latest"];
    }
    await FileWorker.createConfigFile(
      toolbox,
      {
        name: defaultConfigs.name.toLowerCase(),
        lan: language,
        version: versionToSend,
        main: defaultConfigs.main[language],
      }, // 1 2 3
      args[0],
      args[1]
    );
    toolbox.print.info(
      toolbox.print.colors.green("Created: " + args[0] + "\\" + "cloud.config")
    );
    return process.kill(0);
  } else if (args[3] == "-y") {
    var languageToGo;
    if (FileWorker.fileExists(toolbox, args[0], "main.py")) {
      languageToGo = "python";
    } else {
      languageToGo = defaultConfigs.language;
    }
    var versionToSend;
    if (languageToGo == "node.js") {
      res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
      versionToSend = res.data[0].version.replace("v", "");
    } else {
      res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);
      versionToSend = res.data[0]["latest"];
    }
    await FileWorker.createConfigFile(
      toolbox,
      {
        name: defaultConfigs.name.toLowerCase(),
        lan: languageToGo,
        version: versionToSend,
        main: defaultConfigs.main[languageToGo],
      }, // 1 2 3
      args[0],
      args[1]
    );
    toolbox.print.info(
      toolbox.print.colors.green("Created: " + args[0] + "\\" + "cloud.config")
    );
    return process.kill(0);
  }
  let { name, language } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "name",
      message: "Porfavor insire um nome para sua Aplicação.",
    },
    {
      type: "select",
      name: "language",
      message:
        "Porfavor informe qual tipo de linguagem essa aplicação vai usar.",
      choices: ["node.js", "python"],
    },
  ]);
  let { version, mainSelect } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "version",
      message:
        "Porfavor informe qual a versão do " +
        language +
        " sua aplicação vai usar. (ex: 20) (deixe em branco para a versão mais recente)",
    },
    {
      type: "input",
      name: "mainSelect",
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
  if (language == "") {
    loading.fail(
      toolbox.print.colors.red(
        "É necessario especificar qual linguagem sua aplicação usará. python || node.js"
      )
    );
    process.kill(0);
  }
  if (mainSelect == "") {
    mainSelect = defaultConfigs.main[language];
  }
  var main = mainSelect;
  if (!mainSelect.endsWith("." + resume[language])) {
    main = mainSelect + "." + resume[language];
  }

  if (version == "") {
    var gettedVersion;
    if (language == "node.js") {
      res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
      gettedVersion = res.data[0].version.replace("v", "");
    } else {
      res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);
      gettedVersion = res.data[0]["latest"];
    }
    version = gettedVersion;
  }
  setTimeout(() => {
    FileWorker.createConfigFile(
      toolbox,
      { name: name.toLowerCase(), lan: language, main: main, version: version }, // 1 2 3
      args[0],
      args[1]
    ).then((ok, data) => {
      loading.succeed(
        toolbox.print.colors.green(
          'Arquivo de configuração da Cloud "cloud.config", foi criado.'
        )
      );
      process.kill(0);
    });
  }, 3000);
};

exports.config = {
  name: "init",
  description: "Create a new Cloud config file.",
  aliases: ["i", "inicializar"],
};
