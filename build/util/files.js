"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectZipFile = exports.createConfigFile = exports.checkRequiredFiles = exports.readConfigFile = exports.fileExists = void 0;
const fs_1 = require("fs");
const archiver = __importStar(require("archiver"));
// Selling this product is not allowed.
const fileExists = (toolbox, Path, Name) => {
    const r = (0, fs_1.existsSync)(Path + "/" + Name);
    return r;
};
exports.fileExists = fileExists;
const readConfigFile = async (toolbox, FilePath) => {
    if (!(0, fs_1.existsSync)(FilePath + "/cloud.config"))
        return [false, "File don't exists."];
    try {
        function readCloudConf(path = ".") {
            path = path.replace(/(\\|\/)$/, "");
            return toolbox.filesystem.read(FilePath + "/cloud.config");
        }
        const readded = Object.fromEntries(readCloudConf()
            .split(/\r?\n/)
            .map((a) => a.split("=")));
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
    }
    catch (err) {
        return [false, "500"];
    }
};
exports.readConfigFile = readConfigFile;
const checkRequiredFiles = async (toolbox, path) => {
    if (!(0, fs_1.existsSync)(path + "/cloud.config"))
        return [false, 404, "cloud.config"];
    const r = await exports.readConfigFile(toolbox, path);
    if (r[0] == false && r[1] == "500") {
        return [false, 500];
    }
    const values = ["NAME", "LANGUAGE", "START", "IGNOREDS"];
    if (r.return.NAME == null ||
        r.return.LANGUAGE == null ||
        r.return.START == null ||
        r.return.IGNOREDS == null ||
        r.return.NAME == "" ||
        r.return.LANGUAGE == "" ||
        r.return.START == "") {
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
                if (detecteds.length == count)
                    returns = i + ".";
                invalids.push(returns);
            }
        }
        return [
            false,
            400,
            `Algum valor pode estar vazio ou não existente, ${count > 1 ? "erros identificados" : "erro identificado"}: ` + invalids.join(" "),
        ];
    }
    if (r.return.LANGUAGE.toLowerCase() == "node.js") {
        ("found node.js");
    }
    else if (r.return.LANGUAGE.toLowerCase() == "python") {
        ("found python");
    }
    else if (r.return.LANGUAGE.toLowerCase() == "ruby") {
        ("found ruby");
    }
    else {
        return [false, 400, "LANGUAGE Invalid: Apenas node.js, python ou ruby"];
    }
    if (r.return.LANGUAGE.toLowerCase() == "node.js" &&
        !(0, fs_1.existsSync)(path + "/package.json")) {
        return [false, 404, "package.json"];
    }
    else if (r.return.LANGUAGE.toLowerCase() == "python" &&
        !(0, fs_1.existsSync)(path + "/requirements.txt")) {
        return [false, 404, "requirements.txt"];
    }
    else if (r.return.LANGUAGE.toLowerCase() == "ruby" &&
        !(0, fs_1.existsSync)(path + "/Gemfile")) {
        return [false, 404, "Gemfile"];
    }
    return [true, 200];
};
exports.checkRequiredFiles = checkRequiredFiles;
const createConfigFile = async (toolbox, Settings, AppPath) => {
    const result = await toolbox.EJS.render(toolbox.filesystem.read(__dirname + "/../templates/cloud.config.ejs"), {
        Name: Settings.name,
        Language: Settings.lan,
        Version: Settings.version,
        OS: "alpine",
        Starter: Settings.main,
        Id: "N/A",
        Ignoreds: "[]",
    });
    toolbox.filesystem.write(AppPath + "/cloud.config", result);
    return;
};
exports.createConfigFile = createConfigFile;
const createProjectZipFile = async (toolbox, toZipPath, targetPath, targetName) => {
    var outputFile = (0, fs_1.createWriteStream)(targetPath + "/" + targetName + ".zip");
    var archive = archiver("zip");
    archive.on("error", function (err) {
        throw err;
    });
    var venvFolder = "";
    (0, fs_1.readdirSync)(toZipPath)
        .filter((childName) => !(0, fs_1.statSync)(toZipPath + "/" + childName).isFile())
        .forEach((folder) => {
        (0, fs_1.readdirSync)(toZipPath + "/" + folder).forEach((child) => {
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
exports.createProjectZipFile = createProjectZipFile;
