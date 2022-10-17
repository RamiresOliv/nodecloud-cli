const { filesystem } = require("gluegun");

function readCloudConf(path = ".") {
  path = path.replace(/(\\|\/)$/, "");
  return filesystem.read(`Cloud.config`);
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

console.log(readded);
