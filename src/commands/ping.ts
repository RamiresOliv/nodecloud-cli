import {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} from "../util/index";

exports.run = async (toolbox, args: string[]) => {
  const spinner = toolbox.print.spin("Esperando resposta...");
  const dataOld: Date = new Date();
  const { ok, data } = await NodeCloudApi.api.post.ping(toolbox);
  const dataNew: Date = new Date();

  if (ok) {
    var result = (dataOld.getTime() - dataNew.getTime()) * -1;
    spinner.succeed("🏓 Pong! Latência de " + result + "MS");

    if (args[2] && args[2].toLowerCase() == "--debug") {
      toolbox.print.muted("[DEBUG] HTTP RESPONSE: " + data);
    }

    if (result >= 2500) {
      toolbox.print.warning(
        "Hm. Talvez sua conecção com a Internet não esteja das melhores agora ou a NC-EX-API acabou de ligar! (normal) / resTime >= 2500"
      );
    }
    process.kill(0);
  } else {
    spinner.fail("Falha em tentar receber o ping...");
    toolbox.print.muted(`[DEBUG] HTTP RESPONSE: ${data}`);

    process.kill(0);
  }
};

exports.config = {
  name: "ping",
  description: "Tests the server response.",
};
