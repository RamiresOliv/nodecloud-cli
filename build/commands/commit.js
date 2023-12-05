"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../util/index");
exports.run = async (toolbox, args) => {
    toolbox.print.info(toolbox.print.colors.dim("Processo: Commit"));
    toolbox.print.info(toolbox.print.colors.cyan("Começando..."));
    const { ok, token } = await index_1.Authentification.getAuth(toolbox);
    if (!ok) {
        toolbox.print.error(toolbox.print.colors.red("Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
            toolbox.print.colors.yellow('Use "nodecloud login" para efetuar seu login!')));
        process.kill(0);
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
        const askProjects = {
            type: "select",
            name: "Project",
            message: "Qual o seu projeto que você deseja efetuar um commit?",
            choices: resGetProjects.data.returns,
        };
        const askPrompt = await toolbox.prompt.ask([askProjects]);
        const e = await index_1.FileWorker.readConfigFile(toolbox, args[0]);
        if (e[0] == false) {
            toolbox.print.warning("⚠️ O arquivo de configuração da sua aplicação está invalida, não foi possivel ler o arquivo. Verifique por erros e tente novamente!");
            process.kill(0);
        }
        if (e.data[0] && e.return.IGNOREDS[0])
            toolbox.print.warning("⚠️ Atenção os arquivos que estão no Ignoreds são: [" +
                e.return.IGNOREDS.toString() +
                "]");
        const spinner1 = new toolbox.print.spin(toolbox.print.colors.cyan("Começando..."));
        const spinner2 = new toolbox.print.spin(toolbox.print.colors.cyan("Compactando arquivos..." +
            toolbox.print.colors.muted(" 📦 Empacotando arquivos.")));
        spinner2.stop();
        const spinner3 = new toolbox.print.spin(toolbox.print.colors.cyan("Continuando trabalho na Cloud..." +
            toolbox.print.colors.muted(" ☁️ Agora é só relaxar, nós cuidamos disso!  ")));
        spinner3.stop();
        spinner1.color = "yellow";
        setTimeout(async () => {
            spinner1.color = "cyan";
            spinner1.text = toolbox.print.colors.cyan("Checando arquivos..." +
                toolbox.print.colors.muted(" 🔎 Pre-ordem se tudo está ok."));
            const response = await index_1.FileWorker.checkRequiredFiles(toolbox, args[0]);
            if (!response[0] && response[1] == 500) {
                spinner1.fail(toolbox.print.colors.red("Falha, ocorreu um erro ao tentar ler o arquivo de configuração! Verifique se o arquivo está corretamente escrito!"));
                process.kill(0);
            }
            else if (!response[0] && response[1] == 400) {
                spinner1.fail(toolbox.print.colors.red("Falha, algum valor do arquivo de configuração está invalido, porfavor verifique!"));
                process.kill(0);
            }
            else if (!response[0] && response[1] == 404) {
                var msg = "Falha, algum valor do arquivo de configuração está invalido, porfavor verifique! ";
                if (response[2])
                    msg += "TIP: " + response[2];
                spinner1.fail(toolbox.print.colors.red(msg));
                process.kill(0);
            }
            setTimeout(async () => {
                spinner1.succeed(toolbox.print.colors.green("Checando arquivos..." +
                    toolbox.print.colors.muted(" 🔎 Pre-ordem se tudo está ok.")));
                spinner2.start();
                const checkin = await index_1.FileWorker.readConfigFile(toolbox, args[0]);
                if (checkin[0] == false) {
                    toolbox.print.warning("⚠️ O arquivo de configuração da sua aplicação está invalida, não foi possivel ler o arquivo. Verifique por erros e tente novamente!");
                    process.kill(0);
                }
                const zipR = await index_1.FileWorker.createProjectZipFile(toolbox, args[0], index_1.Tempo.upload, checkin.return.NAME);
                zipR.Filer.on("close", async () => {
                    spinner2.succeed(toolbox.print.colors.green("Compactando arquivos..." +
                        toolbox.print.colors.muted(" 📦 Empacotando arquivos.")));
                    spinner3.start();
                    index_1.NodeCloudApi.api.post
                        .commit(toolbox, zipR.filePath, zipR.fileName, askPrompt.Project, token.document)
                        .then((res) => {
                        if (res.data && res.data.ok) {
                            spinner3.succeed(toolbox.print.colors.green("Continuando trabalho na Cloud..." +
                                toolbox.print.colors.muted(" ☁️ Agora é só relaxar, nós cuidamos disso!  ")));
                            toolbox.print.success(toolbox.print.colors.green("🥳 A ação foi finalizada com sucesso!"));
                            process.kill(0);
                        }
                        else {
                            if (res.data.errcode == 500) {
                                spinner3.fail(toolbox.print.colors.red("Ocorreu algum problema com a Cloud!" +
                                    toolbox.print.colors.muted(" ☁️ Tente novamente mais tarde! Desculpe :<")));
                                process.kill(0);
                            }
                            else if (!res.data.ok) {
                                spinner3.fail(toolbox.print.colors.red(res.data.msg ||
                                    res.data +
                                        toolbox.print.colors.muted(" ☁️ Tente novamente mais tarde! Desculpe :<")));
                                process.kill(0);
                            }
                            else {
                                spinner3.fail(toolbox.print.colors.red(res.data.msg ||
                                    res.data +
                                        toolbox.print.colors.muted(" ☁️ Tente novamente mais tarde! Desculpe :<")));
                                process.kill(0);
                            }
                        }
                    });
                });
            }, 2000);
        }, 2000);
    });
};
exports.config = {
    name: "commit",
    description: "Executes a remote commit request to the Cloud.",
    aliases: ["c", "commitar"],
};
