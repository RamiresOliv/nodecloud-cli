const {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} = require("../util");

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
        if (!resGetProjects.data.ok) {
          toolbox.print.error(
            toolbox.print.colors.red(
              resGetProjects.data.msg || resGetProjects.data
            )
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
          message: "Qual o seu projeto que você deseja efetuar um commit?",
          choices: resGetProjects.data.returns,
        };
        const askPrompt = await toolbox.prompt.ask([askProjects]);

        const spinner1 = new toolbox.print.spin(
          toolbox.print.colors.cyan(
            "Continuando trabalho na Cloud..." +
              toolbox.print.colors.muted(
                " ☁️ Agora é só relaxar, nós cuidamos disso!  "
              )
          )
        );
        NodeCloudApi.api.post.bin
          .getProjectInfo(toolbox, askPrompt.Project, token.document)
          .then(async (res) => {
            if (!res || res.data.ok) {
              spinner1.succeed(
                toolbox.print.colors.green(
                  "Continuando trabalho na Cloud..." +
                    toolbox.print.colors.muted(
                      " ☁️ Agora é só relaxar, nós cuidamos disso!  "
                    )
                )
              );
              toolbox.print.info("-".repeat(100));
              toolbox.print.highlight(`${askPrompt.Project}:`);
              toolbox.print.info(
                toolbox.print.colors.muted(
                  res.data.return.projectInfos.description || "Cool App"
                )
              );
              let status = toolbox.print.colors.red("OFFLINE");
              if (
                res.data.return.projectInfos.status
                  .toLowerCase()
                  .includes("online")
              )
                status = toolbox.print.colors.green("ONLINE");
              toolbox.print.info("Stado: " + status);
              toolbox.print.info(
                "Linguagem: " +
                  toolbox.print.colors.muted(
                    res.data.return.configFile.LANGUAGE
                  )
              );
              toolbox.print.info(
                "Versão: " +
                  toolbox.print.colors.muted(
                    "v" + res.data.return.configFile.VERSION
                  )
              );
              toolbox.print.info(
                "Starter: " +
                  toolbox.print.colors.muted(res.data.return.configFile.START)
              );

              toolbox.print.info(
                "Tamanho: " +
                  toolbox.print.colors.muted(
                    `${res.data.return.projectInfos.size}`
                  )
              );

              toolbox.print.info(
                toolbox.print.colors.muted(
                  "Algumas dessas informações foram pegas do Docker e o arquivo 'cloud.config'"
                )
              );
              toolbox.print.info("-".repeat(100));
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
      });
  }, 2000);
};

exports.config = {
  name: "app",
  description: "Show informations about an specific app.",
  aliases: ["a", "appinfo", "inspect"],
};
