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
    "Você tem certeza? Se sim, o Token será usado nessa CLI se não, iremos cancelar."
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
      return "success#200$" + res[1];
    } else {
      loading.fail(toolbox.print.colors.red("Falha, " + res[1]));
      return "err-login-http-recused#403$" + res[1];
    }
  } else {
    toolbox.print.error("Finalizado, você cancelou o login.");
    return "err-login-confirm-recused#400";
  }
};

exports.config = {
  name: "login",
  description: "Uses a API Token for executes commands in CLI.",
};
