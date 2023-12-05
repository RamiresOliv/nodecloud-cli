"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const local_db_express_1 = __importDefault(require("local-db-express"));
exports.run = async (toolbox, args) => {
    local_db_express_1.default.collection.create("ApiBaseUrl");
    if ((args[2] != null && args[2].toLowerCase() == "-rm") ||
        (args[2] != null && args[2].toLowerCase() == "-remove") ||
        (args[2] != null && args[2].toLowerCase() == "-default") ||
        (args[2] != null && args[2].toLowerCase() == "--rm") ||
        (args[2] != null && args[2].toLowerCase() == "--remove") ||
        (args[2] != null && args[2].toLowerCase() == "--default")) {
        await local_db_express_1.default.document.delete("ApiBaseUrl", "Current");
        toolbox.print.info("Cleared API baseUrl. And backed to default.");
    }
    var { baseurl } = await toolbox.prompt.ask([
        {
            type: "input",
            name: "baseurl",
            message: "Porfavor digite aqui o novo baseURL da API da nodecloud",
        },
    ]);
    if (baseurl.startsWith("http://") || baseurl.startsWith("https://")) {
        const existence = await local_db_express_1.default.document.exists("ApiBaseUrl", "Current");
        if (existence) {
            await local_db_express_1.default.document.update("ApiBaseUrl", "Current", () => {
                return baseurl;
            });
        }
        else {
            await local_db_express_1.default.document.add("ApiBaseUrl", "Current", baseurl);
        }
        toolbox.print.info("Added new API baseUrl!");
    }
    else {
        toolbox.print.error("O URL da API precisa ser um URL Válido! com https! Ex: 'https://github.com'/'http://localhost:25565'");
        process.exit(0);
    }
};
exports.config = {
    name: "baseurl",
    description: "Changes the API baseURL.",
    aliases: ["b", "https", "api"],
};
