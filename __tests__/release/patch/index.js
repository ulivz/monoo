const {
  getVisibleReleaseStatusLog,
} = require("../../../lib/release/patch/helper");
const inquirer = require("inquirer");

(async function () {
  const log = getVisibleReleaseStatusLog(
    [
      {
        name: "@scope/foo",
        version: "2.1.2",
      },
      {
        name: "@scope/bar",
        version: "2.1.1",
      },
      {
        name: "@scope/baz",
        version: "2.1.2",
      },
      {
        name: "@scope/qux",
        version: "2.1.1",
      },
    ],
    "2.1.2",
    "next"
  );
  console.log(log);
  const { yes } = await inquirer.prompt([
    {
      name: "yes",
      message: "Continue to patch",
      type: "list",
      choices: ["N", "Y"],
    },
  ]);
})();
