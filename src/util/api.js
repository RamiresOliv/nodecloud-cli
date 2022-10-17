exports.api = {};
ApiUrl = "http://localhost:8080";

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
  apps: Function,
  app: Function,
  logs: Function,
};

// Posts Functions:
exports.api.post.ping = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post("/ping");
  return result;
};
exports.api.post.up = async (toolbox, token) => {
  const api = toolbox.http.create({
    baseURL: ApiUrl,
  });
  const result = api.post(
    "/upload",
    {},
    {
      headers: {
        ["@tokenauth: my-user-auth"]: token,
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
    "/commit",
    {},
    {
      headers: {
        ["@tokenauth: my-user-auth"]: token,
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
    "/restart",
    {},
    {
      headers: {
        ["@tokenauth: my-user-auth"]: token,
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
    "/start",
    {},
    {
      headers: {
        ["@tokenauth: my-user-auth"]: token,
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
    "/stop",
    {},
    {
      headers: {
        ["@tokenauth: my-user-auth"]: token,
      },
    }
  );
  return result;
};
