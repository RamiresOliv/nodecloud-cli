"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../util/index");
exports.run = async (toolbox, args) => {
    const spinner = toolbox.print.spin("Esperando resposta...");
    const dataOld = new Date();
    const { ok, data } = await index_1.NodeCloudApi.api.post.ping(toolbox);
    const dataNew = new Date();
    if (ok) {
        var result = (dataOld.getTime() - dataNew.getTime()) * -1;
        spinner.succeed("🏓 Pong! Latência de " + result + "MS");
        if (args[2] && args[2].toLowerCase() == "--debug") {
            toolbox.print.muted("[DEBUG] HTTP RESPONSE: " + data);
        }
        if (result >= 5000) {
            toolbox.print.warning("Hm. Talvez sua conecção com a Internet não está boa ou o NC-EX-API acabou de ligar! (normal)");
        }
        process.kill(0);
    }
    else {
        spinner.fail("Falha em tentar receber o ping...");
        if (args[2] && args[2].toLowerCase() == "--debug") {
            toolbox.print.muted("[DEBUG] HTTP RESPONSE: " + data);
        }
        process.kill(0);
    }
};
exports.config = {
    name: "ping",
    description: "Tests the server response.",
};
