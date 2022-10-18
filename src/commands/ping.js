const { SquidApi } = require("../util");

exports.run = async (toolbox, args) => {
  const spinner = toolbox.print.spin("Esperando resposta...");
  const dataOld = new Date();
  const { ok, data } = await SquidApi.api.post.ping(toolbox);
  const dataNew = new Date();

  if (ok) {
    var result = (dataOld - dataNew) * -1;
    spinner.succeed("🏓 Pong! Latência de " + result + "MS");
    if (args[2] == "--debug") {
      toolbox.print.muted("[DEBUG] HTTP RESPONSE: " + data);
    }
    process.kill(0);
    if (result >= 1000) {
      toolbox.print.warning(
        "Bem... Parece que o ping está meio alto... Verifique sua internet. Se caso não for isso pedimos desculpas."
      );
    }
  } else {
    spinner.fail("Falha em tentar receber o ping...");
    process.kill(0);
  }
};

exports.config = {
  name: "ping",
  description:
    "Send a test request to the server and returns the ping of the Request.",
};
