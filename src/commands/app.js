const {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} = require("../util");

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

exports.run = async (toolbox, args) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo: AppInfo"));

  setTimeout(async () => {
    const { ok, token } = await Authentification.getAuth(toolbox);
    if (!ok) {
      return toolbox.print.error(
        toolbox.print.colors.red(
          "Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
            toolbox.print.colors.yellow(
              'Use "nodecloud login" para efetuar seu login!'
            )
        )
      );
    }
    NodeCloudApi.api.post.bin
      .getMyProjects(toolbox, token.document)
      .then(async (resGetProjects) => {
        if (!resGetProjects.data) {
          toolbox.print.error(
            toolbox.print.colors.red(
              "Oops! Parece que aconteceu algum problema em tentar entrar em contato com a API!"
            )
          );
          process.kill(0);
        }
        console.log(resGetProjects.data);
        if (!resGetProjects.data.ok) {
          toolbox.print.error(
            toolbox.print.colors.red(resGetProjects.data.message)
          );
          process.kill(0);
        }
        if (resGetProjects.data.total == 0) {
          toolbox.print.error(
            toolbox.print.colors.red(
              "Você ainda não tem nenhuma aplicação na Cloud."
            )
          );
          process.kill(0);
        }
        const askProjects = {
          type: "select",
          name: "Project",
          message: "Qual o seu projeto que você deseja ver as informações?",
          choices: resGetProjects.data.returns,
        };
        const askPrompt = await toolbox.prompt.ask([askProjects]);

        const spinner1 = new toolbox.print.spin(
          toolbox.print.colors.cyan(
            "Continuando trabalho na Cloud..." +
              toolbox.print.colors.muted(
                " ☁️ Agora é só relaxar, nós cuidamos disso!"
              )
          )
        );
        setTimeout(async () => {
          NodeCloudApi.api.post.bin
            .getProjectInfo(toolbox, askPrompt.Project, token.document)
            .then(async (res) => {
              if (res.data.ok) {
                spinner1.succeed(
                  toolbox.print.colors.green(
                    "Continuando trabalho na Cloud..." +
                      toolbox.print.colors.muted(
                        " ☁️ Agora é só relaxar, nós cuidamos disso!"
                      )
                  )
                );
                toolbox.print.success(
                  toolbox.print.colors.green(
                    "🥳 A ação foi finalizada com sucesso!"
                  )
                );
                toolbox.print.highlight(askPrompt.Project + ":");
                if (res.data.return.projectInfos.description == "") {
                  res.data.return.projectInfos.description = "Sem descrição";
                }
                toolbox.print.muted(res.data.return.projectInfos.description);
                toolbox.print.muted(" ");
                toolbox.print.info(
                  `Container: ${toolbox.print.colors.muted(
                    `"` + "Próprio" + `"`
                  )}`
                );
                let status = toolbox.print.colors.red("offline");
                if (
                  res.data.return.projectInfos.status
                    .toLowerCase()
                    .includes("online")
                )
                  status = toolbox.print.colors.green("online");
                toolbox.print.info(`Status: ${status}`);
                toolbox.print.info(
                  `Starter: ${toolbox.print.colors.muted(
                    `"` + res.data.return.configFile.START + `"`
                  )}`
                );
                toolbox.print.info(
                  `Linguagem: ${toolbox.print.colors.muted(
                    `"` + "Node.js" + `"`
                  )}`
                );
                let msg = "Não.";
                if (res.data.return.projectInfos.haveDiscordJS != false)
                  msg = res.data.return.projectInfos.haveDiscordJS;
                toolbox.print.info(
                  `Discord Bot: ${toolbox.print.colors.muted(`"` + msg + `"`)}`
                );
                toolbox.print.info(
                  `Tamanho: ${toolbox.print.colors.muted(
                    `"` + res.data.return.projectInfos.size + `"`
                  )}`
                );

                process.kill(0);
              } else {
                if (res.data.errcode == 500) {
                  spinner1.fail(
                    toolbox.print.colors.red(
                      "Ocorreu algum problema com a Cloud!" +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);
                } else {
                  spinner1.fail(
                    toolbox.print.colors.red(
                      res.data.message +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);
                }
              }
            });
        }, 1200);
      });
  }, 2000);
};

exports.config = {
  name: "app",
  description: "Show informations about a selected saved app in the Cloud.",
  aliases: ["ap", "appinfo", "showapp"],
};
