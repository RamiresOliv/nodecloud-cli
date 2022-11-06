const { FileWorker, Authentification, Tempo, SquidApi } = require("./src/util");

SquidApi.api.post.bin
  .getMyProjects(
    require("gluegun"),
    "7d192d92cf8809202dcbcdfcee447d65a66624ce926b2f207b75c024905373434092e0dd3e6d94ce61ba5abda4a1920cf034"
  )
  .then((e) => {
    console.log(e.data.returns);
  });
