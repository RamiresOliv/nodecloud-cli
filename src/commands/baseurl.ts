import {
  FileWorker,
  Authentification,
  Tempo,
  NodeCloudApi,
  Exec,
} from "../util";
import * as apiSettings from "../util/api/default.json";
import * as Database from "../util/database";

exports.run = async (toolbox, args: string[]) => {
  Database.collection.create("ApiBaseUrl");
  if (
    (args[2] != null && args[2].toLowerCase() == "-rm") ||
    (args[2] != null && args[2].toLowerCase() == "-remove") ||
    (args[2] != null && args[2].toLowerCase() == "-default") ||
    (args[2] != null && args[2].toLowerCase() == "--rm") ||
    (args[2] != null && args[2].toLowerCase() == "--remove") ||
    (args[2] != null && args[2].toLowerCase() == "--default") ||
    (args[2] != null && args[2].toLowerCase() == "rm") ||
    (args[2] != null && args[2].toLowerCase() == "remove") ||
    (args[2] != null && args[2].toLowerCase() == "default") ||
    (args[2] != null && args[2].toLowerCase() == "rm") ||
    (args[2] != null && args[2].toLowerCase() == "remove") ||
    (args[2] != null && args[2].toLowerCase() == "default")
  ) {
    const baseurlrm = await Database.document.delete("ApiBaseUrl", "Current");
    if (baseurlrm.success) {
      toolbox.print.info("Cleared API baseUrl. And backed to default.");
      toolbox.print.info(
        toolbox.print.colors.green(
          `BaseUrl removida, agora a BaseUrl será "${apiSettings.apiDefault}" como padrão`
        )
      );
    } else {
      toolbox.print.error(
        toolbox.print.colors.red(
          `BaseUrl já esta no URL padrão "${apiSettings.apiDefault}"`
        )
      );
    }
    process.exit(0);
  } else if (
    (args[2] != null && args[2].toLowerCase() == "--read") ||
    (args[2] != null && args[2].toLowerCase() == "-read") ||
    (args[2] != null && args[2].toLowerCase() == "read")
  ) {
    const baseurlget = await Database.document.get("ApiBaseUrl", "Current");
    if (baseurlget.success) {
      toolbox.print.info(
        toolbox.print.colors.green(
          `Current BaseUrl is: "${baseurlget.document}"`
        )
      );
    } else {
      toolbox.print.info(
        toolbox.print.colors.yellow(
          `Nenhuma BaseUrl foi definida! Então estou usando a padrão: "${apiSettings.apiDefault}"`
        )
      );
    }
    process.exit(0);
  }
  var { baseurl } = await toolbox.prompt.ask([
    {
      type: "input",
      name: "baseurl",
      message: "Porfavor digite aqui o novo baseURL da API da nodecloud",
    },
  ]);
  if (baseurl.startsWith("http://") || baseurl.startsWith("https://")) {
    const existence = await Database.document.exists("ApiBaseUrl", "Current");
    if (existence) {
      await Database.document.update("ApiBaseUrl", "Current", () => {
        return baseurl;
      });
    } else {
      await Database.document.add("ApiBaseUrl", "Current", baseurl);
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
  name: "baseurl",
  description: "Changes the API baseURL.",
  aliases: ["b", "https", "api"],
};
