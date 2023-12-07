import { existsSync, createWriteStream, readdirSync, statSync } from "fs";

// Selling this product is not allowed.
export const fileExists = (toolbox: any, Path: string, Name: string) => {
  const r = existsSync(Path + "/" + Name);
  return r;
};

export const readConfigFile = async (toolbox: any, FilePath: string) => {
  if (!existsSync(FilePath + "/cloud.config"))
    return [false, "File don't exists."];
  try {
    function readCloudConf(path = ".") {
      path = path.replace(/(\\|\/)$/, "");
      return toolbox.filesystem.read(FilePath + "/cloud.config");
    }
    const readded: any = Object.fromEntries(
      readCloudConf()
        .split(/\r?\n/)
        .map((a: any) => a.split("="))
    );

    readded.IGNOREDS = JSON.parse(readded.IGNOREDS);

    for (let item of readded) {
      if (typeof readded[item] == "string")
        readded[item] = readded[item].replace('"', "").replace('"', "");
      else if (Array.isArray(readded[item]))
        for (let i of readded[item]) {
          if (typeof readded[item] == "string")
            item[i] = item[i].replace('"', "").replace('"', "");
        }
    }
    return { data: [true, "success"], return: readded };
  } catch (err) {
    return [false, "500"];
  }
};

export const checkRequiredFiles = async (toolbox: any, path: string) => {
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
    let detecteds: unknown[] = [];
    let invalids: unknown[] = [];
    let count = 0;

    delete r.return.IGNOREDS;

    for (let i in r.return) {
      if (r.return[i] == null || r.return[i] == "") {
        detecteds.push(invalids);
      }
    }

    for (let i in r.return) {
      if (r.return[i] == null || r.return[i] == "") {
        count += 1;
        let returns = i + ",";
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

export const createConfigFile = async (
  toolbox: any,
  Settings: any,
  AppPath: string
) => {
  const result = await toolbox.EJS.render(
    toolbox.filesystem.read(__dirname + "/../templates/cloud.config.ejs"),
    {
      Name: Settings["name"],
      Language: Settings["lan"],
      Version: Settings["version"],
      OS: "alpine",
      Starter: Settings["main"],
      Id: "N/A",
      Ignoreds: "[]",
    }
  );
  toolbox.filesystem.write(AppPath + "/cloud.config", result);
  return;
};

export const createProjectZipFile = async (
  toolbox: any,
  toZipPath: string,
  targetPath: string,
  targetName: string
) => {
  let outputFile = createWriteStream(targetPath + "/" + targetName + ".zip");
  let archive = toolbox.archiver.archiver("zip");

  archive.on("error", function (err: Error) {
    throw err;
  });

  let venvFolder = "";
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
