"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../util/index");
exports.run = async (toolbox, args) => {
    toolbox.print.info(`Processo: Start ${args[2] ? args[2] : ""}`);
    setTimeout(async () => {
        const { ok, token } = await index_1.Authentification.getAuth(toolbox);
        if (!ok) {
            return toolbox.print.error(toolbox.print.colors.red("Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
                toolbox.print.colors.yellow('Use "nodecloud login" para efetuar seu login!')));
        }
        index_1.NodeCloudApi.api.post.bin
            .getMyProjects(toolbox, token.document)
            .then(async (resGetProjects) => {
            if (!resGetProjects.data) {
                toolbox.print.error(toolbox.print.colors.red("Oops! Parece que aconteceu algum problema em tentar entrar em contato com a API!"));
                process.kill(0);
            }
            if (!resGetProjects.data.ok) {
                toolbox.print.error(toolbox.print.colors.red(resGetProjects.data.msg || resGetProjects.data));
                process.kill(0);
            }
            if (resGetProjects.data.total == 0) {
                toolbox.print.error(toolbox.print.colors.red("Você ainda não tem nenhuma aplicação na Cloud."));
                process.kill(0);
            }
            let projectName = "nome impossivel de ser colocado por culpa dos espaços.";
            if (args[2] == null) {
                const askProjects = {
                    type: "select",
                    name: "Project",
                    message: "Qual o seu projeto que você deseja ser ativado?",
                    choices: resGetProjects.data.returns,
                };
                const askPrompt = await toolbox.prompt.ask([askProjects]);
                projectName = askPrompt.Project;
            }
            else {
                projectName = args[2];
                toolbox.print.success("√ Aplicação: " + toolbox.print.colors.cyan(args[2]));
            }
            const spinner1 = new toolbox.print.spin(toolbox.print.colors.cyan("Continuando trabalho na Cloud..." +
                toolbox.print.colors.muted(" ☁️ Agora é só relaxar, nós cuidamos disso!  ")));
            setTimeout(async () => {
                index_1.NodeCloudApi.api.post
                    .start(toolbox, projectName, token.document)
                    .then((res) => {
                    if (res.data && res.data.ok) {
                        spinner1.succeed(toolbox.print.colors.green("Continuando trabalho na Cloud..." +
                            toolbox.print.colors.muted(" ☁️ Agora é só relaxar, nós cuidamos disso!  ")));
                        toolbox.print.success(toolbox.print.colors.green("🥳 A ação foi finalizada com sucesso!"));
                        process.kill(0);
                    }
                    else {
                        if (res.data.errcode == 500) {
                            spinner1.fail(toolbox.print.colors.red("Ocorreu algum problema com a Cloud!" +
                                toolbox.print.colors.muted(" ☁️ Tente novamente mais tarde! Desculpe :<")));
                            process.kill(0);
                        }
                        else if (!res.data.ok) {
                            spinner1.fail(toolbox.print.colors.red(res.data.msg ||
                                res.data +
                                    toolbox.print.colors.muted(" ☁️ Tente novamente mais tarde! Desculpe :<")));
                            process.kill(0);
                        }
                        else {
                            spinner1.fail(toolbox.print.colors.red(res.data.msg ||
                                res.data +
                                    toolbox.print.colors.muted(" ☁️ Tente novamente mais tarde! Desculpe :<")));
                            process.kill(0);
                        }
                    }
                });
            }, 1200);
        });
    }, 2000);
};
exports.config = {
    name: "start",
    description: "Start remotly a application in Cloud.",
    aliases: ["s", "iniciar"],
};
