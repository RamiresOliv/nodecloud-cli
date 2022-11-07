const express = require("express");

const app = express();

app.listen(2552);

app.post("/do/@me/upload", (req, res) => {
  console.log("getted");
  res.send({
    ok: false,
    msg: "res.data.message",
    returns: { ok: true },
  });
});
