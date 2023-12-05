import { NodeCloudApi } from "../../util";
export const run = async (toolbox, args: string[]) => {
  const spinner = toolbox.print.spin("Esperando resposta...");
  const dataOld = new Date();
  const { ok, data } = await NodeCloudApi.api.post.ping(toolbox);
  const dataNew = new Date();

  if (ok) {
    const result = (dataOld.getTime() - dataNew.getTime()) * -1;
    spinner.succeed(`🏓 Pong! Latência de ${result}MS`);

    if (args[2] && args[2].toLowerCase() === "--debug") {
      toolbox.print.muted(`[DEBUG] HTTP RESPONSE: ${data}`);
    }

    if (result >= 5000) {
      toolbox.print.warning(
        "Hm. Talvez sua conexão com a Internet não está boa ou o NC-EX-API acabou de ligar! (normal)"
      );
    }

    process.exit(0);
  } else {
    spinner.fail("Falha em tentar receber o ping...");

    if (args[2] && args[2].toLowerCase() === "--debug") {
      toolbox.print.muted(`[DEBUG] HTTP RESPONSE: ${data}`);
    }

    process.exit(0);
  }
};

export const config = {
  name: "ping",
  description: "Tests the server response.",
};
