const { FileWorker, Authentification, Tempo, SquidApi } = require("../util");

exports.run = async (toolbox, args) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo: Delete"));

  setTimeout(async () => {
    const { ok, token } = await Authentification.getAuth(toolbox);
    if (!ok) {
      return toolbox.print.error(
        toolbox.print.colors.red(
          "Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
            toolbox.print.colors.yellow(
              'Use "squidcloud login" para efetuar seu login!'
            )
        )
      );
    }
    SquidApi.api.post.bin
      .getMyProjects(toolbox, token.document)
      .then(async (resGetProjects) => {
        if (!resGetProjects.data.ok) {
          toolbox.print.error(
            toolbox.print.colors.red(resGetProjects.data.msg)
          );
          process.kill(0);
        }
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
          message:
            "Qual o seu projeto que você deseja que sejá removido da Cloud?",
          choices: resGetProjects.data.returns.returns,
        };
        const askPrompt = await toolbox.prompt.ask([askProjects]);

        const confirmation = await toolbox.prompt.confirm(
          "Você tem certeza que quer remover " +
            askPrompt.Project +
            " da Cloud??",
          false
        );

        if (!confirmation) {
          toolbox.print.error("Finalizado, você cancelou o delete request.");
          process.kill(0);
        }

        const { appName } = await toolbox.prompt.ask([
          {
            type: "input",
            name: "appName",
            message:
              "Porfavor antes de continuar digite o nome da aplicação... " +
              toolbox.print.colors.muted("(" + askPrompt.Project + ")") +
              ".",
          },
        ]);

        if (appName != askPrompt.Project) {
          toolbox.print.error("Finalizado, nome da aplicação incorreto.");
          process.kill(0);
        }

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
            .delete(toolbox, askPrompt.Project, token.document)
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
                    "😢 Finalizado, sucesso em deletar a aplicação! Mas speramos você denovo! Adeus " +
                      askPrompt.Project +
                      " 👋"
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
  name: "delete",
  description: "Delete a application remotly in the Cloud.",
  aliases: ["d", "del", "deletar"],
};
