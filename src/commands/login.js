const { Authentification } = require("../util");

exports.run = async (toolbox, args) => {
  const { token } = await toolbox.prompt.ask([
    {
      type: "password",
      name: "token",
      message:
        toolbox.print.colors.green("Olá bem vindo(a)!") +
        " Para efetuar login porfavor identifique seu API Token!",
    },
  ]);
  const confirmation = await toolbox.prompt.confirm(
    "Você tem que quer se conectar a nodecloud com esse token?",
    true
  );

  if (confirmation) {
    const loading = toolbox.print.spin(
      "Porfavor espere estamos autentificando seu token..."
    );
    const res = await Authentification.registerNewToken(toolbox, token);
    if (res[0]) {
      loading.succeed(
        toolbox.print.colors.green(
          "🥳 Parabéns! Agora sua conta está vinculada com essa CLI! Os comandos agora estarão disponiveis!"
        )
      );
      process.kill(0);
    } else {
      loading.fail(toolbox.print.colors.red("Falha, " + res[1]));
      process.kill(0);
    }
  } else {
    toolbox.print.error("Finalizado, você cancelou o login.");
    process.kill(0);
  }
};

exports.config = {
  name: "login",
  description: "Uses a API Token for executes commands in CLI.",
};
