"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const default_json_1 = require("./api/default.json"); //const { apiDefault } = require("./api/default.json");
var ApiUrl = default_json_1.apiDefault; // default for tests: http://localhost:2552, for normal use: https://nodecloud-api.ramiresoliv.repl.co
const fs_1 = require("fs");
const _1 = require(".");
const axios_1 = __importDefault(require("axios"));
const https = __importStar(require("https"));
const agent = new https.Agent({
    rejectUnauthorized: false,
});
const checkURL = async () => {
    const r = await require("local-db-express").document.exists("ApiBaseUrl", "Current");
    if (r) {
        const getted = await require("local-db-express").document.get("ApiBaseUrl", "Current");
        ApiUrl = getted.document;
    }
};
exports.api = {
    post: {
        bin: {
            getProjectInfo: async (toolbox, AppName, token) => {
                await checkURL();
                const api = toolbox.http.create({
                    baseURL: ApiUrl,
                });
                const result = await api.post(default_json_1.paths.getApp, { appname: AppName.toLowerCase() }, {
                    headers: {
                        ["Token"]: token,
                    },
                });
                return result;
            },
            getMyProjects: async (toolbox, token) => {
                await checkURL();
                const api = toolbox.http.create({
                    baseURL: ApiUrl,
                });
                const result = await api.post(default_json_1.paths.getApps, {}, {
                    headers: {
                        ["Token"]: token,
                    },
                });
                return result;
            },
        },
        ping: async (toolbox) => {
            await checkURL();
            const api = toolbox.http.create({
                baseURL: ApiUrl,
            });
            const result = api.post(default_json_1.paths.ping);
            return result;
        },
        up: async (toolbox, CompactedProjectPath, fileName, token) => {
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
            const result = await axios_1.default.post(ApiUrl + default_json_1.paths.upload, [require("fs").readFileSync(CompactedProjectPath)], {
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                    ["Token"]: token,
                    ["fileName"]: fileName,
                },
                httpsAgent: agent,
            });
            return result;
        },
        commit: async (toolbox, CompactedProjectPath, fileName, projectName, token) => {
            await checkURL();
            /*const api = toolbox.http.create({
              baseURL: ApiUrl,
            });
            api.post();*/
            const result = await axios_1.default.post(ApiUrl + default_json_1.paths.commit, [require("fs").readFileSync(CompactedProjectPath)], {
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                    ["Token"]: token,
                    ["fileName"]: fileName,
                    ["projectName"]: projectName.toLowerCase(),
                },
                httpsAgent: agent,
            });
            return result;
        },
        delete: async (toolbox, AppName, token) => {
            await checkURL();
            const api = toolbox.http.create({
                baseURL: ApiUrl,
            });
            const result = api.post(default_json_1.paths.delete, { appname: AppName.toLowerCase() }, {
                headers: {
                    ["Token"]: token,
                },
            });
            return result;
        },
        restart: Function,
        start: async (toolbox, AppName, token) => {
            await checkURL();
            const api = toolbox.http.create({
                baseURL: ApiUrl,
            });
            const result = api.post(default_json_1.paths.start, { appname: AppName.toLowerCase() }, {
                headers: {
                    ["Token"]: token,
                },
            });
            return result;
        },
        stop: async (toolbox, AppName, token) => {
            await checkURL();
            const api = toolbox.http.create({
                baseURL: ApiUrl,
            });
            const result = api.post(default_json_1.paths.stop, { appname: AppName.toLowerCase() }, {
                headers: {
                    ["Token"]: token,
                },
            });
            return result;
        },
        apps: Function,
        app: Function,
        logs: async (toolbox, AppName, token) => {
            await checkURL();
            const api = toolbox.http.create({
                baseURL: ApiUrl,
            });
            const result = await api.post(default_json_1.paths.getLogs, { appname: AppName.toLowerCase() }, {
                headers: {
                    ["Token"]: token,
                },
            });
            if (!result.data.ok) {
                return result;
            }
            const buffered = Buffer.from(result.data.logs, "utf8");
            (0, fs_1.appendFileSync)(_1.Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log", buffered);
            (0, fs_1.appendFileSync)(_1.Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".txt", buffered);
            result.added = {};
            result.added.txtPath =
                _1.Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".txt";
            result.added.logPath =
                _1.Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log";
            result.added.translated = (0, fs_1.readFileSync)(_1.Tempo.download + "/final-logs-" + AppName.toLowerCase() + ".log", "utf8");
            return result;
        },
    },
    get: {
        bin: {
            getNodeVersion: async (toolbox) => {
                await checkURL();
                const api = toolbox.http.create({
                    baseURL: "https://nodejs.org",
                });
                const result = await api.get("/dist/index.json");
                return result;
            },
            getPythonVersion: async (toolbox) => {
                await checkURL();
                const api = toolbox.http.create({
                    baseURL: "https://endoflife.date",
                });
                const result = await api.get("/api/python.json");
                return result;
            },
            getRubyVersion: async (toolbox) => {
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
