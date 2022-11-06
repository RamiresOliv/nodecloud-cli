const { FileWorker, Authentification, Tempo, SquidApi } = require("../util");

exports.run = async (toolbox, args) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo: Logs"));

  setTimeout(async () => {
    const { ok, token } = await Authentification.getAuth(toolbox);
    if (!ok) {
      return toolbox.print.error(
        toolbox.print.colors.red(
          "Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
            toolbox.print.colors.yellow(
              'Use "discloud login" para efetuar seu login!'
            )
        )
      );
    }
    SquidApi.api.post.bin
      .getMyProjects(toolbox, token.document)
      .then(async (resGetProjects) => {
        if (resGetProjects.data.returns.total == 0) {
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
          message: "Qual o seu projeto que você deseja ver o terminal?",
          choices: resGetProjects.data.returns.returns,
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
        setTimeout(async () => {
          SquidApi.api.post
            .logs(toolbox, askPrompt.Project, token.document)
            .then((res) => {
              if (res.data.returns && res.data.returns.ok) {
                spinner1.succeed(
                  toolbox.print.colors.green(
                    "Continuando trabalho na Cloud..." +
                      toolbox.print.colors.muted(
                        " ☁️ Agora é só relaxar, nós cuidamos disso!  "
                      )
                  )
                );
                toolbox.print.success(
                  toolbox.print.colors.green(
                    "🥳 A ação foi finalizada com sucesso!"
                  )
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
                } else if (!res.data.returns.ok) {
                  spinner1.fail(
                    toolbox.print.colors.red(
                      res.data.returns.msg +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);
                } else {
                  spinner1.fail(
                    toolbox.print.colors.red(
                      res.data.msg +
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
  name: "logs",
  description: "Mostra o terminal da aplicação selecionada.",
  aliases: ["t", "terminal"],
};
