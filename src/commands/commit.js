exports.run = async () => {
  console.log("called2");
};

exports.config = {
  name: "commit",
  description: "Executes a remote commit request to the Cloud.",
  aliases: ["c"],
};
