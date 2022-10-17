ApiUrl = "http://localhost:8080";

const db = require("local-db-express");

db.collection.create("cli-Auth");

exports.checkAuth = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/get/my/auth/@me/check",
    {},
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.getAuth = async (toolbox, token) => {
  const existence = await db.document.exists("cli-Auth", "MyToken");

  if (existence) {
    return await db.document.get("cli-Auth", "MyToken");
  } else return { ok: false, code: 404 };
};

exports.registerNewToken = async (toolbox, token) => {
  const { ok, data } = await exports.checkAuth(toolbox, token);
  if (ok) {
    if (data.exists) {
      const existence = await db.document.exists("cli-Auth", "MyToken");
      if (existence) {
        db.document.update("cli-Auth", "MyToken", (oldValue) => {
          return token;
        });
      } else {
        db.document.add("cli-Auth", "MyToken", token);
      }
      return [ok, data];
    } else {
      return [false, "O API Token não existe. Ou está invalido!"];
    }
  } else
    return [
      false,
      "Aconteceu algum problema na API, infelizmente não foi possivel continuar!",
    ];
};
