const { existsSync } = require("fs");

exports.readConfigFile = async (toolbox, FilePath) => {
  if (!existsSync(FilePath + "/Cloud.config"))
    return [false, "File don't exists."];
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
};

exports.checkRequiredFiles = async (path) => {
  if (existsSync(path + "/Cloud.config") || existsSync(path + "/package.json"))
    return true;
  else false;
};

exports.createConfigFile = async (toolbox, Settings, AppPath, CLIPath) => {
  if (!Settings[1].endsWith(".js")) {
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
};
