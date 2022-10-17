const toolbox = require("gluegun");
console.log(toolbox.print.colors);
console.log(toolbox.print.colors.hidden("aaaaaaaa"));
const run = async () => {
  // text input
  const askAge = {
    type: "password",
    name: "age",
    message: "How old are you?",
  };

  // multiple choice
  const askShoe = {
    type: "select",
    name: "shoe",
    message: "What shoes are you wearing?",
    choices: ["Clown", "Other"],
  };
  // ask a series of questions
  const questions = [askAge, askShoe];
  const { age, shoe } = await toolbox.prompt.ask(questions);

  //------------------------------------------------------
};

run();
