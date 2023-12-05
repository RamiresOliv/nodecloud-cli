const { FileWorker, NodeCloudApi } = require("../util");

const defaultConfigs = {
  name: "mycoolapp",
  language: "node.js",
  main: {
    default: "index.js",
    ["node.js"]: "index.js",
    ["python"]: "main.py",
    ["ruby"]: "main.rb",
  },
};

const resume = {
  ["python"]: "py",
  ["node.js"]: "js",
  ["ruby"]: "rb",
};

exports.run = async (toolbox, args) => {
  if (args[2] == "--read") {
    r = await FileWorker.readConfigFile(toolbox, args[0]);
    if (r[0] == false) {
      toolbox.print.warning(
        "⚠️ O arquivo de configuração da sua aplicação está invalida, não foi possivel ler o arquivo. Verifique por erros e tente novamente!"
      );
      process.kill(0);
    }
    toolbox.print.info(toolbox.print.colors.muted(r.data));
    return toolbox.print.debug(r.return, "CloudSettings - Reader Debug");
  } else if (args[2] == "-ly") {
    const { language } = await toolbox.prompt.ask([
      {
        type: "select",
        name: "language",
        message:
          "Porfavor informe qual tipo de linguagem essa aplicação vai usar.",
        choices: ["node.js", "python", "ruby"],
      },
    ]);
    var versionToSend;
    if (language == "node.js") {
      res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
      versionToSend = res.data[0].version.replace("v", "");
    } else if (language == "python") {
      res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);
      versionToSend = res.data[1]["latest"];
    } else if (language == "ruby") {
      res = await NodeCloudApi.api.get.bin.getRubyVersion(toolbox);
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
      args[0]
    );
    toolbox.print.info(
      toolbox.print.colors.green("Created: " + args[0] + "\\" + "cloud.config")
    );

    toolbox.print.info(
      toolbox.print.colors.muted(
        `Lingaguem selecionada: ${language} versão: ${versionToSend}`
      )
    );
    return process.kill(0);
  } else if (args[2] == "-y") {
    var languageToGo;
    if (FileWorker.fileExists(toolbox, args[0], "main.py")) {
      languageToGo = "python";
    } else if (FileWorker.fileExists(toolbox, args[0], "main.rb")) {
      languageToGo = "ruby";
    } else {
      languageToGo = defaultConfigs.language;
    }
    var versionToSend;
    if (languageToGo == "node.js") {
      res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
      versionToSend = res.data[0].version.replace("v", "");
    } else if (languageToGo == "python") {
      res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);
      versionToSend = res.data[1]["latest"];
    } else if (languageToGo == "ruby") {
      res = await NodeCloudApi.api.get.bin.getRubyVersion(toolbox);
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
      args[0]
    );
    toolbox.print.info(
      toolbox.print.colors.green("Created: " + args[0] + "\\" + "cloud.config")
    );
    toolbox.print.info(
      toolbox.print.colors.muted(
        `Lingaguem selecionada: ${languageToGo} versão: ${versionToSend}`
      )
    );
    return process.kill(0);
  }
  let { name } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "name",
      message: "Porfavor insire um nome para sua Aplicação.",
    },
  ]);
  if (name == "") {
    toolbox.print.info(
      toolbox.print.colors.red("A aplicação precisa de um nome.")
    );
    process.kill(0);
  }
  let { language } = await toolbox.prompt.ask([
    {
      type: "select",
      name: "language",
      message:
        "Porfavor informe qual tipo de linguagem essa aplicação vai usar.",
      choices: ["node.js", "python", "ruby"],
    },
  ]);
  var versionsGetRes = [];
  if (language == "node.js") {
    res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
    toolbox.print.info(
      toolbox.print.colors.yellow(
        "Node.js: Jesus.. Total de " +
          res.data.length +
          " versões achadas!! Mas só 12 foram listadas."
      )
    );
    toolbox.print.info(
      toolbox.print.colors.muted(
        'Não achou a versão que precisa? Use a opção "Manual" para digitar manualmente.'
      )
    );
    var times = 0;
    res.data.forEach((version) => {
      if (times <= 13) {
        versionsGetRes.push(version["version"].replace("v", ""));
      }
      times += 1;
    });
    versionsGetRes.push("Manual");
  } else if (language == "python") {
    res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);
    res.data.forEach((version) => {
      versionsGetRes.push(version["latest"]);
    });
    versionsGetRes.shift();
  } else if (language == "ruby") {
    res = await NodeCloudApi.api.get.bin.getRubyVersion(toolbox);
    res.data.forEach((version) => {
      versionsGetRes.push(version["latest"]);
    });
    //versionToSend = res.data[0]["latest"];
  }
  let { version } = await toolbox.prompt.ask([
    {
      type: "select",
      name: "version",
      message:
        "Porfavor informe qual a versão do " +
        language +
        " sua aplicação vai usar.",
      choices: versionsGetRes,
    },
  ]);
  if (version == "Manual") {
    let { versionManual } = await toolbox.prompt.ask([
      {
        type: "input",
        name: "versionManual",
        message: "Agora inforome aqui qual versão você gostaria usar.",
      },
    ]);
    version = versionManual;
  }

  let { mainSelect } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "mainSelect",
      message:
        "Porfavor insira o nome do arquivo de inicialização. (input_vazio = " +
        defaultConfigs.main[language] +
        ")",
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
  if (language == "") {
    loading.fail(
      toolbox.print.colors.red(
        "É necessario especificar qual linguagem sua aplicação usará. python || node.js || ruby"
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

  /*if (version == null || version == "") {
    var gettedVersion;
    if (language == "node.js") {
      res = await NodeCloudApi.api.get.bin.getNodeVersion(toolbox);
      gettedVersion = res.data[0].version.replace("v", "");
    } else if (languageToGo == "python") {
      res = await NodeCloudApi.api.get.bin.getPythonVersion(toolbox);

      versionToSend = res.data[1]["latest"];
    } else if (languageToGo == "ruby") {
      res = await NodeCloudApi.api.get.bin.getRubyVersion(toolbox);
      console.log(res);
      versionToSend = res.data[0]["latest"];
    }
    version = gettedVersion;
  }*/
  setTimeout(() => {
    FileWorker.createConfigFile(
      toolbox,
      { name: name.toLowerCase(), lan: language, main: main, version: version }, // 1 2 3
      args[0]
    ).then((ok, data) => {
      loading.succeed(
        toolbox.print.colors.green(
          'Arquivo de configuração da Cloud "cloud.config", foi criado.'
        )
      );
      toolbox.print.info(
        toolbox.print.colors.muted(
          `Lingaguem selecionada: ${language} versão: ${version}`
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
