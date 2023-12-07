import {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} from "../util/index";
import { exec } from "child_process";

async function tooBig(
  toolbox: any,
  askPrompt: any,
  res: any,
  needAsk: boolean
) {
  let confirmation = true;
  if (needAsk) {
    confirmation = await toolbox.prompt.confirm(
      toolbox.print.colors.yellow(
        'O terminal de "' +
          askPrompt.Project +
          '" parece ser muito grande! (>= 1000)'
      ) + " Desejá abrir os logs no seu bloco de notas?",
      true
    );
  }
  if (confirmation) {
    let type = "open " + res.added.txtPath;
    if (process.platform == "win32") {
      type = "c:\\windows\\notepad.exe " + res.added.txtPath;
    }

    const a: any = exec(type);

    a.stdout.on("data", (a: string) => {
      console.log(a);
    });
    a.on("close", (a: string) => {
      process.kill(0);
    });
    console.log(
      toolbox.print.colors.muted(res.added.logPath.replace(`\\`, "/"))
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
    process.kill(0);
  }
}

export const run = async (toolbox: any, args: string[]) => {
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
    NodeCloudApi.api.post.bin
      .getMyProjects(toolbox, token.document)
      .then(async (resGetProjects: any) => {
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
          message: "Qual o seu projeto que você deseja ver o terminal?",
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
          NodeCloudApi.api.post
            .logs(toolbox, askPrompt.Project, token.document)
            .then(async (res: any) => {
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
                ) {
                  await tooBig(toolbox, askPrompt, res, false);
                } else if (res.added.translated.split("\n").length >= 1000) {
                  await tooBig(toolbox, askPrompt, res, true);
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
                  process.kill(0);
                }
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
                      res.data.message +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);*/
                } else {
                  spinner1.fail(
                    toolbox.print.colors.red(
                      res.data.msg ||
                        res.data +
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

export const config = {
  name: "logs",
  description: "Mostra o terminal da aplicação selecionada.",
  aliases: ["t", "terminal"],
};
