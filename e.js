let ejs = require("ejs");
const { readFileSync, writeFileSync } = require("fs");

let result = ejs.render(readFileSync("Cloud.config.ejs", "utf8"), {
  Name: "Olá",
  Id: "123",
  Starter: "app.js",
  Ignoreds: "[]",
});

writeFileSync("Cloud.config", result);
