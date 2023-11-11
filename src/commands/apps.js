const {
  FileWorker,
  Authentification,
  Tempo,
  SquidApi,
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
        toolbox.print.highlight("Suas aplicações:");
        toolbox.print.muted("");
        totalofRuns = 0;
        setTimeout(async () => {
          toolbox.print.info("-".repeat(100));
          resGetProjects.data.returns.returns.forEach((value) => {
            SquidApi.api.post.bin
              .getProjectInfo(toolbox, value, token.document)
              .then(async (res) => {
                if (res.data.ok) {
                  let line = "";
                  line += toolbox.print.colors.cyan(value + ":") + "\n";
                  let status = toolbox.print.colors.red("OFFLINE");
                  if (
                    res.data.return.returns.projectInfos.status
                      .toLowerCase()
                      .includes("online")
                  )
                    status = toolbox.print.colors.green("ONLINE");
                  line += status;
                  line += ` | Tamanho: ${toolbox.print.colors.muted(
                    `"` + res.data.return.returns.projectInfos.size + `"`
                  )}`;
                  const pid = res.data.return.returns.projectInfos.pidGets;
                  if (pid) {
                    line += ` | Memória: ${toolbox.print.colors.muted(
                      `"` + formatBytes(pid.memory) + `"`
                    )}`;
                    line += ` | Tempo ligado: ${toolbox.print.colors.muted(
                      `"` + pid.elapsed + `"`
                    )}`;
                  }

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
                        res.data.msg +
                          toolbox.print.colors.muted(
                            " ☁️ Tente novamente mais tarde! Desculpe :<"
                          )
                      )
                    );
                    process.kill(0);
                  }
                }

                totalofRuns += 1;
                if (totalofRuns == resGetProjects.data.returns.returns.length) {
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
