import { apiDefault, paths } from "./api/default.json";
import * as Database from "./database";

let ApiUrl = apiDefault; // default

const checkURL = async () => {
  const r = await Database.document.exists("ApiBaseUrl", "Current");

  if (r) {
    const getted = await Database.document.get("ApiBaseUrl", "Current");
    ApiUrl = getted.document;
  }
};

Database.collection.create("Auth");

// Selling this product is not allowed.
const checkAuthLocal = async (toolbox: any, token: string) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    ApiUrl + paths.auth.check,
    {},
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

export const checkAuth = checkAuthLocal;

export const getAuth = async (toolbox: any) => {
  const existence = await Database.document.exists("Auth", "MyToken");

  if (existence) {
    return {
      ok: true,
      token: await Database.document.get("Auth", "MyToken"),
    };
  } else return { ok: false, code: 404 };
};

export const registerNewToken = async (toolbox: any, token: string) => {
  const { ok, data } = await checkAuthLocal(toolbox, token);
  if (ok) {
    if (data.exists) {
      const existence = await Database.document.exists("Auth", "MyToken");
      await Database.document.add(
        "Auth",
        "NoEdit",
        "Se caso queira editar o seu token faça no comando 'nodecloud login'!"
      );
      if (existence) {
        Database.document.update("Auth", "MyToken", (oldValue: any) => {
          return token;
        });
      } else {
        await Database.document.add("Auth", "MyToken", token);
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
