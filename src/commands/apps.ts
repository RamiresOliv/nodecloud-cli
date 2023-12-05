import {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} from "../util/index";

exports.run = async (toolbox, args: string[]) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo: AppsInfo"));

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
        toolbox.print.highlight("Suas aplicações:");
        toolbox.print.muted("(Isso pode demorar um pouco..)");
        toolbox.print.muted("");
        var totalofRuns = 0;
        setTimeout(async () => {
          const spinner1 = new toolbox.print.spin(
            toolbox.print.colors.cyan(
              "Continuando trabalho na Cloud..." +
                toolbox.print.colors.muted(
                  " ☁️ Agora é só relaxar, nós cuidamos disso!  "
                )
            )
          );
          resGetProjects.data.returns.forEach((value) => {
            NodeCloudApi.api.post.bin
              .getProjectInfo(toolbox, value, token.document)
              .then(async (res) => {
                if (!res || res.data.ok) {
                  let line = "";
                  line += toolbox.print.colors.cyan(value + ":") + "\n";
                  let status = toolbox.print.colors.red("OFFLINE");
                  if (
                    res.data.return.projectInfos.status
                      .toLowerCase()
                      .includes("online")
                  )
                    status = toolbox.print.colors.green("ONLINE");
                  line += status;
                  line += ` | Tamanho: ${toolbox.print.colors.muted(
                    `"` + res.data.return.projectInfos.size + `"`
                  )}`;
                  spinner1.succeed(
                    toolbox.print.colors.green(
                      "Continuando trabalho na Cloud..." +
                        toolbox.print.colors.muted(
                          " ☁️ Agora é só relaxar, nós cuidamos disso!  "
                        )
                    )
                  );

                  toolbox.print.info("-".repeat(100));
                  toolbox.print.info(line + "\n" + "-".repeat(100));
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

                totalofRuns += 1;
                if (totalofRuns == resGetProjects.data.returns.length) {
                  toolbox.print.muted("");
                  toolbox.print.muted(
                    "Mais informações sobre as aplicações podem ser vistas aqui quando ligadas!"
                  );
                  toolbox.print.muted(
                    "Se deseja ver mais informações sobre uma aplicação use " +
                      toolbox.print.colors.yellow("nodecloud") +
                      " app"
                  );
                }
              });
          });
        }, 1200);
      });
  }, 2000);
};

exports.config = {
  name: "apps",
  description: "Show informations about all your saved apps in the Cloud.",
  aliases: ["as", "appsinfo", "showapps"],
};
