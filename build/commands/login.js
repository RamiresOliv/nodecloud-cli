"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.run = void 0;
const index_1 = require("../util/index");
const run = async (toolbox, args) => {
    const pingReturn = await index_1.NodeCloudApi.api.post.ping(toolbox);
    if (!pingReturn.ok) {
        toolbox.print.error(`Não foi possivel identificar o servidor, talvez seu baseUrl esteja invalido! Use ${toolbox.print.colors.yellow("nodecloud api")} para mudar a url da api.`);
        process.kill(0);
    }
    const { token } = await toolbox.prompt.ask([
        {
            type: "password",
            name: "token",
            message: toolbox.print.colors.green("Olá bem vindo(a)!") +
                " Para efetuar login porfavor identifique seu API Token!",
        },
    ]);
    const confirmation = await toolbox.prompt.confirm("Você tem certeza que você gostaria de conectar a nodecloud com esse token?", true);
    if (confirmation) {
        const loading = toolbox.print.spin("Porfavor espere estamos agora identificando você e seu token...");
        const res = await index_1.Authentification.registerNewToken(toolbox, token);
        if (res[0]) {
            loading.succeed(toolbox.print.colors.green("🥳 Parabéns! Agora sua conta está vinculada com essa CLI! Os comandos agora estarão disponiveis!"));
            //toolbox.print.info(toolbox.print.colors.green("Conta: "));
            process.kill(0);
        }
        else {
            loading.fail(toolbox.print.colors.red("Falha, " + res[1]));
            process.kill(0);
        }
    }
    else {
        toolbox.print.error("Finalizado, você cancelou o login.");
        process.kill(0);
    }
};
exports.run = run;
exports.config = {
    name: "login",
    description: "Uses a API Token for executes commands in CLI.",
    aliases: ["l", "tk", "token", "connect"],
};
