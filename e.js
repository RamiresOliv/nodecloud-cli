const { FileWorker, Authentification, Temp, SquidApi } = require("./src/util");

SquidApi.api.post.up(
  require("gluegun"),
  "./file.txt",
  "test.txt",
  "7d192d92cf8809202dcbcdfcee447d65a66624ce926b2f207b75c024905373434092e0dd3e6d94ce61ba5abda4a1920cf034"
);
