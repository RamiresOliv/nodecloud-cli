const toolbox = require("gluegun");
console.log(toolbox.print.colors);
console.log(toolbox.print.colors.hidden("aaaaaaaa"));
const run = async () => {
  // multiple choice
  const askShoe = {
    type: "select",
    name: "shoe",
    message: "What shoes are you wearing?",
    choices: ["Clown", "Other"],
  };
  // ask a series of questions
  const questions = [askShoe];
  const e = await toolbox.prompt.ask(questions);
  console.log(e);
  //------------------------------------------------------
};

run();
