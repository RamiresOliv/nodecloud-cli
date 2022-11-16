ApiUrl = "http://localhost:2552"; // default

checkURL = async () => {
  const r = await require("local-db-express").document.exists(
    "ApiBaseUrl",
    "Current"
  );

  if (r) {
    const getted = await require("local-db-express").document.get(
      "ApiBaseUrl",
      "Current"
    );
    ApiUrl = getted.document;
  }
};

const db = require("local-db-express");

db.collection.create("Auth");

// Selling this product is not allowed.
exports.checkAuth = async (toolbox, token) => {
  await checkURL();
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

exports.getAuth = async (toolbox) => {
  const existence = await db.document.exists("Auth", "MyToken");

  if (existence) {
    return { ok: true, token: await db.document.get("Auth", "MyToken") };
  } else return { ok: false, code: 404 };
};

exports.registerNewToken = async (toolbox, token) => {
  const { ok, data } = await exports.checkAuth(toolbox, token);
  if (ok) {
    if (data.exists) {
      const existence = await db.document.exists("Auth", "MyToken");
      await db.document.add(
        "Auth",
        "NoEdit",
        "Se caso queira editar o seu token faça no comando 'squidcloud login'!"
      );
      if (existence) {
        db.document.update("Auth", "MyToken", (oldValue) => {
          return token;
        });
      } else {
        await db.document.add("Auth", "MyToken", token);
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
