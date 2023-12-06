import { existsSync, createWriteStream, readdirSync, statSync } from "fs";
import * as archiver from "archiver";

// Selling this product is not allowed.
export const fileExists = (toolbox, Path, Name) => {
  const r = existsSync(Path + "/" + Name);
  return r;
};

export const readConfigFile = async (toolbox, FilePath) => {
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
      else if (Array.isArray(readded[item]))
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

export const checkRequiredFiles = async (toolbox, path) => {
  if (!existsSync(path + "/cloud.config")) return [false, 404, "cloud.config"];
  const r = await exports.readConfigFile(toolbox, path);
  if (r[0] == false && r[1] == "500") {
    return [false, 500];
  }

  const values = ["NAME", "LANGUAGE", "START", "IGNOREDS"];

  if (
    r.return.NAME == null ||
    r.return.LANGUAGE == null ||
    r.return.START == null ||
    r.return.IGNOREDS == null ||
    r.return.NAME == "" ||
    r.return.LANGUAGE == "" ||
    r.return.START == ""
  ) {
    var detecteds = [];
    var invalids = [];
    var count = 0;

    delete r.return.IGNOREDS;

    for (var i in r.return) {
      if (r.return[i] == null || r.return[i] == "") {
        detecteds.push(invalids);
      }
    }

    for (var i in r.return) {
      if (r.return[i] == null || r.return[i] == "") {
        count += 1;
        var returns = i + ",";
        if (detecteds.length == count) returns = i + ".";
        invalids.push(returns);
      }
    }
    return [
      false,
      400,
      `Algum valor pode estar vazio ou não existente, ${
        count > 1 ? "erros identificados" : "erro identificado"
      }: ` + invalids.join(" "),
    ];
  }

  if (r.return.LANGUAGE.toLowerCase() == "node.js") {
    ("found node.js");
  } else if (r.return.LANGUAGE.toLowerCase() == "python") {
    ("found python");
  } else if (r.return.LANGUAGE.toLowerCase() == "ruby") {
    ("found ruby");
  } else {
    return [false, 400, "LANGUAGE Invalid: Apenas node.js, python ou ruby"];
  }

  if (
    r.return.LANGUAGE.toLowerCase() == "node.js" &&
    !existsSync(path + "/package.json")
  ) {
    return [false, 404, "package.json"];
  } else if (
    r.return.LANGUAGE.toLowerCase() == "python" &&
    !existsSync(path + "/requirements.txt")
  ) {
    return [false, 404, "requirements.txt"];
  } else if (
    r.return.LANGUAGE.toLowerCase() == "ruby" &&
    !existsSync(path + "/Gemfile")
  ) {
    return [false, 404, "Gemfile"];
  }

  return [true, 200];
};

export const createConfigFile = async (toolbox, Settings, AppPath) => {
  const result = await toolbox.EJS.render(
    toolbox.filesystem.read(__dirname + "/../templates/cloud.config.ejs"),
    {
      Name: Settings.name,
      Language: Settings.lan,
      Version: Settings.version,
      OS: "alpine",
      Starter: Settings.main,
      Id: "N/A",
      Ignoreds: "[]",
    }
  );
  toolbox.filesystem.write(AppPath + "/cloud.config", result);
  return;
};

export const createProjectZipFile = async (
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

  var venvFolder = "";
  readdirSync(toZipPath)
    .filter((childName) => !statSync(toZipPath + "/" + childName).isFile())
    .forEach((folder) => {
      readdirSync(toZipPath + "/" + folder).forEach((child) => {
        if (child == "pyvenv.cfg") {
          venvFolder = folder + "/**";
        }
      });
    });

  archive.glob("**/*", {
    cwd: toZipPath,
    ignore: ["node_modules/**", "package-lock.json", venvFolder],
  });

  archive.pipe(outputFile);
  archive.finalize();
  return {
    Filer: outputFile,
    filePath: targetPath + "/" + targetName + ".zip",
    fileName: targetName + ".zip",
  };
};