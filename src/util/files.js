const { existsSync, createWriteStream } = require("fs");
var archiver = require("archiver");

exports.readConfigFile = async (toolbox, FilePath) => {
  if (!existsSync(FilePath + "/Cloud.config"))
    return [false, "File don't exists."];
  try {
    function readCloudConf(path = ".") {
      path = path.replace(/(\\|\/)$/, "");
      return toolbox.filesystem.read(FilePath + "/Cloud.config");
    }
    const readded = Object.fromEntries(
      readCloudConf()
        .split(/\r?\n/)
        .map((a) => a.split("="))
    );

    readded.IGNOREDS = JSON.parse(readded.IGNOREDS);

    for (var item in readded) {
      if (typeof readded[item] == "string")
        readded[item] = readded[item].replace('"', "").replace('"', "");
      else if (typeof readded[item] == "array")
        for (var i in readded[item]) {
          if (typeof readded[item] == "string")
            item[i] = item[i].replace('"', "").replace('"', "");
        }
    }
    return [true, "success", readded];
  } catch (err) {
    return [false, "500"];
  }
};

exports.checkRequiredFiles = async (toolbox, path) => {
  if (!existsSync(path + "/Cloud.config")) return [false, 404, "Cloud.config"];
  if (!existsSync(path + "/package.json")) return [false, 404, "package.json"];

  const r = await exports.readConfigFile(toolbox, path);
  if (r[0] == false && r[1] == "500") {
    return [false, 500];
  }
  if (r[2].NAME == null || r[2].START == null || r[2].IGNOREDS == null) {
    return [false, 400];
  }

  return [true, 200];
};

exports.createConfigFile = async (toolbox, Settings, AppPath, CLIPath) => {
  if (Settings[1] == "") {
    Settings[1] = "index.js";
  } else if (!Settings[1].endsWith(".js")) {
    Settings[1] = Settings[1] + ".js";
  }
  const result = await toolbox.EJS.render(
    toolbox.filesystem.read(CLIPath + "/src/templates/Cloud.config.ejs"),
    {
      Name: Settings[0],
      Id: "",
      Starter: Settings[1],
      Ignoreds: "[]",
    }
  );
  toolbox.filesystem.write(AppPath + "/Cloud.config", result);
  return {
    configFileContent: configFileContent,
  };
};

exports.createProjectZipFile = async (
  toolbox,
  toZipPath,
  targetPath,
  targetName
) => {
  var outputFile = createWriteStream(targetPath + "/" + targetName + ".zip");
  var archive = archiver("zip");

  archive.on("error", function (err) {
    throw err;
  });

  archive.directory(toZipPath, false);
  archive.pipe(outputFile);
  archive.finalize();
  return {
    Filer: outputFile,
    filePath: targetPath + "/" + targetName + ".zip",
    fileName: targetName + ".zip",
  };
};
