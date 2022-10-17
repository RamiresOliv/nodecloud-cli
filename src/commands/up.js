exports.run = async () => {
  console.log("called3");
};

exports.config = {
  name: "up",
  description: "Executes a remote up request to the Cloud.",
  aliases: ["u", "upload"],
};
