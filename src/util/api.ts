import { apiDefault, paths } from "./api/default.json"; //const { apiDefault } = require("./api/default.json");
let ApiUrl = apiDefault; // default for tests: http://localhost:2552, for normal use: https://nodecloud-api.ramiresoliv.repl.co

import { createWriteStream, appendFileSync, readFileSync } from "fs";
import { Tempo } from ".";
import * as Database from "./database";
import axios from "axios";
import * as https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const checkURL = async () => {
  const r = await Database.document.exists("ApiBaseUrl", "Current");

  if (r) {
    const getted = await Database.document.get("ApiBaseUrl", "Current");
    ApiUrl = getted.document;
  }
};
export const api = {
  post: {
    bin: {
      getProjectInfo: async (toolbox: any, AppName: string, token: string) => {
        await checkURL();
        const api = toolbox.http.create({
          baseURL: ApiUrl,
        });
        const result = await api.post(
          paths.getApp,
          { appname: AppName.toLowerCase() },
          {
            headers: {
              ["Token"]: token,
            },
          }
        );
        return result;
      },
      getMyProjects: async (toolbox: any, token: string) => {
        await checkURL();
        const api = toolbox.http.create({
          baseURL: ApiUrl,
        });
        const result = await api.post(
          paths.getApps,
          {},
          {
            headers: {
              ["Token"]: token,
            },
          }
        );
        return result;
      },
    },

    ping: async (toolbox: any) => {
      await checkURL();
      const api = toolbox.http.create({
        baseURL: ApiUrl,
      });
      const result = api.post(paths.ping);
      return result;
    },
    up: async (
      toolbox: any,
      CompactedProjectPath: string,
      fileName: string,
      token: string
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

      const result = await axios.post(
        ApiUrl + paths.upload,

        [require("fs").readFileSync(CompactedProjectPath)],
        {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ["Token"]: token,
            ["fileName"]: fileName,
          },
          httpsAgent: agent,
        }
      );
      return result;
    },
    commit: async (
      toolbox: any,
      CompactedProjectPath: string,
      fileName: string,
      projectName: string,
      token: string
    ) => {
      await checkURL();
      /*const api = toolbox.http.create({
        baseURL: ApiUrl,
      });
      api.post();*/
      const result = await axios.post(
        ApiUrl + paths.commit,

        [require("fs").readFileSync(CompactedProjectPath)],
        {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ["Token"]: token,
            ["fileName"]: fileName,
            ["projectName"]: projectName.toLowerCase(),
          },
          httpsAgent: agent,
        }
      );
      return result;
    },
    delete: async (toolbox: any, AppName: string, token: string) => {
      await checkURL();
      const api = toolbox.http.create({
        baseURL: ApiUrl,
      });
      const result = api.post(
        paths.delete,
        { appname: AppName.toLowerCase() },
        {
          headers: {
            ["Token"]: token,
          },
        }
      );
      return result;
    },
    restart: Function,
    start: async (toolbox: any, AppName: string, token: string) => {
      await checkURL();
      const api = toolbox.http.create({
        baseURL: ApiUrl,
      });
      const result = api.post(
        paths.start,
        { appname: AppName.toLowerCase() },
        {
          headers: {
            ["Token"]: token,
          },
        }
      );
      return result;
    },
    stop: async (toolbox: any, AppName: string, token: string) => {
      await checkURL();
      const api = toolbox.http.create({
        baseURL: ApiUrl,
      });
      const result = api.post(
        paths.stop,
        { appname: AppName.toLowerCase() },
        {
          headers: {
            ["Token"]: token,
          },
        }
      );
      return result;
    },
    apps: Function,
    app: Function,
    logs: async (toolbox: any, AppName: string, token: string) => {
      await checkURL();
      const api = toolbox.http.create({
        baseURL: ApiUrl,
      });
      const result = await api.post(
        paths.getLogs,
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
    },
  },
  get: {
    bin: {
      getNodeVersion: async (toolbox: any) => {
        await checkURL();
        const api = toolbox.http.create({
          baseURL: "https://nodejs.org",
        });
        const result = await api.get("/dist/index.json");
        return result;
      },
      getPythonVersion: async (toolbox: any) => {
        await checkURL();
        const api = toolbox.http.create({
          baseURL: "https://endoflife.date",
        });
        const result = await api.get("/api/python.json");
        return result;
      },
      getRubyVersion: async (toolbox: any) => {
        await checkURL();
        const api = toolbox.http.create({
          baseURL: "https://endoflife.date",
        });
        const result = await api.get("/api/ruby.json");
        return result;
      },
    },
  },
};
