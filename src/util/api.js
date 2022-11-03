exports.api = {};
ApiUrl = "http://localhost:8080";

const FormData = require("form-data");

// Api solvers
exports.api.post = {
  ping: Function,
  up: Function,
  commit: Function,
  restart: Function,
  start: Function,
  stop: Function,
};

exports.api.get = {
  getApps: Function,
  apps: Function,
  app: Function,
  logs: Function,
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
  const form = new FormData();
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
  return result;
};

exports.api.post.commit = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/commit",
    {},
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.restart = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/restart",
    {},
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.start = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/start",
    {},
    {
      headers: {
        ["Token"]: token,
      },
    }
  );
  return result;
};

exports.api.post.stop = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/do/@me/stop",
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

