const { Authentification } = require("../util");
const database = require("local-db-express");

exports.run = async (toolbox, args) => {
  database.collection.create("ApiBaseUrl");
  if (
    (args[2] != null && args[2].toLowerCase() == "-rm") ||
    (args[2] != null && args[2].toLowerCase() == "-remove") ||
    (args[2] != null && args[2].toLowerCase() == "-default") ||
    (args[2] != null && args[2].toLowerCase() == "--rm") ||
    (args[2] != null && args[2].toLowerCase() == "--remove") ||
    (args[2] != null && args[2].toLowerCase() == "--default")
  ) {
    await database.document.delete("ApiBaseUrl", "Current");
    toolbox.print.info("Cleared API baseUrl. And backed to default.");
  }
  var { baseurl } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "baseurl",
      message: "Porfavor digite aqui o novo baseURL da API da nodecloud",
    },
  ]);
  if (baseurl.startsWith("http://") || baseurl.startsWith("https://")) {
    const existence = await database.document.exists("ApiBaseUrl", "Current");
    if (existence) {
      await database.document.update("ApiBaseUrl", "Current", () => {
        return baseurl;
      });
    } else {
      await database.document.add("ApiBaseUrl", "Current", baseurl);
    }
    toolbox.print.info("Added new API baseUrl!");
  } else {
    toolbox.print.error(
      "O URL da API precisa ser um URL Válido! com https! Ex: 'https://github.com'/'http://localhost:25565'"
    );
    process.exit(0);
  }
};

exports.config = {
  name: "api",
  description: "Changes the API baseURL.",
  aliases: ["https", "baseurl"],
};
