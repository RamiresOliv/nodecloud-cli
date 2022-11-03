const { FileWorker, Authentification, Temp, SquidApi } = require("../util");

exports.run = async (toolbox, args) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo Start"));

  const spinner3 = new toolbox.print.spin(
    toolbox.print.colors.cyan(
      "Continuando trabalho na Cloud..." +
        toolbox.print.colors.muted(
          " ☁️  Agora é só relaxar, nós cuidamos disso!  "
        )
    )
  );
  spinner3.stop();
  setTimeout(async () => {
    spinner3.start();
    SquidApi.api.post
      .start(toolbox, zipR.filePath, zipR.fileName, token.document)
      .then((res) => {
        if (res.data.ok && res.data.returns && res.data.returns.ok) {
          spinner3.succeed(
            toolbox.print.colors.green(
              "Continuando trabalho na Cloud..." +
                toolbox.print.colors.muted(
                  " ☁️  Agora é só relaxar, nós cuidamos disso!  "
                )
            )
          );
        } else {
          if (res.data.errcode == 500) {
            spinner3.fail(
              toolbox.print.colors.red(
                "Ocorreu algum problema com a Cloud!" +
                  toolbox.print.colors.muted(
                    " ☁️  Tente novamente mais tarde! Desculpe :<"
                  )
              )
            );
          } else if (!res.data.returns.ok) {
            spinner3.fail(
              toolbox.print.colors.red(
                res.data.returns.msg +
                  toolbox.print.colors.muted(
                    " ☁️  Tente novamente mais tarde! Desculpe :<"
                  )
              )
            );
          } else {
            spinner3.fail(
              toolbox.print.colors.red(
                res.data.msg +
                  toolbox.print.colors.muted(
                    " ☁️ Tente novamente mais tarde! Desculpe :<"
                  )
              )
            );
          }
        }
      });
  }, 2000);
};

exports.config = {
  name: "start",
  description: "Start remotly a application in Cloud.",
  aliases: ["i", "iniciar"],
};
