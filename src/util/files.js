const { existsSync, createWriteStream } = require("fs");
var archiver = require("archiver");

// Selling this product is not allowed.
exports.fileExists = (toolbox, Path, Name) => {
  r = existsSync(Path + "/" + Name);
  return r;
};

exports.readConfigFile = async (toolbox, FilePath) => {
  if (!existsSync(FilePath + "/cloud.config"))
    return [false, "File don't exists."];
  try {
    function readCloudConf(path = ".") {
      path = path.replace(/(\\|\/)$/, "");
      return toolbox.filesystem.read(FilePath + "/cloud.config");
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
    return { data: [true, "success"], return: readded };
  } catch (err) {
    return [false, "500"];
  }
};

exports.checkRequiredFiles = async (toolbox, path) => {
  const r = await exports.readConfigFile(toolbox, path);
  if (r.data[0] == false && r.data[1] == "500") {
    return [false, 500];
  }
  console.log(r.return);
  if (!existsSync(path + "/cloud.config")) return [false, 404, "cloud.config"];
  if (
    r.return.LANGUAGE.toLowerCase() == "node.js" &&
    !existsSync(path + "/package.json")
  )
    return [false, 404, "package.json"];
  if (
    r.return.LANGUAGE.toLowerCase() == "python" &&
    !existsSync(path + "/requirements.txt")
  )
    return [false, 404, "requirements.txt"];
  if (
    r.return.NAME == null ||
    r.return.LANGUAGE == null ||
    r.return.START == null ||
    r.return.IGNOREDS == null
  ) {
    return [false, 400];
  }

  return [true, 200];
};

exports.createConfigFile = async (toolbox, Settings, AppPath, CLIPath) => {
  const result = await toolbox.EJS.render(
    toolbox.filesystem.read(CLIPath + "/src/templates/cloud.config.ejs"),
    {
      Name: Settings.name,
      Language: Settings.lan,
      Starter: Settings.main,
      Id: "N/A",
      Ignoreds: "[]",
    }
  );
  toolbox.filesystem.write(AppPath + "/cloud.config", result);
  return;
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

  archive.glob("**/*", {
    cwd: toZipPath,
    ignore: ["node_modules/**", "package-lock.json"],
  });

  archive.pipe(outputFile);
  archive.finalize();
  return {
    Filer: outputFile,
    filePath: targetPath + "/" + targetName + ".zip",
    fileName: targetName + ".zip",
  };
};
