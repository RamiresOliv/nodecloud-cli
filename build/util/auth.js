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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNewToken = exports.getAuth = exports.checkAuth = void 0;
const default_json_1 = require("./api/default.json");
const Database = __importStar(require("./database"));
var ApiUrl = default_json_1.apiDefault; // default
const checkURL = async () => {
    const r = await Database.document.exists("ApiBaseUrl", "Current");
    if (r) {
        const getted = await Database.document.get("ApiBaseUrl", "Current");
        ApiUrl = getted.document;
    }
};
Database.collection.create("Auth");
// Selling this product is not allowed.
const checkAuthLocal = async (toolbox, token) => {
    await checkURL();
    const api = toolbox.http.create({
        baseURL: ApiUrl,
    });
    const result = await api.post("/get/my/auth/@me/check", {}, {
        headers: {
            ["Token"]: token,
        },
    });
    return result;
};
exports.checkAuth = checkAuthLocal;
const getAuth = async (toolbox) => {
    const existence = await Database.document.exists("Auth", "MyToken");
    if (existence) {
        return {
            ok: true,
            token: await Database.document.get("Auth", "MyToken"),
        };
    }
    else
        return { ok: false, code: 404 };
};
exports.getAuth = getAuth;
const registerNewToken = async (toolbox, token) => {
    const { ok, data } = await checkAuthLocal(toolbox, token);
    if (ok) {
        if (data.exists) {
            const existence = await Database.document.exists("Auth", "MyToken");
            await Database.document.add("Auth", "NoEdit", "Se caso queira editar o seu token faça no comando 'nodecloud login'!");
            if (existence) {
                Database.document.update("Auth", "MyToken", (oldValue) => {
                    return token;
                });
            }
            else {
                await Database.document.add("Auth", "MyToken", token);
            }
            return [ok, data];
        }
        else {
            return [false, "O API Token não existe. Ou está invalido!"];
        }
    }
    else
        return [
            false,
            "Aconteceu algum problema na API, infelizmente não foi possivel continuar!",
        ];
};
exports.registerNewToken = registerNewToken;
