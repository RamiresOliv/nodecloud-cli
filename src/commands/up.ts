import {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} from "../util/index";

export const run = async (toolbox: any, args: string[]) => {
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
  spinner1.color = "cyan";
  const { ok, token } = await Authentification.getAuth(toolbox);
  if (!ok) {
    spinner1.fail(
      toolbox.print.colors.red(
        "Falha , [NÃO AUTORIZADO] Você precisa fazer login com seu API Token. " +
          toolbox.print.colors.yellow(
            'Use "nodecloud login" para efetuar seu login!'
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
    let msg =
      "Falha, algum valor do arquivo de configuração está invalido, porfavor verifique! ";

    if (response[2]) msg += "TIP: " + response[2];

    spinner1.fail(toolbox.print.colors.red(msg));
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
    if (checkin[0] == false) {
      toolbox.print.warning(
        "⚠️ O arquivo de configuração da sua aplicação está invalida, não foi possivel ler o arquivo. Verifique por erros e tente novamente!"
      );
      process.kill(0);
    }

    const zipR = await FileWorker.createProjectZipFile(
      toolbox,
      args[0],
      Tempo.upload,
      checkin.return.NAME
    );

    zipR.Filer.on("close", async () => {
      spinner2.succeed(
        toolbox.print.colors.green(
          "Compactando arquivos..." +
            toolbox.print.colors.muted(" 📦 Empacotando arquivos.")
        )
      );
      let sended = false;
      spinner3.start();
      if (!sended) {
        sended = true;
        NodeCloudApi.api.post
          .up(toolbox, zipR.filePath, zipR.fileName, token.document)
          .then((res: any) => {
            if (res.data && res.data.ok) {
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
              } else if (!res.data.ok) {
                spinner3.fail(
                  toolbox.print.colors.red(
                    res.data.msg ||
                      res.data +
                        toolbox.print.colors.muted(
                          " ☁️ Tente novamente mais tarde! Desculpe :<"
                        )
                  )
                );
                process.kill(0);
              } else {
                spinner3.fail(
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
      }
    });
  }, 2000);
};

export const config = {
  name: "upload",
  description: "Executes a remote up request to the Cloud.",
  aliases: ["u", "up"],
};
