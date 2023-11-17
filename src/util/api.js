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

exports.api = {};
exports.api.post = {};
exports.api.get = {};

const { createWriteStream, appendFileSync, readFileSync } = require("fs");
const Tempo = require("./temp");

// Selling this product is not allowed.

// Api solvers
exports.api.post = {
  bin: {},
  ping: Function, // working
  up: Function, // working
  commit: Function, // working
  delete: Function, // working
  restart: Function, // non-disponible
  start: Function, // working
  stop: Function, // working
  apps: Function, // in-dev
  app: Function, // in-dev
  logs: Function, // working
};

exports.api.post.bin = {
  getProjectInfo: Function,
  getMyProjects: Function,
};

exports.api.get.bin = {
  getNodeVersion: Function,
  getPythonVersion: Function,
};

// Posts Functions:
exports.api.post.up = async (
  toolbox,
  CompactedProjectPath,
  fileName,
  token
) => {
  await checkURL();
  /*const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/do/@me/upload",
    [require("fs").readFileSync(CompactedProjectPath)],
    {
      headers: {
        ["Token"]: token,
        ["fileName"]: fileName,
      },
    }
  );*/

  const result = await require("axios")({
    method: "POST",
    url: ApiUrl + "/do/@me/upload",
    data: [require("fs").readFileSync(CompactedProjectPath)],
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      ["Token"]: token,
      ["fileName"]: fileName,
    },
  });
  return result;
};

exports.api.post.commit = async (
  toolbox,
  CompactedProjectPath,
  fileName,
  projectName,
  token
) => {
  await checkURL();
  /*const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  api.post();*/
  const result = await require("axios")({
    method: "POST",
    url: ApiUrl + "/do/@me/commit",
    data: [require("fs").readFileSync(CompactedProjectPath)],
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      ["Token"]: token,
      ["fileName"]: fileName,
      ["projectName"]: projectName.toLowerCase(),
    },
  });
  return result;
};

exports.api.post.delete = async (toolbox, AppName, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/delete",
    { appname: AppName.toLowerCase() },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.start = async (toolbox, AppName, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/start",
    { appname: AppName.toLowerCase() },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.logs = async (toolbox, AppName, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/do/@me/getLogs",
    { appname: AppName.toLowerCase() },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  if (!result.data.ok) {
    return result;
  }
  const buffered = Buffer.from(result.data.logs, "utf8");
  appendFileSync(
    Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log",
    buffered
  );
  appendFileSync(
    Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".txt",
    buffered
  );
  result.added = {};
  result.added.txtPath =
    Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".txt";
  result.added.logPath =
    Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log";
  result.added.translated = readFileSync(
    Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log",
    "utf8"
  );
  return result;
};

exports.api.post.start = async (toolbox, AppName, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/start",
    { appname: AppName.toLowerCase() },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.stop = async (toolbox, AppName, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/stop",
    { appname: AppName.toLowerCase() },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.bin.getMyProjects = async (toolbox, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/do/@me/getProjects",
    {},
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.bin.getProjectInfo = async (toolbox, AppName, token) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/do/@me/getProjectInfo",
    { appname: AppName.toLowerCase() },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.ping = async (toolbox) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post("/ping");
  return result;
};

// Get Functions:

exports.api.get.bin.getNodeVersion = async (toolbox) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: "https://nodejs.org",
  });
  const result = await api.get("/dist/index.json");
  return result;
};

exports.api.get.bin.getPythonVersion = async (toolbox) => {
  await checkURL();
  const api = toolbox.http.create({
    baseURL: "https://endoflife.date",
  });
  const result = await api.get("/api/python.json");
  return result;
};
