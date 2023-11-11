const {
  FileWorker,
  Authentification,
  Tempo,
  SquidApi,
  Exec,
} = require("../util");
const { spawn } = require("child_process");

exports.run = async (toolbox, args) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo: Logs"));

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
    SquidApi.api.post.bin
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
          message: "Qual o seu projeto que você deseja ver o terminal?",
          choices: resGetProjects.data.returns.returns,
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
          SquidApi.api.post
            .logs(toolbox, askPrompt.Project, token.document)
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
                if (
                  (args[2] != null && args[2].toLowerCase() == "--open") ||
                  (args[2] != null && args[2].toLowerCase() == "-open")
                )
                  await Exec.openTXTFile(res.added.txtPath);
                if (res.added.translated.split("\n").length >= 1000) {
                  const confirmation = await toolbox.prompt.confirm(
                    toolbox.print.colors.yellow(
                      'O terminal de "' +
                        askPrompt.Project +
                        '" parece ser muito grande! '
                    ) + "Desejá abrir os logs no seu bloco de notas?",
                    true
                  );
                  if (confirmation) {
                    await Exec.openTXTFile(res.added.txtPath);
                    console.log(
                      toolbox.print.colors.muted(
                        res.added.logPath.replace(`\\`, "/")
                      )
                    );
                  } else {
                    console.log(
                      toolbox.print.colors.muted(
                        askPrompt.Project.toUpperCase() + " LOGS ---------"
                      )
                    );
                    console.log(res.added.translated);
                    console.log(
                      toolbox.print.colors.muted(
                        askPrompt.Project.toUpperCase() + " LOGS END ---------"
                      )
                    );
                  }
                } else {
                  console.log(
                    toolbox.print.colors.muted(
                      askPrompt.Project.toUpperCase() + " LOGS ---------"
                    )
                  );
                  console.log(res.added.translated);
                  console.log(
                    toolbox.print.colors.muted(
                      askPrompt.Project.toUpperCase() + " LOGS END ---------"
                    )
                  );
                }
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
                  /*} else if (!res.data.ok) {
                  spinner1.fail(
                    toolbox.print.colors.red(
                      res.data.returns.msg +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);*/
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
