const { FileWorker, Authentification, Tempo, SquidApi } = require("../util");

exports.run = async (toolbox, args) => {
  toolbox.print.info(toolbox.print.colors.dim("Processo: Upload"));
  const spinner1 = new toolbox.print.spin(
    toolbox.print.colors.cyan("Começando...")
  );
  const spinner2 = new toolbox.print.spin(
    toolbox.print.colors.cyan(
      "Compactando arquivos..." +
        toolbox.print.colors.muted(" 📦 Empacotando arquivos.")
    )
  );
  spinner2.stop();
  const spinner3 = new toolbox.print.spin(
    toolbox.print.colors.cyan(
      "Continuando trabalho na Cloud..." +
        toolbox.print.colors.muted(
          " ☁️ Agora é só relaxar, nós cuidamos disso!  "
        )
    )
  );
  spinner3.stop();
  spinner1.color = "yellow";
  setTimeout(async () => {
    spinner1.color = "cyan";
    const { ok, token } = await Authentification.getAuth(toolbox);
    if (!ok) {
      spinner1.fail(
        toolbox.print.colors.red(
          "Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
            toolbox.print.colors.yellow(
              'Use "discloud login" para efetuar seu login!'
            )
        )
      );
      process.kill(0);
    }
    spinner1.text = toolbox.print.colors.cyan(
      "Checando arquivos..." +
        toolbox.print.colors.muted(" 🔎 Pre-ordem se tudo está ok.")
    );
    const response = await FileWorker.checkRequiredFiles(toolbox, args[0]);
    if (!response[0] && response[1] == 500) {
      spinner1.fail(
        toolbox.print.colors.red(
          "Falha, ocorreu um erro ao tentar ler o arquivo de configuração! Verifique se o arquivo está corretamente escrito!"
        )
      );
      process.kill(0);
    } else if (!response[0] && response[1] == 400) {
      spinner1.fail(
        toolbox.print.colors.red(
          "Falha, algum valor do arquivo de configuração está invalido, porfavor verifique!"
        )
      );
      process.kill(0);
    } else if (!response[0] && response[1] == 404) {
      spinner1.fail(
        toolbox.print.colors.red(
          "Falha, o arquivo " +
            toolbox.print.colors.yellow('"' + response[2] + '"') +
            " não existe ou não foi achado, para continuar porfavor crie o arquivo que é pedido."
        )
      );
      process.kill(0);
    }
    setTimeout(async () => {
      spinner1.succeed(
        toolbox.print.colors.green(
          "Checando arquivos..." +
            toolbox.print.colors.muted(" 🔎 Pre-ordem se tudo está ok.")
        )
      );
      spinner2.start();

      const checkin = await FileWorker.readConfigFile(toolbox, args[0]);
      const zipR = await FileWorker.createProjectZipFile(
        toolbox,
        args[0],
        Tempo.upload,
        checkin[2].NAME
      );

      zipR.Filer.on("close", async () => {
        spinner2.succeed(
          toolbox.print.colors.green(
            "Compactando arquivos..." +
              toolbox.print.colors.muted(" 📦 Empacotando arquivos.")
          )
        );
        var sended = false;
        spinner3.start();
        if (!sended) {
          sended = true;
          SquidApi.api.post
            .up(toolbox, zipR.filePath, zipR.fileName, token.document)
            .then((res) => {
              if (res.data.returns && res.data.returns.ok) {
                spinner3.succeed(
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
                  spinner3.fail(
                    toolbox.print.colors.red(
                      "Ocorreu algum problema com a Cloud!" +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);
                } else if (!res.data.returns.ok) {
                  spinner3.fail(
                    toolbox.print.colors.red(
                      res.data.returns.msg +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                    )
                  );
                  process.kill(0);
                } else {
                  spinner3.fail(
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
        }
      });
    }, 2000);
  }, 2000);
};

exports.config = {
  name: "upload",
  description: "Executes a remote up request to the Cloud.",
  aliases: ["u", "up"],
};
