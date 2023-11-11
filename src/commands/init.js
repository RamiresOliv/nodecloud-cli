const { FileWorker } = require("../util");

const defaultConfigs = {
  name: "MyCoolApp",
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

    return FileWorker.createConfigFile(
      toolbox,
      {
        name: defaultConfigs.name,
        lan: language,
        main: defaultConfigs.main[language],
      }, // 1 2 3
      args[0],
      args[1]
    );
  } else if (args[3] == "-y") {
    var languageToGo;
    if (FileWorker.fileExists(toolbox, args[0], "main.py")) {
      languageToGo = "python";
    } else {
      languageToGo = defaultConfigs.language;
    }
    await FileWorker.createConfigFile(
      toolbox,
      {
        name: defaultConfigs.name,
        lan: languageToGo,
        main: defaultConfigs.main[languageToGo],
      }, // 1 2 3
      args[0],
      args[1]
    );
    toolbox.print.info(
      toolbox.print.colors.green("Created: " + args[0] + "\\" + "cloud.config")
    );
    process.kill(0);
  }
  const { name, language, mainSelect } = await toolbox.prompt.ask([
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
  var main = mainSelect;
  if (!mainSelect.endsWith("." + resume[language])) {
    main = mainSelect + "." + resume[language];
  }
  setTimeout(() => {
    FileWorker.createConfigFile(
      toolbox,
      { name: name, lan: language, main: main }, // 1 2 3
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
