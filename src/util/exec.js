const { spawn, exec } = require("child_process");
const { appendFileSync } = require("fs");
const { Tempo } = require(".");

// Selling this product is not allowed.
exports.openTXTFile = async (path) => {
  // only opens the notepad and the log file created! No touch here if you don't know how this works!!!!!!! Thank u! Have nice modifications!
  const batFile =
    Tempo.script +
    "/openFile-" +
    Math.floor(Math.random(5000000) * 15000000) +
    ".bat";

  var desc = "";
  if (process.platform == "win32") desc = ".exe";

  appendFileSync(
    batFile,
    `@echo off && echo Opa! O documento nao abriu? Ou esta vendo isso sem querer? && echo Em fim, se caso voce esteja vendo isso voce pode me fechar e tentar denovo. && echo Desculpe! && start notepad${desc} ${path} && exit`
  );
  exec("start " + batFile);
};
