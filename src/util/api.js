exports.api = {};
exports.api.post = {};
ApiUrl = "http://localhost:2552";

const FormData = require("form-data");
const { createWriteStream } = require("fs");
const Tempo = require("./temp");

// Api solvers
exports.api.post = {
  bin: {},
  ping: Function,
  up: Function,
  commit: Function,
  restart: Function,
  start: Function,
  stop: Function,
  apps: Function,
  app: Function,
  logs: Function,
};

exports.api.post.bin = {
  getMyProjects: Function,
};

// Posts Functions:
exports.api.post.ping = async (toolbox) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post("/ping");
  return result;
};
exports.api.post.up = async (
  toolbox,
  CompactedProjectPath,
  fileName,
  token
) => {
  const api = toolbox.http.create({
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
  );
  console.log(result.data);
  return result;
};

exports.api.post.commit = async (
  toolbox,
  CompactedProjectPath,
  fileName,
  projectName,
  token
) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/do/@me/commit",
    [require("fs").readFileSync(CompactedProjectPath)],
    {
      headers: {
        ["Token"]: token,
        ["fileName"]: fileName,
        ["projectName"]: projectName,
      },
    }
  );
  return result;
};

exports.api.post.logs = async (toolbox, AppName, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = await api.post(
    "/do/@me/getLogs",
    { appname: AppName },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  const buffered = Buffer.from(result.data.logs, "utf8");
  const a = createWriteStream(
    Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log"
  );
  console.log(buffered);
  a.write(buffered);
  a.close();
  return result.data.logs;
};

exports.api.post.start = async (toolbox, AppName, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/start",
    { appname: AppName },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.stop = async (toolbox, AppName, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/stop",
    { appname: AppName },
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.bin.getMyProjects = async (toolbox, token) => {
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

// Get Functions:
